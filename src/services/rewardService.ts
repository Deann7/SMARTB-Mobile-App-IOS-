import { CommunityComment, CommunityPost, CreateCommentRequest, CreatePostRequest, supabase } from '../lib/supabase';
import { AuthService } from './authService';

export class RewardService {
  // Get user points and achievements
  static async getUserRewards() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile with points - with fallback for permission issues
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('total_points, streak_days')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.log('user_profiles access failed, trying user_dashboard:', profileError.message);
          // Fallback to user_dashboard
          const { data: dashboardData, error: dashboardError } = await supabase
            .from('user_dashboard')
            .select('total_points, current_streak')
            .eq('user_id', user.id)
            .single();
          
          if (dashboardError) {
            console.log('user_dashboard access also failed, using default values:', dashboardError.message);
            profile = { total_points: 0, streak_days: 0 };
          } else {
            profile = { total_points: dashboardData.total_points || 0, streak_days: dashboardData.current_streak || 0 };
          }
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.log('All profile access methods failed, using default values:', error);
        profile = { total_points: 0, streak_days: 0 };
      }

      // Achievement system disabled
      return {
        total_points: profile?.total_points || 0,
        streak_days: profile?.streak_days || 0,
        achievements: [], // Empty array since achievement system is disabled
      };
    } catch (error) {
      console.error('Get user rewards error:', error);
      throw error;
    }
  }

  // Get point transaction history
  static async getPointTransactions(limit = 50) {
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

  // Award community points
  static async awardCommunityPoints(postId: string) {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('award_community_points', {
        p_user_id: user.id,
        p_post_id: postId,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Award community points error:', error);
      throw error;
    }
  }

  // Achievement system disabled
  static async getAllAchievements(): Promise<any[]> {
    console.log('Achievement system disabled');
    return [];
  }

  // Achievement system disabled
  static async getUserAchievements(): Promise<any[]> {
    console.log('Achievement system disabled');
    return [];
  }

  // Check and award achievements
  static async checkAndAwardAchievements() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      // Get user profile - with fallback for permission issues
      let profile = null;
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('total_points, streak_days')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.log('user_profiles access failed, trying user_dashboard:', profileError.message);
          // Fallback to user_dashboard
          const { data: dashboardData, error: dashboardError } = await supabase
            .from('user_dashboard')
            .select('total_points, current_streak')
            .eq('user_id', user.id)
            .single();
          
          if (dashboardError) {
            console.log('user_dashboard access also failed, using default values:', dashboardError.message);
            profile = { total_points: 0, streak_days: 0 };
          } else {
            profile = { total_points: dashboardData.total_points || 0, streak_days: dashboardData.current_streak || 0 };
          }
        } else {
          profile = profileData;
        }
      } catch (error) {
        console.log('All profile access methods failed, using default values:', error);
        profile = { total_points: 0, streak_days: 0 };
      }

      // Get all achievements
      const achievements = await this.getAllAchievements();

      // Get user's earned achievements
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      if (userAchievementsError) {
        console.log('User achievements table not found, skipping achievements check');
        return [];
      }

      const earnedAchievementIds = userAchievements?.map(ua => ua.achievement_id) || [];
      const newAchievements: Achievement[] = [];

      // Check for new achievements
      for (const achievement of achievements) {
        if (!earnedAchievementIds.includes(achievement.id)) {
          if (profile.total_points >= achievement.points_required) {
            newAchievements.push(achievement);
          }
        }
      }

      // Award new achievements
      if (newAchievements.length > 0) {
        const achievementInserts = newAchievements.map(achievement => ({
          user_id: user.id,
          achievement_id: achievement.id,
        }));

        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert(achievementInserts);

        if (insertError) throw insertError;
      }

      console.log('Achievement system disabled');
      return [];
    } catch (error) {
      console.log('Achievement system disabled');
      return [];
    }
  }

  // ============================================================================
  // COMMUNITY FEATURES
  // ============================================================================

  // Get community posts
  static async getCommunityPosts(limit = 20): Promise<CommunityPost[]> {
    try {
      const { data, error } = await supabase
        .from('community_posts_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get community posts error:', error);
      throw error;
    }
  }

  // Create community post
  static async createCommunityPost(postData: CreatePostRequest): Promise<CommunityPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          ...postData,
          user_id: user.id,
          is_approved: false, // Posts need approval
        })
        .select()
        .single();

      if (error) throw error;

      // Award points for community sharing
      await this.awardCommunityPoints(data.id);

      return data;
    } catch (error) {
      console.error('Create community post error:', error);
      throw error;
    }
  }

  // Get post comments
  static async getPostComments(postId: string): Promise<CommunityComment[]> {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          user:users(full_name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get post comments error:', error);
      throw error;
    }
  }

  // Create comment
  static async createComment(postId: string, commentData: CreateCommentRequest): Promise<CommunityComment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          ...commentData,
          post_id: postId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update post comment count
      await this.updatePostCommentCount(postId);

      return data;
    } catch (error) {
      console.error('Create comment error:', error);
      throw error;
    }
  }

  // Like/unlike post
  static async togglePostLike(postId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;

        // Update post like count
        await this.updatePostLikeCount(postId, -1);

        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('community_likes')
          .insert({
            user_id: user.id,
            post_id: postId,
          });

        if (error) throw error;

        // Update post like count
        await this.updatePostLikeCount(postId, 1);

        return true;
      }
    } catch (error) {
      console.error('Toggle post like error:', error);
      throw error;
    }
  }

  // Update post like count
  private static async updatePostLikeCount(postId: string, increment: number) {
    try {
      const { error } = await supabase.rpc('update_post_like_count', {
        p_post_id: postId,
        p_increment: increment,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update post like count error:', error);
      throw error;
    }
  }

  // Update post comment count
  private static async updatePostCommentCount(postId: string) {
    try {
      const { error } = await supabase.rpc('update_post_comment_count', {
        p_post_id: postId,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update post comment count error:', error);
      throw error;
    }
  }

  // Get user's posts
  static async getUserPosts(): Promise<CommunityPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get user posts error:', error);
      throw error;
    }
  }

  // Delete post
  static async deletePost(postId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          total_points,
          streak_days,
          user:users(full_name, avatar_url)
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  // Get user rank
  static async getUserRank() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Get rank
      const { data: rankData, error: rankError } = await supabase
        .from('user_profiles')
        .select('user_id')
        .gte('total_points', data.total_points)
        .order('total_points', { ascending: false });

      if (rankError) throw rankError;

      const rank = rankData?.findIndex(profile => profile.user_id === user.id) + 1;

      return {
        rank,
        total_points: data.total_points,
        total_users: rankData?.length || 0,
      };
    } catch (error) {
      console.error('Get user rank error:', error);
      throw error;
    }
  }
}
