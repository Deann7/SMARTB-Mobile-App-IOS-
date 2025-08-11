import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', event, session?.user?.email);
  
  // Log session details for debugging
  if (session) {
    console.log('Session created/updated:', {
      user: session.user?.email,
      expires_at: session.expires_at,
      refresh_token: !!session.refresh_token,
      access_token: !!session.access_token,
    });
  }
});

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface User {
  id: string;
  phone: string; // Changed from email to phone as primary identifier
  full_name: string;
  nickname?: string;
  date_of_birth?: string;
  gender?: string;
  national_id?: string;
  avatar_url?: string;
  notification_settings?: {
    medication: boolean;
    sputum: boolean;
    community: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  treatment_start_date: string;
  treatment_phase: string;
  current_day: number;
  total_points: number;
  streak_days: number;
  last_data_input_date?: string;
  health_facility?: string;
  doctor_name?: string;
  tb_type?: string;
  medication_combination?: string;
  comorbidities?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyInput {
  id: string;
  user_id: string;
  input_date: string;
  medication_taken: boolean;
  medication_time?: string;
  symptoms: string[];
  cough_description: string[];
  activities: string[];
  mood_rating: number;
  mental_health_symptoms: string[];
  other_activities?: string;
  points_earned: number;
  is_complete: boolean;
  is_on_time: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  user_id: string;
  daily_input_id: string;
  medication_name?: string;
  dosage?: string;
  taken_at?: string;
  notes?: string;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  daily_input_id?: string;
  points: number;
  transaction_type: string;
  description?: string;
  created_at: string;
}

// Achievement interface removed - achievement system disabled

// UserAchievement interface removed - achievement system disabled

export interface Reminder {
  id: string;
  user_id: string;
  reminder_type: string;
  title: string;
  message?: string;
  scheduled_at: string;
  is_sent: boolean;
  sent_at?: string;
  is_recurring: boolean;
  recurrence_pattern?: object;
  created_at: string;
  updated_at: string;
}

export interface SputumCollectionSchedule {
  id: string;
  user_id: string;
  collection_date: string;
  collection_type: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  post_type: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  is_approved: boolean;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_comment_id?: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityLike {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface UserDashboard {
  user_id: string;
  full_name: string;
  treatment_phase: string;
  current_day: number;
  total_points: number;
  streak_days: number;
  last_data_input_date?: string;
  total_inputs: number;
  complete_inputs: number;
  medication_days: number;
}

// UserAchievementView interface removed - achievement system disabled

export interface CommunityPostView {
  id: string;
  title?: string;
  content: string;
  post_type: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name: string;
  author_avatar?: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface SignupRequest {
  phone: string; // Changed from email to phone as primary identifier
  password: string;
  full_name: string;
  nickname?: string;
  date_of_birth?: string;
  treatment_start_date: string;
  gender?: string;
  national_id?: string;
  health_facility?: string;
  doctor_name?: string;
  tb_type?: string;
  medication_combination?: string;
  comorbidities?: string;
}

export interface DailyInputRequest {
  input_date: string;
  medication_taken: boolean;
  medication_time?: string;
  symptoms: string[];
  cough_description: string[];
  activities: string[];
  mood_rating: number;
  mental_health_symptoms: string[];
  other_activities?: string;
}

export interface CreatePostRequest {
  title?: string;
  content: string;
  post_type: string;
  is_anonymous?: boolean;
}

export interface CreateCommentRequest {
  content: string;
  parent_comment_id?: string;
}

export interface CreateReminderRequest {
  reminder_type: string;
  title: string;
  message?: string;
  scheduled_at: string;
  is_recurring?: boolean;
  recurrence_pattern?: object;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface NotificationSettings {
  medication: boolean;
  sputum: boolean;
  community: boolean;
}

export interface PointCalculationResult {
  points: number;
  transaction_type: string;
  description: string;
}

// AchievementProgress interface removed - achievement system disabled

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const POINT_VALUES = {
  COMPLETE_INPUT_ON_TIME: 100,
  COMPLETE_INPUT_LATE: 80,
  MEDICATION_ONLY: 50,
  MISSED_MEDICATION: -50,
  COMMUNITY_SHARE: 20,
} as const;

export const TRANSACTION_TYPES = {
  COMPLETE_INPUT_ON_TIME: 'complete_input_on_time',
  COMPLETE_INPUT_LATE: 'complete_input_late',
  MEDICATION_ONLY: 'medication_only',
  MISSED_MEDICATION: 'missed_medication',
  COMMUNITY_SHARE: 'community_share',
} as const;

export const REMINDER_TYPES = {
  MEDICATION: 'medication',
  SPUTUM_COLLECTION: 'sputum_collection',
  APPOINTMENT: 'appointment',
} as const;

export const POST_TYPES = {
  STORY: 'story',
  QUESTION: 'question',
  ACHIEVEMENT: 'achievement',
} as const;

export const COLLECTION_TYPES = {
  TWO_MONTH: '2_month',
  SIX_MONTH: '6_month',
} as const;

export const TREATMENT_PHASES = {
  INTENSIVE: 'Intensive',
  CONTINUATION: 'Continuation',
  COMPLETED: 'Completed',
} as const;
