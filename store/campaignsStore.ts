import { create } from 'zustand';
import { Campaign } from '@/types';

interface CampaignsState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  isLoading: boolean;
  setCampaigns: (campaigns: Campaign[]) => void;
  addCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  selectCampaign: (campaign: Campaign | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCampaignsStore = create<CampaignsState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  setCampaigns: (campaigns) => set({ campaigns }),
  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  updateCampaign: (id, updates) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),
  deleteCampaign: (id) =>
    set((state) => ({
      campaigns: state.campaigns.filter((c) => c.id !== id),
    })),
  selectCampaign: (selectedCampaign) => set({ selectedCampaign }),
  setLoading: (isLoading) => set({ isLoading }),
}));
