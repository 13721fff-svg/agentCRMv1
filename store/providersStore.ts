import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Provider {
  id: string;
  name: string;
  category_id: string;
  description: string;
  rating: number;
  reviews_count: number;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_uk: string;
  icon: string;
  color: string;
}

interface ProvidersState {
  providers: Provider[];
  categories: Category[];
  loading: boolean;
  error: string | null;

  fetchProviders: () => Promise<void>;
  fetchProvidersByCategory: (categoryId: string) => Promise<Provider[]>;
  fetchProviderById: (id: string) => Promise<Provider | null>;
  fetchCategories: () => Promise<void>;
  calculateDistance: (lat: number, lon: number) => number;
}

export const useProvidersStore = create<ProvidersState>((set, get) => ({
  providers: [],
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('provider_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ categories: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProviders: async () => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;
      set({ providers: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProvidersByCategory: async (categoryId: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('category_id', categoryId)
        .order('rating', { ascending: false });

      if (error) throw error;
      set({ loading: false });
      return data || [];
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return [];
    }
  },

  fetchProviderById: async (id: string) => {
    try {
      set({ loading: true, error: null });
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      set({ loading: false });
      return data;
    } catch (error: any) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  calculateDistance: (lat: number, lon: number) => {
    return Math.random() * 10;
  },
}));
