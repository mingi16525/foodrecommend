import { create } from 'zustand';

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
  setSelectedLocation: (location: MapLocation | null) => void;
}

const MOCK_LOCATIONS: MapLocation[] = [
  {
    id: 'r1',
    name: 'Pho Pasteur',
    lat: 10.7769,
    lng: 106.7009,
    category: 'Vietnamese',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1544025162-8356fd10519f?auto=format&fit=crop&w=200&q=80',
    address: '123 Pasteur St, District 1, HCMC'
  },
  {
    id: 'r2',
    name: 'Pizza 4P\'s',
    lat: 10.7795,
    lng: 106.7020,
    category: 'Italian',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80',
    address: '8/15 Le Thanh Ton, District 1, HCMC'
  },
  {
    id: 'r3',
    name: 'Sushi Rei',
    lat: 10.7820,
    lng: 106.7050,
    category: 'Japanese',
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=200&q=80',
    address: '10 Nguyen Thi Minh Khai, District 1, HCMC'
  },
  {
    id: 'r4',
    name: 'The Workshop Coffee',
    lat: 10.7750,
    lng: 106.7045,
    category: 'Cafe',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1495474472201-3ce3ed4224b2?auto=format&fit=crop&w=200&q=80',
    address: '27 Ngo Duc Ke, District 1, HCMC'
  }
];

export const useMapStore = create<MapState>((set) => ({
  locations: MOCK_LOCATIONS,
  selectedLocation: null,
  setSelectedLocation: (location) => set({ selectedLocation: location })
}));
