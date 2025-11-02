import { create } from 'zustand';

export interface KPIData {
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'tip';
  title: string;
  message: string;
  action?: {
    label: string;
    route: string;
  };
  priority: 'high' | 'medium' | 'low';
  created_at: string;
}

interface DashboardState {
  kpis: KPIData[];
  insights: AIInsight[];
  loading: boolean;
  lastRefresh: Date | null;
  setKPIs: (kpis: KPIData[]) => void;
  setInsights: (insights: AIInsight[]) => void;
  addInsight: (insight: AIInsight) => void;
  removeInsight: (id: string) => void;
  setLoading: (loading: boolean) => void;
  refresh: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  kpis: [],
  insights: [],
  loading: false,
  lastRefresh: null,

  setKPIs: (kpis) => set({ kpis }),

  setInsights: (insights) => set({ insights }),

  addInsight: (insight) =>
    set((state) => ({
      insights: [insight, ...state.insights],
    })),

  removeInsight: (id) =>
    set((state) => ({
      insights: state.insights.filter((i) => i.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  refresh: () => set({ lastRefresh: new Date() }),
}));
