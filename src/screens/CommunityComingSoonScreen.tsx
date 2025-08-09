import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { CommunityPost, CreatePostRequest } from '../lib/supabase';
import { RewardService } from '../services/rewardService';

export const CommunityComingSoonScreen: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    isAnonymous: false,
  });

  useEffect(() => {
    loadCommunityPosts();
  }, []);

  const loadCommunityPosts = async () => {
    try {
      setLoading(true);
      const communityPosts = await RewardService.getCommunityPosts();
      setPosts(communityPosts);
    } catch (error) {
      console.error('Load community posts error:', error);
      Alert.alert('Error', 'Gagal memuat post komunitas');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCommunityPosts();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      Alert.alert('Error', 'Silakan isi konten post');
      return;
    }

    try {
      setLoading(true);
      const postData: CreatePostRequest = {
        title: newPost.title.trim() || undefined,
        content: newPost.content.trim(),
        post_type: 'story',
        is_anonymous: newPost.isAnonymous,
      };

      await RewardService.createCommunityPost(postData);
      
      // Reset form
      setNewPost({ title: '', content: '', isAnonymous: false });
      setShowCreatePost(false);
      
      // Reload posts
      await loadCommunityPosts();
      
      Alert.alert('Sukses', 'Post berhasil dibuat dan menunggu persetujuan admin');
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Error', 'Gagal membuat post. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await RewardService.togglePostLike(postId);
      // Reload posts to get updated like count
      await loadCommunityPosts();
    } catch (error) {
      console.error('Like post error:', error);
      Alert.alert('Error', 'Gagal memberikan like');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm">
      {/* Post Header */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3">
          <Ionicons name="person" size={20} color="#666" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-800 font-kollektif font-semibold">
            {item.is_anonymous ? 'Anonymous' : 'User'}
          </Text>
          <Text className="text-gray-500 font-kollektif text-xs">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <View className="bg-green-100 px-2 py-1 rounded">
          <Text className="text-green-700 font-kollektif text-xs">
            {item.post_type}
          </Text>
        </View>
      </View>

      {/* Post Content */}
      {item.title && (
        <Text className="text-gray-800 font-kollektif font-semibold mb-2">
          {item.title}
        </Text>
      )}
      <Text className="text-gray-700 font-kollektif text-sm leading-5 mb-3">
        {item.content}
      </Text>

      {/* Post Actions */}
      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={() => handleLikePost(item.id)}
          className="flex-row items-center"
        >
          <Ionicons 
            name="heart-outline" 
            size={20} 
            color="#666" 
          />
          <Text className="text-gray-600 font-kollektif text-sm ml-1">
            {item.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text className="text-gray-600 font-kollektif text-sm ml-1">
            {item.comments_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text className="text-gray-600 font-kollektif text-sm ml-1">
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22C55E" />
          <Text className="text-gray-600 mt-4 font-kollektif">Memuat komunitas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#22C55E" />
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-[#22C55E] px-6 pt-8 pb-6">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            
            <Text className="text-white font-kollektif text-lg font-bold">
              Komunitas TB
            </Text>
            
            <TouchableOpacity onPress={() => setShowCreatePost(true)}>
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-4">
          {posts.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Ionicons name="people" size={64} color="#22C55E" />
              <Text className="text-gray-600 font-kollektif text-lg text-center mt-4">
                Belum ada post di komunitas
              </Text>
              <Text className="text-gray-500 font-kollektif text-sm text-center mt-2">
                Jadilah yang pertama berbagi cerita
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreatePost(true)}
                className="bg-[#22C55E] px-6 py-3 rounded-lg mt-6"
              >
                <Text className="text-white font-kollektif font-semibold">
                  Buat Post Pertama
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={posts}
              renderItem={renderPost}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              ListHeaderComponent={
                <View className="mb-4">
                  <Text className="text-gray-700 font-kollektif text-lg font-bold mb-2">
                    Cerita dari Komunitas
                  </Text>
                  <Text className="text-gray-500 font-kollektif text-sm">
                    Berbagi pengalaman dan dukungan sesama penderita TB
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {/* Create Post Modal */}
        {showCreatePost && (
          <View className="absolute inset-0 bg-black bg-opacity-50 justify-center items-center">
            <View className="bg-white rounded-lg p-6 mx-6 w-full max-w-sm">
              <Text className="text-gray-800 font-kollektif text-lg font-bold mb-4">
                Buat Post Baru
              </Text>

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3 font-kollektif"
                placeholder="Judul (opsional)"
                value={newPost.title}
                onChangeText={(text) => setNewPost(prev => ({ ...prev, title: text }))}
              />

              <TextInput
                className="border border-gray-300 rounded-lg p-3 mb-3 font-kollektif"
                placeholder="Bagikan cerita Anda..."
                value={newPost.content}
                onChangeText={(text) => setNewPost(prev => ({ ...prev, content: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                onPress={() => setNewPost(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }))}
                className="flex-row items-center mb-4"
              >
                <View className={`w-5 h-5 rounded border-2 mr-2 items-center justify-center ${
                  newPost.isAnonymous ? 'bg-[#22C55E] border-[#22C55E]' : 'border-gray-400'
                }`}>
                  {newPost.isAnonymous && (
                    <Ionicons name="checkmark" size={12} color="white" />
                  )}
                </View>
                <Text className="text-gray-700 font-kollektif text-sm">
                  Post sebagai Anonymous
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-end space-x-3">
                <TouchableOpacity
                  onPress={() => setShowCreatePost(false)}
                  className="px-4 py-2"
                >
                  <Text className="text-gray-600 font-kollektif">Batal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleCreatePost}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg ${
                    loading ? 'bg-gray-400' : 'bg-[#22C55E]'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-kollektif font-semibold">
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </>
  );
};
