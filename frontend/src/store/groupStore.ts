import { create } from 'zustand';
import apiClient from '../api/client';

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
}

export interface SplitBill {
  id: string;
  restaurantName: string;
  totalAmount: number;
  date: string;
  status: 'PENDING' | 'SETTLED';
  myShare: number;
  paid: boolean;
}

export interface FoodGroup {
  id: string;
  name: string;
  members: GroupMember[];
  activeBills: SplitBill[];
}

interface GroupState {
  groups: FoodGroup[];
  activeTab: 'GROUPS' | 'BILLS';
  isLoading: boolean;
  error: string | null;
  setActiveTab: (tab: 'GROUPS' | 'BILLS') => void;
  fetchGroups: () => Promise<void>;
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  activeTab: 'GROUPS',
  isLoading: false,
  error: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get('/groups');
      const backendGroups = response.data.data;
      
      const mappedGroups: FoodGroup[] = backendGroups.map((g: any, index: number) => ({
        id: g.id,
        name: g.name,
        // Mocking members since GET /groups doesn't return full members list
        members: [
          { id: g.creator_id, name: 'Creator', avatar: `https://i.pravatar.cc/150?u=${g.creator_id}` },
          { id: `u${index}-1`, name: 'Member 1', avatar: `https://i.pravatar.cc/150?u=u${index}-1` }
        ],
        // Mocking bills
        activeBills: [
          {
            id: `b${index}-1`,
            restaurantName: 'Pizza 4P\'s',
            totalAmount: 1200000,
            date: '2026-08-01',
            status: 'PENDING',
            myShare: 400000,
            paid: false
          }
        ]
      }));
      
      set({ groups: mappedGroups, isLoading: false });
    } catch (err: any) {
      console.error('Failed to fetch groups:', err);
      set({ error: err.message || 'Failed to fetch', isLoading: false });
    }
  }
}));
