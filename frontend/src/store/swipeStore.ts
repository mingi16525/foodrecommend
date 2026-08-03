import { create } from 'zustand';

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
  swipeRight: (card: SwipeCardData) => void;
  swipeLeft: (card: SwipeCardData) => void;
  resetCards: () => void;
}

const MOCK_CARDS: SwipeCardData[] = [
  {
    id: '1',
    name: 'Spicy Tonkotsu Ramen',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
    price: '$$',
    aiTags: ['Spicy', 'Comfort Food', 'Trending'],
    distance: '1.2 km',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Wagyu Beef Burger',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    price: '$$$',
    aiTags: ['Rich', 'Protein', 'Popular'],
    distance: '3.5 km',
    rating: 4.9
  },
  {
    id: '3',
    name: 'Avocado Toast with Egg',
    imageUrl: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80',
    price: '$',
    aiTags: ['Healthy', 'Breakfast', 'Light'],
    distance: '0.8 km',
    rating: 4.5
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    price: '$$',
    aiTags: ['Classic', 'Italian', 'Late Night'],
    distance: '2.1 km',
    rating: 4.6
  },
  {
    id: '5',
    name: 'Sushi Platter Deluxe',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80',
    price: '$$$$',
    aiTags: ['Fresh', 'Premium', 'Date Night'],
    distance: '5.0 km',
    rating: 4.9
  }
];

export const useSwipeStore = create<SwipeState>((set) => ({
  cards: [...MOCK_CARDS].reverse(), // Reverse to put first card at the end of the array (top of the stack)
  likedCards: [],
  skippedCards: [],
  swipeRight: (card) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== card.id),
      likedCards: [...state.likedCards, card],
    })),
  swipeLeft: (card) =>
    set((state) => ({
      cards: state.cards.filter((c) => c.id !== card.id),
      skippedCards: [...state.skippedCards, card],
    })),
  resetCards: () => set({ cards: [...MOCK_CARDS].reverse(), likedCards: [], skippedCards: [] })
}));
