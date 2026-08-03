import { create } from 'zustand';

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
  setActiveTab: (tab: 'GROUPS' | 'BILLS') => void;
}

const MOCK_GROUPS: FoodGroup[] = [
  {
    id: 'g1',
    name: 'Weekend Foodies',
    members: [
      { id: 'u1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=u1' },
      { id: 'u2', name: 'Alex', avatar: 'https://i.pravatar.cc/150?u=u2' },
      { id: 'u3', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=u3' }
    ],
    activeBills: [
      {
        id: 'b1',
        restaurantName: 'Pizza 4P\'s',
        totalAmount: 1200000,
        date: '2026-08-01',
        status: 'PENDING',
        myShare: 400000,
        paid: false
      }
    ]
  },
  {
    id: 'g2',
    name: 'Office Lunch',
    members: [
      { id: 'u1', name: 'You', avatar: 'https://i.pravatar.cc/150?u=u1' },
      { id: 'u4', name: 'Mike', avatar: 'https://i.pravatar.cc/150?u=u4' },
      { id: 'u5', name: 'Jenny', avatar: 'https://i.pravatar.cc/150?u=u5' },
      { id: 'u6', name: 'Tom', avatar: 'https://i.pravatar.cc/150?u=u6' }
    ],
    activeBills: [
      {
        id: 'b2',
        restaurantName: 'Pho 24',
        totalAmount: 320000,
        date: '2026-08-02',
        status: 'SETTLED',
        myShare: 80000,
        paid: true
      },
      {
        id: 'b3',
        restaurantName: 'The Workshop Coffee',
        totalAmount: 450000,
        date: '2026-08-03',
        status: 'PENDING',
        myShare: 112500,
        paid: false
      }
    ]
  }
];

export const useGroupStore = create<GroupState>((set) => ({
  groups: MOCK_GROUPS,
  activeTab: 'GROUPS',
  setActiveTab: (tab) => set({ activeTab: tab })
}));
