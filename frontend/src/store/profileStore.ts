import { create } from 'zustand';

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
  };
  preferences: string[];
  history: UserHistoryItem[];
}

const MOCK_PROFILE: ProfileState = {
  user: {
    name: 'Giang',
    handle: '@giang.foodie',
    avatar: 'https://i.pravatar.cc/300?u=giang',
    bio: 'Exploring the best culinary experiences around town. Coffee addict ☕️',
    followers: 1205,
    following: 432,
    reviews: 87
  },
  preferences: ['Vietnamese', 'Japanese', 'Specialty Coffee', 'Spicy', 'Seafood'],
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

export const useProfileStore = create<ProfileState>(() => MOCK_PROFILE);
