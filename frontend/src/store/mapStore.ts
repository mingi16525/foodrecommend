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

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

interface MapState {
  locations: MapLocation[];
  selectedLocation: MapLocation | null;
  userLocation: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
  setSelectedLocation: (location: MapLocation | null) => void;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
  fetchLocations: () => Promise<void>;
  getUserLocation: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  locations: [],
  selectedLocation: null,
  userLocation: null,
  isLoading: false,
  error: null,
  
  setSelectedLocation: (location) => set({ selectedLocation: location }),
  setUserLocation: (location) => set({ userLocation: location }),
  
  getUserLocation: () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        set({
          userLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      },
      (error) => {
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  },
  
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
