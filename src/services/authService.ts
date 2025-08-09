import { SignupRequest, supabase, User, UserProfile } from '../lib/supabase';

export class AuthService {
  // Sign up new user
  static async signUp(userData: SignupRequest) {
    try {
      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            date_of_birth: userData.date_of_birth,
            gender: userData.gender,
            national_id: userData.national_id,
          },
        },
      });

      if (error) throw error;

      console.log('SignUp result:', data);

      // If user was created successfully, try to create user profile
      if (data.user) {
        // Wait a moment for the user to be fully created
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 1: Create user in custom users table
        console.log('Creating user in custom users table...');
        const { data: userCreateData, error: userCreateError } = await supabase.rpc('create_user', {
          p_id: data.user.id,
          p_email: userData.email,
          p_phone: userData.phone,
          p_full_name: userData.full_name,
          p_date_of_birth: userData.date_of_birth,
          p_gender: userData.gender,
          p_national_id: userData.national_id,
        });
        
        if (userCreateError) {
          console.error('User creation in custom table failed:', userCreateError.message);
          // Check if user already exists (might happen on retry)
          if (userCreateError.message.includes('already exists') || userCreateError.message.includes('duplicate')) {
            console.log('User already exists in custom table, continuing...');
          } else {
            console.error('Failed to create user in custom table:', userCreateError.message);
            // Continue anyway - user was created in auth table
          }
        } else {
          console.log('User created successfully in custom table!');
        }
        
        // Step 2: Try to create user profile - this might fail due to RLS, but user is already created
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              treatment_start_date: userData.treatment_start_date,
              current_day: 0,
              total_points: 0,
              streak_days: 0,
              treatment_phase: 'Intensive',
              health_facility: userData.health_facility,
              doctor_name: userData.doctor_name,
              tb_type: userData.tb_type,
              medication_combination: userData.medication_combination,
              comorbidities: userData.comorbidities,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Profile creation failed, but user was created successfully
            // We'll handle this in the sign-in process
          } else {
            // Schedule sputum collection reminders
            try {
              await this.scheduleSputumReminders(data.user.id);
            } catch (reminderError) {
              console.error('Sputum reminder scheduling error:', reminderError);
            }
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Continue anyway - user was created successfully
        }
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign up and sign in user (for immediate access)
  static async signUpAndSignIn(userData: SignupRequest) {
    try {
      console.log('Starting signUpAndSignIn process...');
      
      // First, sign up the user
      const signUpResult = await this.signUp(userData);
      console.log('SignUp completed:', signUpResult);
      
      if (signUpResult.user) {
        console.log('User created successfully, attempting to sign in...');
        
        // Wait a bit for the user to be fully created and propagated
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if email confirmation is required
        if (signUpResult.user.email_confirmed_at) {
          console.log('Email already confirmed, proceeding with sign in');
        } else {
          console.log('Email confirmation required, but proceeding anyway for testing');
          // In a real app, you might want to wait for email confirmation
          // For now, we'll proceed anyway
        }
        
        // Then immediately sign in the user
        const signInResult = await this.signIn(userData.email, userData.password);
        console.log('SignIn completed:', signInResult);
        
        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now that we're authenticated, try to create the user profile
        if (signInResult.user) {
          try {
            // Check if profile already exists
            const { data: existingProfile, error: checkError } = await supabase
              .from('user_profiles')
              .select('id')
              .eq('user_id', signInResult.user.id)
              .single();

            if (checkError && checkError.code !== 'PGRST116') {
              console.error('Error checking existing profile:', checkError);
            }

            if (!existingProfile) {
              console.log('Creating user profile...');
              // Use the RPC function to create user profile
              const { data: rpcResult, error: rpcError } = await supabase.rpc('create_user_profile', {
                p_user_id: signInResult.user.id,
                p_treatment_start_date: userData.treatment_start_date,
                p_health_facility: userData.health_facility,
                p_doctor_name: userData.doctor_name,
                p_tb_type: userData.tb_type,
                p_medication_combination: userData.medication_combination,
                p_comorbidities: userData.comorbidities,
              });

              if (rpcError) {
                console.error('Profile creation error after sign-in (RPC):', rpcError);
                // If RPC fails, try direct insert as fallback
                const { error: profileError } = await supabase
                  .from('user_profiles')
                  .insert({
                    user_id: signInResult.user.id,
                    treatment_start_date: userData.treatment_start_date,
                    current_day: 0,
                    total_points: 0,
                    streak_days: 0,
                    treatment_phase: 'Intensive',
                    health_facility: userData.health_facility,
                    doctor_name: userData.doctor_name,
                    tb_type: userData.tb_type,
                    medication_combination: userData.medication_combination,
                    comorbidities: userData.comorbidities,
                  });

                if (profileError) {
                  console.error('Profile creation error after sign-in (fallback):', profileError);
                  // If profile creation fails due to RLS, we'll try a different approach
                  // We can create the profile later when the user accesses the dashboard
                  console.log('Profile creation failed due to RLS, will create later when needed.');
                } else {
                  console.log('User profile created successfully via fallback');
                  // Schedule sputum collection reminders
                  try {
                    await this.scheduleSputumReminders(signInResult.user.id);
                  } catch (reminderError) {
                    console.error('Sputum reminder scheduling error:', reminderError);
                  }
                }
              } else {
                console.log('User profile created successfully via RPC');
              }
            } else {
              console.log('User profile already exists');
            }
          } catch (profileError) {
            console.error('Profile creation failed after sign-in:', profileError);
            // Continue anyway - user is authenticated
            console.log('Profile creation failed, but user is authenticated. Will create profile later.');
          }
        }
        
        // Verify the session was created
        const session = await this.getCurrentSession();
        if (session) {
          console.log('Session verified:', session.user?.email);
        } else {
          console.log('No session found after sign in');
        }
        
        return signInResult;
      }
      
      return signUpResult;
    } catch (error) {
      console.error('SignUpAndSignIn error:', error);
      throw error;
    }
  }

  // Sign in user
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  // Get current user
  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  // Get current session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }

  // Get user dashboard data
  static async getUserDashboard(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user dashboard error:', error);
      throw error;
    }
  }

  // Update user information
  static async updateUserInfo(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user info error:', error);
      throw error;
    }
  }

  // Schedule sputum collection reminders
  static async scheduleSputumReminders(userId: string) {
    try {
      const { error } = await supabase.rpc('schedule_sputum_reminders', {
        p_user_id: userId,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Schedule sputum reminders error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Check and refresh session if needed
  static async checkAndRefreshSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        // Check if session is expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          // Session is expired, try to refresh
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
          return refreshData.session;
        }
        return session;
      }
      
      return null;
    } catch (error) {
      console.error('Check and refresh session error:', error);
      return null;
    }
  }

  // Verify session exists and retry if needed
  static async verifySession(retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      const session = await this.getCurrentSession();
      if (session) {
        console.log('Session verified on attempt:', i + 1);
        return session;
      }
      
      if (i < retries - 1) {
        console.log(`Session not found, retrying in ${delay}ms... (attempt ${i + 2}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log('Session verification failed after all retries');
    return null;
  }

  // Reset password
  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'smartb://reset-password',
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  // Delete user account
  static async deleteAccount() {
    try {
      const { error } = await supabase.auth.admin.deleteUser(
        (await this.getCurrentUser())?.id || ''
      );

      if (error) throw error;
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }

  // Create user profile if it doesn't exist
  static async ensureUserProfile(userId: string, treatmentStartDate: string, medicalData?: {
    health_facility?: string;
    doctor_name?: string;
    tb_type?: string;
    medication_combination?: string;
    comorbidities?: string;
  }) {
    try {
      // First, check if user exists in custom users table
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userCheckError && userCheckError.code === 'PGRST116') {
        // User doesn't exist in custom table, we need to create them
        console.log('User not found in custom users table, creating...');
        
        // Get user data from auth.users (we'll need to get this from the current session or user metadata)
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (authUser && authUser.id === userId) {
          const { data: userCreateData, error: userCreateError } = await supabase.rpc('create_user', {
            p_id: userId,
            p_email: authUser.email || '',
            p_phone: authUser.phone || '',
            p_full_name: authUser.user_metadata?.full_name || '',
            p_date_of_birth: authUser.user_metadata?.date_of_birth || null,
            p_gender: authUser.user_metadata?.gender || '',
            p_national_id: authUser.user_metadata?.national_id || '',
          });
          
          if (userCreateError) {
            console.error('Failed to create user in custom table:', userCreateError.message);
            // Continue anyway - we'll try to create the profile
          } else {
            console.log('User created successfully in custom table');
          }
        } else {
          console.error('Could not get user data from auth to create custom user record');
        }
      } else if (userCheckError) {
        console.error('Error checking existing user:', userCheckError);
      }

      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it using the RPC function
        console.log('Creating user profile for user:', userId);
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_user_profile', {
          p_user_id: userId,
          p_treatment_start_date: treatmentStartDate,
          p_health_facility: medicalData?.health_facility || null,
          p_doctor_name: medicalData?.doctor_name || null,
          p_tb_type: medicalData?.tb_type || null,
          p_medication_combination: medicalData?.medication_combination || null,
          p_comorbidities: medicalData?.comorbidities || null,
        });

        if (rpcError) {
          console.error('Profile creation error in ensureUserProfile (RPC):', rpcError);
          // If RPC fails, try direct insert as fallback
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: userId,
                treatment_start_date: treatmentStartDate,
                current_day: 0,
                total_points: 0,
                streak_days: 0,
                treatment_phase: 'Intensive',
                health_facility: medicalData?.health_facility || null,
                doctor_name: medicalData?.doctor_name || null,
                tb_type: medicalData?.tb_type || null,
                medication_combination: medicalData?.medication_combination || null,
                comorbidities: medicalData?.comorbidities || null,
              });

            if (profileError) {
              console.error('Fallback profile creation also failed:', profileError);
              throw profileError;
            } else {
              console.log('User profile created successfully via fallback');
              // Schedule sputum collection reminders
              try {
                await this.scheduleSputumReminders(userId);
              } catch (reminderError) {
                console.error('Sputum reminder scheduling error:', reminderError);
              }
            }
          } catch (fallbackError) {
            console.error('All profile creation methods failed:', fallbackError);
            throw fallbackError;
          }
        } else {
          console.log('User profile created successfully via RPC');
        }
      } else if (checkError) {
        console.error('Error checking existing profile in ensureUserProfile:', checkError);
        // Don't throw error here, just log it
      }
    } catch (error) {
      console.error('ensureUserProfile error:', error);
      // Don't throw error here, just log it and continue
      console.log('ensureUserProfile failed, but continuing...');
    }
  }
}
