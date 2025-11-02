import { create } from 'zustand';
import { User } from '@/types';

interface TeamMember extends User {
  permissions?: string[];
}

interface TeamState {
  members: TeamMember[];
  selectedMember: TeamMember | null;
  isLoading: boolean;
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: TeamMember) => void;
  updateMember: (id: string, updates: Partial<TeamMember>) => void;
  removeMember: (id: string) => void;
  selectMember: (member: TeamMember | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: [],
  selectedMember: null,
  isLoading: false,
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  updateMember: (id, updates) =>
    set((state) => ({
      members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  removeMember: (id) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    })),
  selectMember: (selectedMember) => set({ selectedMember }),
  setLoading: (isLoading) => set({ isLoading }),
}));
