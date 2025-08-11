import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignupRequest, supabase, User, UserProfile } from '../lib/supabase';

export class AuthService {
  // Sign up new user (phone-only, no Supabase auth)
  static async signUp(userData: SignupRequest) {
    try {
      console.log('Starting phone-only registration...');
      
      // Generate a UUID for the user
      const userId = this.generateUUID();
      
      // Step 1: Create user directly in custom users table
      console.log('Creating user in custom users table...');
      const { data: userCreateData, error: userCreateError } = await supabase.rpc('create_user', {
        p_id: userId,
        p_phone: userData.phone,
        p_password: userData.password,
        p_full_name: userData.full_name,
        p_nickname: userData.nickname,
        p_date_of_birth: userData.date_of_birth,
        p_gender: userData.gender,
        p_national_id: userData.national_id,
      });
      
      if (userCreateError) {
        console.error('User creation in custom table failed:', userCreateError.message);
        if (userCreateError.message.includes('already exists') || userCreateError.message.includes('duplicate')) {
          throw new Error('Nomor telepon sudah terdaftar');
        } else {
          throw new Error(`Gagal membuat akun: ${userCreateError.message}`);
        }
      }
      
      console.log('User created successfully in custom table!');
      
      // Step 2: Create user profile
      console.log('Creating user profile...');
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: userId,
        p_treatment_start_date: userData.treatment_start_date,
        p_health_facility: userData.health_facility,
        p_doctor_name: userData.doctor_name,
        p_tb_type: userData.tb_type,
        p_medication_combination: userData.medication_combination,
        p_comorbidities: userData.comorbidities,
      });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Gagal membuat profil: ${profileError.message}`);
      }
      
      console.log('User profile created successfully!');
      
      // Schedule sputum collection reminders
      try {
        await this.scheduleSputumReminders(userId);
      } catch (reminderError) {
        console.error('Sputum reminder scheduling error:', reminderError);
      }

      // Create mock user object for return
      const mockUser = {
        id: userId,
        phone: userData.phone,
        full_name: userData.full_name,
        nickname: userData.nickname || '',
        date_of_birth: userData.date_of_birth,
        gender: userData.gender,
        national_id: userData.national_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return { user: mockUser };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Auto register and sign in user (phone-only, simplified)
  static async autoRegisterAndSignIn(userData: SignupRequest) {
    try {
      console.log('Starting phone-only auto register and sign in process...');
      
      // Step 1: Register user
      const signUpResult = await this.signUp(userData);
      console.log('SignUp completed:', signUpResult);
      
      if (!signUpResult.user) {
        throw new Error('Gagal membuat akun');
      }
      
      console.log('User created successfully:', signUpResult.user.phone);
      
      // Step 2: Wait a moment for user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Try to sign in immediately
      try {
        console.log('Attempting auto sign-in...');
        const signInResult = await this.signIn(userData.phone, userData.password);
        console.log('Auto sign-in successful:', signInResult.user?.phone);
        
        return {
          user: signInResult.user,
          session: signInResult.session,
          success: true,
          message: 'Registrasi dan login berhasil',
          requiresEmailConfirmation: false
        };
      } catch (signInError) {
        console.log('Auto sign-in failed, but user was created:', signInError);
        
        return {
          user: signUpResult.user,
          session: null,
          success: true,
          message: 'Registrasi berhasil, silakan login',
          requiresEmailConfirmation: false
        };
      }
      
    } catch (error) {
      console.error('Auto register and sign in error:', error);
      throw error;
    }
  }

  // Sign in user (phone-only)
  static async signIn(phone: string, password: string) {
    try {
      console.log('Attempting phone-only login...');
      
      // Check if user exists in custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError || !userData) {
        console.log('User not found:', userError?.message || 'No user data');
        throw new Error('Nomor telepon atau password salah');
      }

      console.log('User found in custom table:', userData.phone);

      // Verify password using RPC function
      console.log('Verifying password...');
      const { data: verificationResult, error: verifyError } = await supabase.rpc('verify_user_password', {
        p_phone: phone,
        p_password: password
      });

      if (verifyError || !verificationResult || !verificationResult[0]?.is_valid) {
        console.log('Password verification failed:', verifyError?.message || 'Invalid password');
        throw new Error('Nomor telepon atau password salah');
      }
      
      console.log('Password verified successfully');

      // Create custom session
      const sessionData = {
        user: userData,
        access_token: `custom_${userData.id}`,
        refresh_token: `refresh_${userData.id}`,
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        token_type: 'bearer',
      };

      // Store session in AsyncStorage
      await this.storeCustomSession(sessionData);
      
      console.log('Phone login successful');
      
      return {
        user: userData,
        session: sessionData,
        success: true,
        message: 'Login berhasil'
      };
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out user
  static async signOut() {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase sign out error:', error);
      }
      
      // Clear custom session
      try {
        await AsyncStorage.removeItem('smartb_custom_session');
        await AsyncStorage.removeItem('smartb_custom_user');
        console.log('Custom session cleared');
      } catch (customError) {
        console.error('Failed to clear custom session:', customError);
      }
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  // Get current user (phone-only, no Supabase auth)
  static async getCurrentUser() {
    try {
      // Check for custom session only
      console.log('Checking for custom session...');
      const customSession = await this.getCustomSession();
      if (customSession && customSession.user) {
        console.log('Custom user found:', customSession.user.id);
        return customSession.user;
      }
      
      console.log('No valid user session found');
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // Get current session (custom session only)
  static async getCurrentSession() {
    try {
      // Check for custom session only
      console.log('Checking for custom session...');
      const customSession = await this.getCustomSession();
      if (customSession) {
        console.log('Custom session found');
        return customSession;
      }
      
      return null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
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

      if (error) {
        // If dashboard doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('User dashboard not found, creating...');
          const { data: newDashboard, error: createError } = await supabase
            .from('user_dashboard')
            .insert({
              user_id: userId,
              current_day: 0,
              total_points: 0,
              streak_days: 0,
              treatment_phase: 'Intensive'
            })
            .select()
            .single();
          
          if (createError) throw createError;
          return newDashboard;
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Get user dashboard error:', error);
      throw error;
    }
  }

  // Update user dashboard
  static async updateUserDashboard(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('user_dashboard')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update user dashboard error:', error);
      throw error;
    }
  }

  // Get daily inputs
  static async getDailyInputs(userId: string, date?: string) {
    try {
      let query = supabase
        .from('daily_inputs')
        .select('*')
        .eq('user_id', userId);
      
      if (date) {
        query = query.eq('input_date', date);
      }
      
      const { data, error } = await query.order('input_date', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get daily inputs error:', error);
      throw error;
    }
  }

  // Create or update daily input
  static async createDailyInput(userId: string, inputData: {
    input_date: string;
    medication_taken: boolean;
    side_effects?: string;
    mood_rating?: number;
    notes?: string;
  }) {
    try {
      // Check if input already exists for this date
      const { data: existingInput } = await supabase
        .from('daily_inputs')
        .select('id')
        .eq('user_id', userId)
        .eq('input_date', inputData.input_date)
        .single();

      if (existingInput) {
        // Update existing input
        const { data, error } = await supabase
          .from('daily_inputs')
          .update(inputData)
          .eq('id', existingInput.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new input
        const { data, error } = await supabase
          .from('daily_inputs')
          .insert({
            user_id: userId,
            ...inputData
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Create daily input error:', error);
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
      // Try to schedule reminders using RPC function
      const { error } = await supabase.rpc('schedule_sputum_reminders', {
        p_user_id: userId,
      });

      if (error) {
        console.log('RPC schedule_sputum_reminders failed, skipping reminder scheduling:', error.message);
        // Don't throw error, just log it and continue
        return;
      }
      
      console.log('Sputum reminders scheduled successfully');
    } catch (error) {
      console.log('Schedule sputum reminders error (non-critical):', error);
      // Don't throw error, just log it and continue
    }
  }

  // Custom login method (phone-only) 
  static async customLogin(phone: string, password: string) {
    try {
      console.log('Attempting custom phone login...');
      
      // Check if user exists in custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single();

      if (userError || !userData) {
        console.log('User not found in custom table:', userError?.message || 'No user data');
        throw new Error('Nomor telepon atau password salah');
      }

      console.log('User found in custom table:', userData.phone);

      // Verify password using RPC function
      console.log('Verifying password...');
      const { data: verificationResult, error: verifyError } = await supabase.rpc('verify_user_password', {
        p_phone: phone,
        p_password: password
      });

      if (verifyError || !verificationResult || !verificationResult[0]?.is_valid) {
        console.log('Password verification failed:', verifyError?.message || 'Invalid password');
        throw new Error('Nomor telepon atau password salah');
      }
      
      console.log('Password verified successfully');

      // Create custom session
      const sessionData = {
        user: userData,
        access_token: `custom_${userData.id}`,
        refresh_token: `refresh_${userData.id}`,
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
        token_type: 'bearer',
      };

      // Store session in AsyncStorage
      await this.storeCustomSession(sessionData);
      
      console.log('Custom phone login successful');
      
      return {
        user: userData,
        session: sessionData,
        success: true,
        message: 'Login berhasil'
      };

    } catch (error) {
      console.error('Custom phone login error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      // First, check Supabase session
      const session = await this.getCurrentSession();
      if (session) {
        return true;
      }
      
      // If no session, check for custom session
      const customSession = await this.getCustomSession();
      if (customSession && customSession.user) {
        return true;
      }
      
      return false;
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
            p_nickname: authUser.user_metadata?.nickname || null,
            p_date_of_birth: authUser.user_metadata?.date_of_birth || null,
            p_gender: authUser.user_metadata?.gender || '',
            p_national_id: authUser.user_metadata?.national_id || '',
          });
          
          if (userCreateError) {
            console.error('Failed to create user in custom table:', userCreateError.message);
            if (userCreateError.message.includes('is_active')) {
              console.log('is_active column error in ensureUserProfile - continuing with profile creation');
            }
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
          throw rpcError;
        } else {
          console.log('User profile created successfully via RPC');
          // Schedule sputum collection reminders
          try {
            await this.scheduleSputumReminders(userId);
          } catch (reminderError) {
            console.error('Sputum reminder scheduling error:', reminderError);
          }
        }
      } else if (checkError) {
        console.error('Error checking existing profile:', checkError);
        throw checkError;
      } else {
        console.log('User profile already exists');
      }
    } catch (error) {
      console.error('ensureUserProfile error:', error);
      // Don't throw error here, just log it and continue
      console.log('ensureUserProfile failed, but continuing...');
    }
  }

  // Custom register method removed - now using signUp directly

  // Generate UUID
  private static generateUUID(): string {
    // Simple UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Store custom session in AsyncStorage
  private static async storeCustomSession(sessionData: any) {
    try {
      await AsyncStorage.setItem('smartb_custom_session', JSON.stringify(sessionData));
      await AsyncStorage.setItem('smartb_custom_user', JSON.stringify(sessionData.user));
    } catch (error) {
      console.error('Failed to store custom session:', error);
      throw error;
    }
  }

  // Get custom session from AsyncStorage
  private static async getCustomSession() {
    try {
      const sessionData = await AsyncStorage.getItem('smartb_custom_session');
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error('Failed to get custom session:', error);
      return null;
    }
  }
}

