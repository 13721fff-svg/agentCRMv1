import { create } from 'zustand';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  max_clients: number;
  max_team_members: number;
  max_orders_per_month: number;
  features: {
    analytics: boolean;
    campaigns: boolean;
    team: boolean;
    api: boolean;
  };
  created_at: string;
}

export interface Subscription {
  id: string;
  org_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancelled_at?: string;
  created_at: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionUsage {
  id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  clients_count: number;
  team_members_count: number;
  orders_count: number;
  created_at: string;
}

interface SubscriptionStore {
  plans: SubscriptionPlan[];
  currentSubscription: Subscription | null;
  currentUsage: SubscriptionUsage | null;
  setPlans: (plans: SubscriptionPlan[]) => void;
  setCurrentSubscription: (subscription: Subscription | null) => void;
  setCurrentUsage: (usage: SubscriptionUsage | null) => void;
  canAddClient: () => boolean;
  canAddTeamMember: () => boolean;
  canAddOrder: () => boolean;
  getFeatureAccess: (feature: string) => boolean;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set, get) => ({
  plans: [],
  currentSubscription: null,
  currentUsage: null,

  setPlans: (plans) => set({ plans }),

  setCurrentSubscription: (subscription) => set({ currentSubscription: subscription }),

  setCurrentUsage: (usage) => set({ currentUsage: usage }),

  canAddClient: () => {
    const { currentSubscription, currentUsage } = get();
    if (!currentSubscription?.plan || !currentUsage) return true;
    return currentUsage.clients_count < currentSubscription.plan.max_clients;
  },

  canAddTeamMember: () => {
    const { currentSubscription, currentUsage } = get();
    if (!currentSubscription?.plan || !currentUsage) return true;
    return currentUsage.team_members_count < currentSubscription.plan.max_team_members;
  },

  canAddOrder: () => {
    const { currentSubscription, currentUsage } = get();
    if (!currentSubscription?.plan || !currentUsage) return true;
    return currentUsage.orders_count < currentSubscription.plan.max_orders_per_month;
  },

  getFeatureAccess: (feature: string) => {
    const { currentSubscription } = get();
    if (!currentSubscription?.plan) return false;
    return currentSubscription.plan.features[feature as keyof typeof currentSubscription.plan.features] || false;
  },

  reset: () =>
    set({
      plans: [],
      currentSubscription: null,
      currentUsage: null,
    }),
}));
