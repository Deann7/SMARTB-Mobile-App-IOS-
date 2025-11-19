import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Button, Dropdown, InputField, MultilineInput } from '../components';
import { CommunityPostView, POST_TYPES, supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';

type CreatePostForm = {
  title: string;
  content: string;
  post_type: string;
  is_anonymous: boolean;
};

export default function CommunityScreen() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPostView[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof CreatePostForm, string>>>({});

  // Thread modal state
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPostView | null>(null);
  const [comments, setComments] = useState<Array<{
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    author_name?: string | null;
    author_avatar?: string | null;
  }>>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Create post modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const openCreate = () => setIsCreateOpen(true);
  const closeCreate = () => setIsCreateOpen(false);

  const [form, setForm] = useState<CreatePostForm>({
    title: '',
    content: '',
    post_type: POST_TYPES.STORY,
    is_anonymous: false,
  });

  const postTypeOptions = useMemo(
    () => [
      { label: 'Cerita', value: POST_TYPES.STORY },
      { label: 'Pertanyaan', value: POST_TYPES.QUESTION },
      { label: 'Pencapaian', value: POST_TYPES.ACHIEVEMENT },
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      const user = await AuthService.getCurrentUser();
      if (!mounted) return;
      setUserId(user?.id ?? null);
      await loadPosts();
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const validate = (): boolean => {
    const next: Partial<Record<keyof CreatePostForm, string>> = {};
    if (!form.content.trim()) {
      next.content = 'Isi tulisan tidak boleh kosong';
    } else if (form.content.trim().length < 5) {
      next.content = 'Minimal 5 karakter';
    }
    if (!form.post_type) {
      next.post_type = 'Pilih jenis unggahan';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const openThread = async (post: CommunityPostView) => {
    setSelectedPost(post);
    setIsThreadOpen(true);
    await loadComments(post.id);
  };

  const closeThread = () => {
    setIsThreadOpen(false);
    setSelectedPost(null);
    setComments([]);
    setCommentText('');
  };

  const loadComments = async (postId: string) => {
    try {
      setLoadingComments(true);
      // Try to join users to get author info
      let query = supabase
        .from('community_comments')
        .select('id, post_id, user_id, content, created_at, users(full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      const { data, error } = await query as any;
      if (error) throw error;
      const mapped = (data || []).map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        author_name: c.users ? c.users.full_name : null,
        author_avatar: c.users ? c.users.avatar_url : null,
      }));
      setComments(mapped);
    } catch (err: any) {
      console.error('Load comments error:', err);
      // Fallback simple load without join
      try {
        const { data: simpleData } = await supabase
          .from('community_comments')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true });
        setComments(
          (simpleData || []).map((c: any) => ({
            id: c.id,
            user_id: c.user_id,
            content: c.content,
            created_at: c.created_at,
            author_name: null,
            author_avatar: null,
          }))
        );
      } catch {}
    } finally {
      setLoadingComments(false);
    }
  };

  const submitComment = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Harus login',
        text2: 'Silakan masuk terlebih dahulu',
        position: 'top',
      });
      return;
    }
    if (!selectedPost) return;
    const text = commentText.trim();
    if (!text) return;
    try {
      setPostingComment(true);
      const { error } = await supabase.from('community_comments').insert({
        post_id: selectedPost.id,
        user_id: userId,
        content: text,
      });
      if (error) throw error;
      // Update comment count (best-effort)
      try {
        await supabase.rpc('update_post_comment_count', { p_post_id: selectedPost.id });
      } catch {}
      setCommentText('');
      await loadComments(selectedPost.id);
      // Refresh posts to update counts
      await loadPosts();
    } catch (err: any) {
      console.error('Submit comment error:', err);
      Toast.show({
        type: 'error',
        text1: 'Gagal mengirim komentar',
        text2: err?.message || 'Terjadi kesalahan',
        position: 'top',
      });
    } finally {
      setPostingComment(false);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('community_posts_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Load posts error:', err);
      Toast.show({
        type: 'error',
        text1: 'Gagal memuat postingan',
        text2: err?.message || 'Terjadi kesalahan',
        position: 'top',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
  };

  const submitPost = async () => {
    if (!userId) {
      Toast.show({
        type: 'error',
        text1: 'Harus login',
        text2: 'Silakan masuk terlebih dahulu',
        position: 'top',
      });
      return;
    }
    if (!validate()) return;
    try {
      setSubmitting(true);
      const { error: insertError } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          title: form.title?.trim() || null,
          content: form.content.trim(),
          post_type: form.post_type,
          is_anonymous: form.is_anonymous,
        });
      if (insertError) throw insertError;

      // Award points (non-blocking if fails)
      try {
        await supabase.rpc('award_community_points', {
          p_user_id: userId,
          p_post_id: null,
        });
      } catch (e) {
        // ignore point awarding failure
      }

      Toast.show({
        type: 'success',
        text1: 'Berhasil dibagikan',
        text2: 'Postingan kamu telah dipublikasikan',
        position: 'top',
      });
      // Reset form
      setForm({
        title: '',
        content: '',
        post_type: POST_TYPES.STORY,
        is_anonymous: false,
      });
      await loadPosts();
    } catch (err: any) {
      console.error('Create post error:', err);
      Toast.show({
        type: 'error',
        text1: 'Gagal membagikan',
        text2: err?.message || 'Terjadi kesalahan',
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderHeader = () => (
    <View className="pt-4 pb-2">
      <View className="flex-row items-center justify-between mt-2 px-2">
        <View className="bg-smar-green p-5 rounded-3xl flex-1 mr-3">
          <Text className="text-white font-kollektif text-2xl font-bold text-center">
            Komunitas TB
          </Text>
        </View>
        <Image
          source={require('../../assets/images/png/community.png')}
          className="w-24 h-24"
        />
      </View>
    </View>
  );

  const renderCreateForm = () => (
    <View className="bg-white rounded-2xl p-4 mt-2 mb-4 border border-gray-200">
      <Text className="text-smar-green font-kollektif text-lg font-semibold mb-3">
        Bagikan Pikiranmu
      </Text>
      <Text className="text-gray-600 font-kollektif mb-3">
        Ketuk tombol di bawah untuk menulis posting dalam tampilan layar penuh.
      </Text>
      <Button
        title="Tulis Post"
        onPress={openCreate}
        variant="secondary"
      />
    </View>
  );

  const renderPostItem = ({ item }: { item: CommunityPostView }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => openThread(item)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row items-center mb-2">
        <View className="w-10 h-10 rounded-full bg-smar-light items-center justify-center mr-3 overflow-hidden">
          {/* Simple avatar placeholder */}
          {item.author_avatar ? (
            <Image source={{ uri: item.author_avatar }} className="w-10 h-10" />
          ) : (
            <Ionicons name="person" size={20} color="#1c4735" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-kollektif font-semibold">
            {item.author_name || 'Pengguna'}
          </Text>
          <Text className="text-gray-500 font-kollektif text-xs">
            {new Date(item.created_at).toLocaleString()}
          </Text>
        </View>
        <View className="px-2 py-1 rounded-full bg-smar-light">
          <Text className="text-smar-green font-kollektif text-xs">{item.post_type}</Text>
        </View>
      </View>
      {item.title ? (
        <Text className="text-gray-900 font-kollektif text-base font-semibold mb-1">
          {item.title}
        </Text>
      ) : null}
      <Text className="text-gray-800 font-kollektif text-base leading-6">
        {item.content}
      </Text>
      <View className="flex-row mt-3">
        <View className="flex-row items-center mr-4">
          <Ionicons name="heart-outline" size={18} color="#6B7280" />
          <Text className="text-gray-600 font-kollektif text-sm ml-1">
            {item.likes_count}
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center"
          activeOpacity={0.7}
          onPress={() => openThread(item)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#6B7280" />
          <Text className="text-gray-600 font-kollektif text-sm ml-1">{item.comments_count}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f8f5" />
      <SafeAreaView className="flex-1 bg-[#f1f8f5]">
        <View className="flex-1 px-4 py-4">
          {renderHeader()}
          {renderCreateForm()}

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="small" color="#2D5A4F" />
              <Text className="text-gray-600 font-kollektif mt-2">Memuat...</Text>
            </View>
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderPostItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View className="flex-1 items-center mt-8">
                  <Text className="text-gray-600 font-kollektif">
                    Belum ada postingan. Jadilah yang pertama!
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
      {/* Thread Modal */}
      {isThreadOpen && selectedPost && (
        <View className="absolute inset-0 bg-black/50">
          <View className="absolute bottom-0 left-0 right-0 h-[92%] bg-white rounded-t-3xl overflow-hidden">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="font-kollektif text-lg font-semibold text-gray-800">
                Percakapan
              </Text>
              <TouchableOpacity onPress={closeThread} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            {/* Post preview */}
            <View className="px-4 py-3 border-b border-gray-100">
              {renderPostItem({ item: selectedPost })}
            </View>
            {/* Comments list */}
            <View className="flex-1 px-4 py-2">
              {loadingComments ? (
                <View className="items-center justify-center py-6">
                  <ActivityIndicator size="small" color="#2D5A4F" />
                  <Text className="text-gray-600 font-kollektif mt-2">Memuat komentar...</Text>
                </View>
              ) : comments.length === 0 ? (
                <View className="items-center justify-center py-6">
                  <Text className="text-gray-600 font-kollektif">
                    Belum ada komentar. Mulai percakapan!
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={comments}
                  keyExtractor={(c) => c.id}
                  renderItem={({ item }) => (
                    <View className="py-3 border-b border-gray-100">
                      <View className="flex-row items-center mb-1">
                        <View className="w-8 h-8 rounded-full bg-smar-light items-center justify-center mr-2 overflow-hidden">
                          {item.author_avatar ? (
                            <Image source={{ uri: item.author_avatar }} className="w-8 h-8" />
                          ) : (
                            <Ionicons name="person" size={16} color="#1c4735" />
                          )}
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-kollektif text-sm font-semibold">
                            {item.author_name || 'Pengguna'}
                          </Text>
                          <Text className="text-gray-500 font-kollektif text-[11px]">
                            {new Date(item.created_at).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-800 font-kollektif text-base leading-6">
                        {item.content}
                      </Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 8 }}
                />
              )}
            </View>
            {/* Composer */}
            <View className="px-4 pb-5 pt-2 border-t border-gray-200 bg-white">
              <View className="flex-row items-end">
                <View className="flex-1 mr-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2">
                  <MultilineInput
                    placeholder="Tulis komentar..."
                    value={commentText}
                    onChangeText={setCommentText}
                    numberOfLines={3}
                  />
                </View>
                <TouchableOpacity
                  className={`px-4 py-3 rounded-2xl ${commentText.trim() ? 'bg-smar-green' : 'bg-gray-300'}`}
                  onPress={submitComment}
                  disabled={!commentText.trim() || postingComment}
                  activeOpacity={0.8}
                >
                  {postingComment ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
      {/* Create Post Modal - rounded and nearly full screen */}
      {isCreateOpen && (
        <View className="absolute inset-0 bg-black/50">
          <View className="absolute bottom-0 left-0 right-0 h-[92%] bg-white rounded-t-3xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="font-kollektif text-lg font-semibold text-gray-800">
                Bagikan Pikiranmu
              </Text>
              <TouchableOpacity onPress={closeCreate} activeOpacity={0.8}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>
            {/* Body/Form */}
            <View className="flex-1 px-4 py-4">
              <InputField
                placeholder="Judul (opsional)"
                value={form.title}
                onChangeText={(t) => setForm((p) => ({ ...p, title: t }))}
                label="Judul"
              />
              <Dropdown
                placeholder="Pilih jenis"
                options={postTypeOptions}
                value={form.post_type}
                onSelect={(v) => setForm((p) => ({ ...p, post_type: v }))}
                label="Jenis"
                error={errors.post_type}
              />
              <MultilineInput
                placeholder="Tulis sesuatu yang bermanfaat..."
                value={form.content}
                onChangeText={(t) => {
                  if (errors.content) setErrors((e) => ({ ...e, content: undefined }));
                  setForm((p) => ({ ...p, content: t }));
                }}
                label="Konten"
                numberOfLines={8}
                error={errors.content}
              />
              <TouchableOpacity
                className="flex-row items-center mb-4"
                activeOpacity={0.7}
                onPress={() => setForm((p) => ({ ...p, is_anonymous: !p.is_anonymous }))}
              >
                <View
                  className={`w-5 h-5 rounded mr-2 items-center justify-center ${
                    form.is_anonymous ? 'bg-smar-green' : 'bg-gray-200'
                  }`}
                >
                  {form.is_anonymous && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <Text className="text-gray-700 font-kollektif">Kirim sebagai anonim</Text>
              </TouchableOpacity>
            </View>
            {/* Footer */}
            <View className="px-4 pb-6">
              <Button
                title={submitting ? 'Mengirim...' : 'Bagikan'}
                onPress={async () => {
                  await submitPost();
                  if (!submitting) {
                    closeCreate();
                  }
                }}
                variant="secondary"
                disabled={submitting}
                loading={submitting}
              />
            </View>
          </View>
        </View>
      )}
    </>
  );
}
