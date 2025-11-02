import { create } from 'zustand';

interface MarketingProfile {
  id: string;
  user_id: string;
  full_name: string;
  rating: number;
  is_promoted: boolean;
  badge?: string;
  created_at: string;
}

interface Banner {
  id: string;
  title: string;
  image_url?: string;
  link?: string;
  is_active: boolean;
}

interface MarketingState {
  profiles: MarketingProfile[];
  banners: Banner[];
  isLoading: boolean;
  setProfiles: (profiles: MarketingProfile[]) => void;
  promoteProfile: (id: string) => void;
  setBanners: (banners: Banner[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useMarketingStore = create<MarketingState>((set) => ({
  profiles: [],
  banners: [],
  isLoading: false,
  setProfiles: (profiles) => set({ profiles }),
  promoteProfile: (id) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === id ? { ...p, is_promoted: true, badge: 'TOP' } : p
      ),
    })),
  setBanners: (banners) => set({ banners }),
  setLoading: (isLoading) => set({ isLoading }),
}));
