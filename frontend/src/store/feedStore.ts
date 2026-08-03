import { create } from 'zustand';

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
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
}

// Mock Data
const MOCK_POSTS: FeedPost[] = [
  {
    id: '1',
    videoUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-8356fd10519f?auto=format&fit=crop&w=600&q=80',
    reviewerName: '@alice_nguyen',
    avatarUrl: 'https://i.pravatar.cc/150?u=alice',
    caption: 'Best spicy noodles in town! The broth is so rich and flavorful. 🔥🍜',
    restaurantName: 'Spicy Noodle Haven',
    likes: 1245,
    comments: 89,
    shares: 12,
    isLikedByMe: false,
    isSaved: false
  },
  {
    id: '2',
    videoUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    reviewerName: '@burger_king_fan',
    avatarUrl: 'https://i.pravatar.cc/150?u=burger',
    caption: 'Double cheese smash burger, simply out of this world! 🍔✨',
    restaurantName: 'Smash Brothers',
    likes: 856,
    comments: 42,
    shares: 5,
    isLikedByMe: true,
    isSaved: true
  },
  {
    id: '3',
    videoUrl: null,
    imageUrl: 'https://images.unsplash.com/photo-1495474472201-3ce3ed4224b2?auto=format&fit=crop&w=600&q=80',
    reviewerName: '@coffee_lover',
    avatarUrl: 'https://i.pravatar.cc/150?u=coffee',
    caption: 'Perfect flat white to start the morning right. ☕',
    restaurantName: 'Morning Brews',
    likes: 2341,
    comments: 112,
    shares: 34,
    isLikedByMe: false,
    isSaved: false
  }
];

export const useFeedStore = create<FeedState>((set) => ({
  posts: MOCK_POSTS,
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
