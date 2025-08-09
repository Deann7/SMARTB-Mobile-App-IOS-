import { CreateReminderRequest, Reminder, SputumCollectionSchedule, supabase } from '../lib/supabase';

export class ReminderService {
  // Get user reminders
  static async getUserReminders(): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user reminders error:', error);
      throw error;
    }
  }

  // Create reminder
  static async createReminder(reminder: CreateReminderRequest): Promise<Reminder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminder,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Create reminder error:', error);
      throw error;
    }
  }

  // Update reminder
  static async updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<Reminder> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Update reminder error:', error);
      throw error;
    }
  }

  // Delete reminder
  static async deleteReminder(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
    } catch (error) {
      console.error('Delete reminder error:', error);
      throw error;
    }
  }

  // Schedule sputum collection reminders
  static async scheduleSputumReminders(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('schedule_sputum_reminders', {
        p_user_id: user.id,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Schedule sputum reminders error:', error);
      throw error;
    }
  }

  // Get sputum collection schedule
  static async getSputumCollectionSchedule(): Promise<SputumCollectionSchedule[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sputum_collection_schedule')
        .select('*')
        .eq('user_id', user.id)
        .order('collection_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get sputum collection schedule error:', error);
      throw error;
    }
  }

  // Mark sputum collection as completed
  static async markSputumCollectionCompleted(scheduleId: string, notes?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sputum_collection_schedule')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', scheduleId);

      if (error) throw error;
    } catch (error) {
      console.error('Mark sputum collection completed error:', error);
      throw error;
    }
  }

  // Get upcoming reminders
  static async getUpcomingReminders(days: number = 7): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .lte('scheduled_at', endDate.toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get upcoming reminders error:', error);
      throw error;
    }
  }

  // Get overdue reminders
  static async getOverdueReminders(): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .lt('scheduled_at', new Date().toISOString())
        .eq('is_sent', false)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get overdue reminders error:', error);
      throw error;
    }
  }

  // Mark reminder as sent
  static async markReminderAsSent(reminderId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({
          is_sent: true,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminderId);

      if (error) throw error;
    } catch (error) {
      console.error('Mark reminder as sent error:', error);
      throw error;
    }
  }

  // Create medication reminder
  static async createMedicationReminder(
    title: string,
    message: string,
    scheduledAt: string,
    isRecurring: boolean = true
  ): Promise<Reminder> {
    try {
      const reminder: CreateReminderRequest = {
        reminder_type: 'medication',
        title,
        message,
        scheduled_at: scheduledAt,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? { type: 'daily', interval: 1 } : undefined,
      };

      return await this.createReminder(reminder);
    } catch (error) {
      console.error('Create medication reminder error:', error);
      throw error;
    }
  }

  // Create appointment reminder
  static async createAppointmentReminder(
    title: string,
    message: string,
    scheduledAt: string
  ): Promise<Reminder> {
    try {
      const reminder: CreateReminderRequest = {
        reminder_type: 'appointment',
        title,
        message,
        scheduled_at: scheduledAt,
        is_recurring: false,
      };

      return await this.createReminder(reminder);
    } catch (error) {
      console.error('Create appointment reminder error:', error);
      throw error;
    }
  }

  // Get reminder statistics
  static async getReminderStatistics() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reminders')
        .select('reminder_type, is_sent, scheduled_at')
        .eq('user_id', user.id);

      if (error) throw error;

      const totalReminders = data?.length || 0;
      const sentReminders = data?.filter(r => r.is_sent).length || 0;
      const upcomingReminders = data?.filter(r => 
        new Date(r.scheduled_at) > new Date() && !r.is_sent
      ).length || 0;

      const sputumReminders = data?.filter(r => r.reminder_type === 'sputum_collection').length || 0;
      const medicationReminders = data?.filter(r => r.reminder_type === 'medication').length || 0;
      const appointmentReminders = data?.filter(r => r.reminder_type === 'appointment').length || 0;

      return {
        totalReminders,
        sentReminders,
        upcomingReminders,
        sputumReminders,
        medicationReminders,
        appointmentReminders,
        completionRate: totalReminders > 0 ? (sentReminders / totalReminders) * 100 : 0,
      };
    } catch (error) {
      console.error('Get reminder statistics error:', error);
      throw error;
    }
  }

  // Get next sputum collection date
  static async getNextSputumCollectionDate(): Promise<SputumCollectionSchedule | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('sputum_collection_schedule')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .gte('collection_date', new Date().toISOString().split('T')[0])
        .order('collection_date', { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Get next sputum collection date error:', error);
      throw error;
    }
  }

  // Get treatment progress for reminders
  static async getTreatmentProgress() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('treatment_start_date, treatment_phase, current_day')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const treatmentStartDate = new Date(data.treatment_start_date);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - treatmentStartDate.getTime()) / (1000 * 60 * 60 * 24));

      const twoMonthDate = new Date(treatmentStartDate);
      twoMonthDate.setMonth(twoMonthDate.getMonth() + 2);

      const sixMonthDate = new Date(treatmentStartDate);
      sixMonthDate.setMonth(sixMonthDate.getMonth() + 6);

      return {
        treatmentStartDate: data.treatment_start_date,
        treatmentPhase: data.treatment_phase,
        currentDay: data.current_day,
        daysSinceStart,
        twoMonthDate: twoMonthDate.toISOString().split('T')[0],
        sixMonthDate: sixMonthDate.toISOString().split('T')[0],
        isTwoMonthDue: today >= twoMonthDate,
        isSixMonthDue: today >= sixMonthDate,
      };
    } catch (error) {
      console.error('Get treatment progress error:', error);
      throw error;
    }
  }

  // Bulk create reminders
  static async bulkCreateReminders(reminders: CreateReminderRequest[]): Promise<Reminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const remindersWithUserId = reminders.map(reminder => ({
        ...reminder,
        user_id: user.id,
      }));

      const { data, error } = await supabase
        .from('reminders')
        .insert(remindersWithUserId)
        .select();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Bulk create reminders error:', error);
      throw error;
    }
  }

  // Delete all reminders for user
  static async deleteAllReminders(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete all reminders error:', error);
      throw error;
    }
  }
}
