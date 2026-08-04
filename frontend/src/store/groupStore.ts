import { create } from 'zustand';
import apiClient from '../api/client';
import { io, Socket } from 'socket.io-client';

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

export interface VoteStateData {
  options: { [restaurantId: string]: number };
  userVotes: { [userId: string]: string };
}

export interface TripStopData {
  stopOrder: number;
  stopName: string;
  recommendedDish: string;
  recommendedPlace: string;
  estimatedTime: string;
}

export interface TripPlanData {
  tripTitle: string;
  stops: TripStopData[];
  googleMapsUrl: string;
  totalEstimatedTime: string;
}

interface GroupState {
  groups: FoodGroup[];
  activeTab: 'GROUPS' | 'BILLS' | 'TRIPS' | 'OFFICE';
  isLoading: boolean;
  isTripLoading: boolean;
  error: string | null;
  
  socket: Socket | null;
  activeVotes: { [groupId: string]: VoteStateData | null };
  tripPlan: TripPlanData | null;
  
  setActiveTab: (tab: 'GROUPS' | 'BILLS' | 'TRIPS' | 'OFFICE') => void;
  fetchGroups: () => Promise<void>;
  generateTripPlan: (tripTitle: string, stops: string[]) => Promise<void>;
  
  connectSocket: () => void;
  joinGroupVoting: (groupId: string) => void;
  startVote: (groupId: string, restaurantIds: string[]) => void;
  castVote: (groupId: string, userId: string, restaurantId: string) => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeTab: 'GROUPS',
  isLoading: false,
  isTripLoading: false,
  error: null,
  socket: null,
  activeVotes: {},
  tripPlan: null,
  
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
  },

  connectSocket: () => {
    const currentSocket = get().socket;
    if (!currentSocket) {
      const baseURL = apiClient.defaults.baseURL || 'http://localhost:3000/api';
      // extract host and port from baseURL
      const socketUrl = baseURL.replace('/api', '');
      
      const newSocket = io(socketUrl);
      set({ socket: newSocket });

      newSocket.on('voteUpdate', () => {
        // We get vote updates without knowing the group ID if it's broadcst to the room,
        // Wait, our backend currently broadcasts to the room, so we need to know WHICH group it is.
        // Let's modify the socket payload if needed, or we just store the current focused group vote.
      });
    }
  },

  joinGroupVoting: (groupId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('joinGroup', groupId);
      
      socket.on('voteUpdate', (voteState: VoteStateData) => {
        set((state) => ({
          activeVotes: { ...state.activeVotes, [groupId]: voteState }
        }));
      });

      socket.on('voteEnded', () => {
        set((state) => ({
          activeVotes: { ...state.activeVotes, [groupId]: null }
        }));
      });
    }
  },

  startVote: (groupId: string, restaurantIds: string[]) => {
    const { socket } = get();
    if (socket) {
      socket.emit('startVote', groupId, restaurantIds);
    }
  },

  castVote: (groupId: string, userId: string, restaurantId: string) => {
    const { socket } = get();
    if (socket) {
      socket.emit('castVote', groupId, userId, restaurantId);
    }
  },

  generateTripPlan: async (tripTitle: string, stops: string[]) => {
    set({ isTripLoading: true });
    try {
      const response = await apiClient.post('/groups/trip-planner', { tripTitle, stops });
      set({ tripPlan: response.data.data, isTripLoading: false });
    } catch (err: any) {
      console.error('Failed to generate trip plan:', err);
      set({ isTripLoading: false });
    }
  }
}));
