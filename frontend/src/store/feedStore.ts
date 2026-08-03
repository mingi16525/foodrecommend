import { create } from 'zustand';
import apiClient from '../api/client';

export interface FeedPost {
  id: string;
  videoUrl: string | null;
  imageUrl: string | null;
  reviewerName: string;
  avatarUrl: string;
  caption: string;
  restaurantName: string;
  likes: number;
  comments: number;
  shares: number;
  isLikedByMe: boolean;
  isSaved: boolean;
}

interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  error: string | null;
  fetchFeed: () => Promise<void>;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  
  fetchFeed: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/social/feed');
      const backendPosts = response.data.data;
      
      const mappedPosts: FeedPost[] = backendPosts.map((p: any) => ({
        id: p.id,
        videoUrl: p.video_url || null,
        // Mocking some missing fields for UI purpose if not provided by backend
        imageUrl: p.video_url ? null : 'https://images.unsplash.com/photo-1544025162-8356fd10519f?auto=format&fit=crop&w=600&q=80',
        reviewerName: `@${(p.author_name || 'user').replace(/\\s+/g, '').toLowerCase()}`,
        avatarUrl: `https://i.pravatar.cc/150?u=${p.user_id}`,
        caption: p.content || 'No caption',
        restaurantName: 'Trending Restaurant', // Not in posts table right now
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        isLikedByMe: false,
        isSaved: false
      }));
      
      set({ posts: mappedPosts, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch feed:', err);
      set({ error: err.message || 'Failed to fetch', isLoading: false });
    }
  },
  
  toggleLike: (id) =>
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === id) {
          const isLiked = !post.isLikedByMe;
          return {
            ...post,
            isLikedByMe: isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1
          };
        }
        return post;
      })
    })),
    
  toggleSave: (id) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === id ? { ...post, isSaved: !post.isSaved } : post
      )
    }))
}));
