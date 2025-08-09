import { DailyInput, DailyInputRequest, PointTransaction, supabase } from '../lib/supabase';

export class DailyInputService {
  // Submit daily input
  static async submitDailyInput(input: DailyInputRequest): Promise<DailyInput> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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

        // Calculate points
        await this.calculatePoints(input.input_date);

        return data;
      } else {
        // Create new input
        const { data, error } = await supabase
          .from('daily_inputs')
          .insert(inputData)
          .select()
          .single();

        if (error) throw error;

        // Calculate points
        await this.calculatePoints(input.input_date);

        return data;
      }
    } catch (error) {
      console.error('Submit daily input error:', error);
      throw error;
    }
  }

  // Get daily input for specific date
  static async getDailyInput(date: string): Promise<DailyInput | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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

  // Calculate points for daily input
  static async calculatePoints(inputDate: string): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('calculate_daily_points', {
        p_user_id: user.id,
        p_input_date: inputDate,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Calculate points error:', error);
      throw error;
    }
  }

  // Get point transactions for user
  static async getPointTransactions(limit = 50): Promise<PointTransaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('streak_days, total_points')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get streak info error:', error);
      throw error;
    }
  }

  // Get today's input status
  static async getTodayInputStatus() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const input = await this.getDailyInput(today);
      
      return {
        hasInput: !!input,
        isComplete: input?.is_complete || false,
        pointsEarned: input?.points_earned || 0,
        input: input,
      };
    } catch (error) {
      console.error('Get today input status error:', error);
      throw error;
    }
  }

  // Get weekly summary
  static async getWeeklySummary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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
}
