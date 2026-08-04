import { create } from 'zustand';
import apiClient from '../api/client';

export interface UserHistoryItem {
  id: string;
  restaurantName: string;
  date: string;
  rating: number;
  imageUrl: string;
}

interface ProfileState {
  user: {
    name: string;
    handle: string;
    avatar: string;
    bio: string;
    followers: number;
    following: number;
    reviews: number;
    isReviewer: boolean;
  };
  preferences: string[];
  history: UserHistoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  requestVerification: (userId: string) => Promise<void>;
}

const DEFAULT_PROFILE = {
  user: {
    name: 'Loading...',
    handle: '@loading',
    avatar: 'https://i.pravatar.cc/300?u=giang',
    bio: '...',
    followers: 0,
    following: 0,
    reviews: 0,
    isReviewer: false
  },
  preferences: [],
  history: [
    {
      id: 'h1',
      restaurantName: 'Sushi Rei',
      date: '2 Days Ago',
      rating: 5.0,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'h2',
      restaurantName: 'The Workshop Coffee',
      date: 'Last Week',
      rating: 4.5,
      imageUrl: 'https://images.unsplash.com/photo-1495474472201-3ce3ed4224b2?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'h3',
      restaurantName: 'Pizza 4P\'s',
      date: '2 Weeks Ago',
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80'
    }
  ]
};

export const useProfileStore = create<ProfileState>((set) => ({
  ...DEFAULT_PROFILE,
  isLoading: false,
  error: null,
  
  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/users/${userId}`);
      const data = response.data.data;
      
      const prefs = data.preferences?.favorite_flavors || [];
      
      set((state) => ({
        user: {
          ...state.user,
          name: data.full_name || data.email,
          handle: `@${(data.full_name || 'user').replace(/\s+/g, '').toLowerCase()}`,
          bio: data.is_reviewer ? 'Food Critic & Reviewer' : 'Food lover exploring town',
          isReviewer: data.is_reviewer || false,
        },
        preferences: prefs,
        isLoading: false
      }));
    } catch (error: any) {
      console.error("Failed to fetch profile:", error);
      set({ error: error.message || 'Failed to fetch', isLoading: false });
    }
  },

  requestVerification: async (userId: string) => {
    try {
      const response = await apiClient.post(`/users/${userId}/verify-reviewer`);
      if (response.data.success) {
        set((state) => ({
          user: {
            ...state.user,
            isReviewer: true,
            bio: 'Food Critic & Reviewer',
          }
        }));
      }
    } catch (error: any) {
      console.error("Failed to request verification:", error);
      // Optional: set an error state here if needed
    }
  }
}));
