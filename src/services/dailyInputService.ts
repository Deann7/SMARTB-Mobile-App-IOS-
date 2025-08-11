import { DailyInput, DailyInputRequest, PointTransaction, supabase } from '../lib/supabase';
import { AuthService } from './authService';

export class DailyInputService {
  // Submit daily input using safe helper function
  static async submitDailyInput(input: DailyInputRequest): Promise<DailyInput> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Submitting daily input using helper function...');
      
      // Use direct table access method (more reliable than RPC)
      console.log('Using direct table access for daily input submission...');
      return await this.submitDailyInputFallback(input);
    } catch (error) {
      console.error('Submit daily input error:', error);
      // Try fallback method
      return await this.submitDailyInputFallback(input);
    }
  }

  // Fallback method for direct table access
  private static async submitDailyInputFallback(input: DailyInputRequest): Promise<DailyInput> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Using fallback method for daily input submission...');

      // Check if input already exists for the date
      const { data: existingInput } = await supabase
        .from('daily_inputs')
        .select('id')
        .eq('user_id', user.id)
        .eq('input_date', input.input_date)
        .single();

      // Determine if input is complete
      const isComplete = this.isInputComplete(input);

      const inputData = {
        ...input,
        user_id: user.id,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      };

      if (existingInput) {
        // Update existing input
        const { data, error } = await supabase
          .from('daily_inputs')
          .update(inputData)
          .eq('id', existingInput.id)
          .select()
          .single();

        if (error) throw error;

        // Try to update dashboard points (non-critical)
        try {
          await this.updateDashboardPoints(user.id, 10); // 10 points for daily input update
        } catch (pointsError) {
          console.log('Dashboard points update failed (non-critical):', pointsError);
        }

        return data;
      } else {
        // Create new input
        const { data, error } = await supabase
          .from('daily_inputs')
          .insert(inputData)
          .select()
          .single();

        if (error) throw error;

        // Try to update dashboard points (non-critical)
        try {
          await this.updateDashboardPoints(user.id, 10); // 10 points for new daily input
        } catch (pointsError) {
          console.log('Dashboard points update failed (non-critical):', pointsError);
        }

        return data;
      }
    } catch (error) {
      console.error('Fallback submit daily input error:', error);
      throw error;
    }
  }

  // Get daily input for specific date
  static async getDailyInput(date: string): Promise<DailyInput | null> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_inputs')
        .select('*')
        .eq('user_id', user.id)
        .eq('input_date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Get daily input error:', error);
      throw error;
    }
  }

  // Get daily input history
  static async getDailyInputHistory(limit = 30): Promise<DailyInput[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('daily_inputs')
        .select('*')
        .eq('user_id', user.id)
        .order('input_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get daily input history error:', error);
      throw error;
    }
  }

  // Update dashboard points directly
  static async updateDashboardPoints(userId: string, points: number): Promise<void> {
    try {
      console.log(`🎯 DASHBOARD UPDATE START`);
      console.log(`  - User ID: ${userId}`);
      console.log(`  - Points to add: ${points}`);
      console.log(`  - Current timestamp: ${new Date().toISOString()}`);
      
      // Try to get existing dashboard
      console.log(`📊 Checking for existing dashboard...`);
      const { data: existingDashboard, error: getDashboardError } = await supabase
        .from('user_dashboard')
        .select('id, user_id, total_points, current_streak, created_at, updated_at')
        .eq('user_id', userId)
        .single();

      if (getDashboardError) {
        console.log(`🔍 Get dashboard result:`, getDashboardError);
        if (getDashboardError.code === 'PGRST116') {
          console.log(`📝 No existing dashboard found (PGRST116 - no rows), will create new one`);
        } else {
          console.error('❌ Error getting dashboard:', getDashboardError);
          return;
        }
      } else {
        console.log(`✅ Existing dashboard found:`, existingDashboard);
      }

      if (existingDashboard) {
        // Update existing dashboard
        const oldPoints = existingDashboard.total_points || 0;
        const newTotalPoints = oldPoints + points;
        
        console.log(`🔄 Updating existing dashboard:`);
        console.log(`  - Old points: ${oldPoints}`);
        console.log(`  - New points: ${newTotalPoints}`);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('user_dashboard')
          .update({ 
            total_points: newTotalPoints,
            last_input_date: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select();

        if (updateError) {
          console.error('❌ Error updating dashboard points:', updateError);
        } else {
          console.log(`✅ Dashboard updated successfully!`);
          console.log(`📈 Update result:`, updateResult);
        }
      } else {
        // Create new dashboard entry
        console.log(`🆕 Creating new dashboard entry...`);
        const newDashboardData = {
          user_id: userId,
          total_points: points,
          current_streak: 1,
          longest_streak: 1,
          last_input_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log(`📝 New dashboard data:`, newDashboardData);
        
        const { data: createResult, error: createError } = await supabase
          .from('user_dashboard')
          .insert(newDashboardData)
          .select();

        if (createError) {
          console.error('❌ Error creating dashboard:', createError);
        } else {
          console.log(`✅ Dashboard created successfully!`);
          console.log(`📊 Create result:`, createResult);
        }
      }
      
      // Verify the final state
      console.log(`🔍 Verifying final dashboard state...`);
      const { data: finalState, error: verifyError } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (verifyError) {
        console.error('❌ Error verifying dashboard state:', verifyError);
      } else {
        console.log(`✅ Final dashboard state:`, finalState);
      }
      
      console.log(`🎯 DASHBOARD UPDATE END`);
    } catch (error) {
      console.error('💥 Update dashboard points error:', error);
    }
  }

  // Calculate points for daily input (deprecated - kept for compatibility)
  static async calculatePoints(inputDate: string): Promise<number> {
    try {
      console.log('calculatePoints called - this method is deprecated, using direct dashboard update instead');
      return 10; // Default points for daily input
    } catch (error) {
      console.error('Calculate points error:', error);
      return 10;
    }
  }

  // Get point transactions for user
  static async getPointTransactions(limit = 50): Promise<PointTransaction[]> {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get point transactions error:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStatistics() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_dashboard')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user statistics error:', error);
      throw error;
    }
  }

  // Check if input is complete
  private static isInputComplete(input: DailyInputRequest): boolean {
    return (
      input.medication_taken &&
      input.symptoms.length > 0 &&
      input.cough_description.length > 0 &&
      input.activities.length > 0 &&
      input.mood_rating > 0 &&
      input.mental_health_symptoms.length >= 0
    );
  }

  // Get streak information
  static async getStreakInfo() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Try user_profiles first, fallback to user_dashboard if permission denied
      let data = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('streak_days, total_points')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.log('user_profiles access failed, trying user_dashboard:', profileError.message);
          // Fallback to user_dashboard
          const { data: dashboardData, error: dashboardError } = await supabase
            .from('user_dashboard')
            .select('current_streak, total_points')
            .eq('user_id', user.id)
            .single();
          
          if (dashboardError) {
            console.log('user_dashboard access also failed, using default values:', dashboardError.message);
            data = { streak_days: 0, total_points: 0 };
          } else {
            data = { streak_days: dashboardData.current_streak || 0, total_points: dashboardData.total_points || 0 };
          }
        } else {
          data = profileData;
        }
      } catch (error) {
        console.log('All streak info access methods failed, using default values:', error);
        data = { streak_days: 0, total_points: 0 };
      }
      return data;
    } catch (error) {
      console.error('Get streak info error:', error);
      throw error;
    }
  }

  // Get today's input status using safe helper function
  static async getTodayInputStatus() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Getting today input status using helper function...');
      
      // Use direct table access method (more reliable than RPC)
      console.log('Using direct table access for today input status...');
      return await this.getTodayInputStatusFallback();
    } catch (error) {
      console.error('Get today input status error:', error);
      // Try fallback method
      return await this.getTodayInputStatusFallback();
    }
  }

  // Fallback method for getting today's input status
  private static async getTodayInputStatusFallback() {
    try {
      console.log('Using fallback method for today input status...');
      const today = new Date().toISOString().split('T')[0];
      const input = await this.getDailyInput(today);
      
      return {
        hasInput: !!input,
        isComplete: input?.is_complete || false,
        pointsEarned: input?.points_earned || 0,
        input: input,
      };
    } catch (error) {
      console.error('Fallback get today input status error:', error);
      // Return default values instead of throwing error
      return {
        hasInput: false,
        isComplete: false,
        pointsEarned: 0,
        input: null,
      };
    }
  }

  // Get weekly summary
  static async getWeeklySummary() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const { data, error } = await supabase
        .from('daily_inputs')
        .select('*')
        .eq('user_id', user.id)
        .gte('input_date', startDate.toISOString().split('T')[0])
        .lte('input_date', endDate.toISOString().split('T')[0])
        .order('input_date', { ascending: true });

      if (error) throw error;

      const summary = {
        totalDays: 7,
        completedDays: data?.filter(d => d.is_complete).length || 0,
        medicationDays: data?.filter(d => d.medication_taken).length || 0,
        totalPoints: data?.reduce((sum, d) => sum + d.points_earned, 0) || 0,
        averageMood: data?.length ? data.reduce((sum, d) => sum + d.mood_rating, 0) / data.length : 0,
        inputs: data || [],
      };

      return summary;
    } catch (error) {
      console.error('Get weekly summary error:', error);
      throw error;
    }
  }

  // Get monthly summary
  static async getMonthlySummary() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const { data, error } = await supabase
        .from('daily_inputs')
        .select('*')
        .eq('user_id', user.id)
        .gte('input_date', startDate.toISOString().split('T')[0])
        .lte('input_date', endDate.toISOString().split('T')[0])
        .order('input_date', { ascending: true });

      if (error) throw error;

      const summary = {
        totalDays: 30,
        completedDays: data?.filter(d => d.is_complete).length || 0,
        medicationDays: data?.filter(d => d.medication_taken).length || 0,
        totalPoints: data?.reduce((sum, d) => sum + d.points_earned, 0) || 0,
        averageMood: data?.length ? data.reduce((sum, d) => sum + d.mood_rating, 0) / data.length : 0,
        inputs: data || [],
      };

      return summary;
    } catch (error) {
      console.error('Get monthly summary error:', error);
      throw error;
    }
  }

  // Delete daily input
  static async deleteDailyInput(date: string) {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('daily_inputs')
        .delete()
        .eq('user_id', user.id)
        .eq('input_date', date);

      if (error) throw error;
    } catch (error) {
      console.error('Delete daily input error:', error);
      throw error;
    }
  }

  // Get input completion rate
  static async getInputCompletionRate(days: number = 30) {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('daily_inputs')
        .select('is_complete, medication_taken')
        .eq('user_id', user.id)
        .gte('input_date', startDate.toISOString().split('T')[0])
        .lte('input_date', endDate.toISOString().split('T')[0]);

      if (error) throw error;

      const totalInputs = data?.length || 0;
      const completeInputs = data?.filter(d => d.is_complete).length || 0;
      const medicationInputs = data?.filter(d => d.medication_taken).length || 0;

      return {
        totalDays: days,
        totalInputs,
        completeInputs,
        medicationInputs,
        completionRate: totalInputs > 0 ? (completeInputs / totalInputs) * 100 : 0,
        medicationRate: totalInputs > 0 ? (medicationInputs / totalInputs) * 100 : 0,
      };
    } catch (error) {
      console.error('Get input completion rate error:', error);
      throw error;
    }
  }

  // Get treatment progress information
  static async getTreatmentProgress() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      console.log('Getting treatment progress for user:', user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('treatment_start_date, treatment_phase')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Failed to get treatment progress:', profileError);
        return {
          currentDay: 0,
          treatmentPhase: 'Intensive',
          treatmentStartDate: null,
          daysSinceStart: 0,
        };
      }

      if (!profileData?.treatment_start_date) {
        console.log('No treatment start date found');
        return {
          currentDay: 0,
          treatmentPhase: profileData?.treatment_phase || 'Intensive',
          treatmentStartDate: null,
          daysSinceStart: 0,
        };
      }

      const treatmentStartDate = new Date(profileData.treatment_start_date);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - treatmentStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentDay = daysSinceStart + 1; // Start from day 1, not day 0

      return {
        currentDay: Math.max(currentDay, 0), // Ensure non-negative
        treatmentPhase: profileData.treatment_phase || 'Intensive',
        treatmentStartDate: profileData.treatment_start_date,
        daysSinceStart: Math.max(daysSinceStart, 0),
      };
    } catch (error) {
      console.error('Get treatment progress error:', error);
      return {
        currentDay: 0,
        treatmentPhase: 'Intensive',
        treatmentStartDate: null,
        daysSinceStart: 0,
      };
    }
  }
}
