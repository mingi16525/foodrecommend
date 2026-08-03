import { create } from 'zustand';
import apiClient from '../api/client';

export interface SwipeCardData {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  aiTags: string[];
  distance: string;
  rating: number;
}

interface SwipeState {
  cards: SwipeCardData[];
  likedCards: SwipeCardData[];
  skippedCards: SwipeCardData[];
  isLoading: boolean;
  error: string | null;
  fetchRecommendations: (userId: string) => Promise<void>;
  swipeRight: (card: SwipeCardData, userId: string) => void;
  swipeLeft: (card: SwipeCardData, userId: string) => void;
  resetCards: (userId: string) => void;
}

export const useSwipeStore = create<SwipeState>((set, get) => ({
  cards: [],
  likedCards: [],
  skippedCards: [],
  isLoading: false,
  error: null,
  
  fetchRecommendations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get(`/recommendations?userId=${userId}`);
      const recommendations = response.data.data;
      
      const mappedCards: SwipeCardData[] = recommendations.map((rec: any, index: number) => {
        // Fallback random images and data since recommendation engine only returns id/name/score
        const images = [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80'
        ];
        return {
          id: rec.id,
          name: rec.name,
          imageUrl: images[index % images.length],
          price: ['$', '$$', '$$$', '$$$$'][Math.floor(Math.random() * 4)],
          aiTags: ['Match ' + Math.round(rec.score * 100) + '%', 'Recommended'],
          distance: (Math.random() * 5 + 0.5).toFixed(1) + ' km',
          rating: Number((4.0 + Math.random()).toFixed(1))
        };
      });
      
      set({ cards: mappedCards.reverse(), isLoading: false }); // Reverse for stack
    } catch (err: any) {
      console.error('Failed to fetch recommendations:', err);
      set({ error: err.message || 'Failed to fetch', isLoading: false });
    }
  },

  swipeRight: (card, userId) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== card.id),
      likedCards: [...state.likedCards, card],
    }));
    // Fire and forget POST to backend
    apiClient.post('/recommendations/swipe', {
      userId,
      dishId: card.id,
      action: 'like'
    }).catch(err => console.error('Failed to save like:', err));
  },
  
  swipeLeft: (card, userId) => {
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== card.id),
      skippedCards: [...state.skippedCards, card],
    }));
    // Fire and forget POST to backend
    apiClient.post('/recommendations/swipe', {
      userId,
      dishId: card.id,
      action: 'skip'
    }).catch(err => console.error('Failed to save skip:', err));
  },
  
  resetCards: (userId) => {
    set({ likedCards: [], skippedCards: [] });
    get().fetchRecommendations(userId);
  }
}));
