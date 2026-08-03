import { create } from 'zustand';
import apiClient from '../api/client';

export interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  imageUrl: string;
  address: string;
}

interface MapState {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  isLoading: boolean;
  error: string | null;
  setSelectedLocation: (location: MapLocation | null) => void;
  fetchLocations: () => Promise<void>;
}

export const useMapStore = create<MapState>((set) => ({
  locations: [],
  selectedLocation: null,
  isLoading: false,
  error: null,
  
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  
  fetchLocations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/restaurants');
      const backendRests = response.data.data;
      
      const mappedLocations: MapLocation[] = backendRests.map((r: any) => {
        // Mocking coordinates near HCMC center if none provided
        const lat = r.location?.lat || (10.7769 + (Math.random() - 0.5) * 0.02);
        const lng = r.location?.lng || (106.7009 + (Math.random() - 0.5) * 0.02);
        
        return {
          id: r.id,
          name: r.name,
          lat,
          lng,
          category: r.tags ? r.tags[0] : 'Restaurant',
          rating: r.rating || (3.5 + Math.random() * 1.5).toFixed(1),
          imageUrl: 'https://images.unsplash.com/photo-1544025162-8356fd10519f?auto=format&fit=crop&w=200&q=80',
          address: r.address || 'HCMC'
        };
      });
      
      set({ locations: mappedLocations, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch locations:', err);
      set({ error: err.message || 'Failed to fetch', isLoading: false });
    }
  }
}));
