import { create } from 'zustand';
import { Meeting } from '@/types';

interface MeetingsState {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  isLoading: boolean;
  setMeetings: (meetings: Meeting[]) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  selectMeeting: (meeting: Meeting | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMeetingsStore = create<MeetingsState>((set) => ({
  meetings: [],
  selectedMeeting: null,
  isLoading: false,
  setMeetings: (meetings) => set({ meetings }),
  addMeeting: (meeting) => set((state) => ({ meetings: [meeting, ...state.meetings] })),
  updateMeeting: (id, updates) =>
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  deleteMeeting: (id) =>
    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== id),
    })),
  selectMeeting: (selectedMeeting) => set({ selectedMeeting }),
  setLoading: (isLoading) => set({ isLoading }),
}));
