import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  totalClients: number;
  avgOrderValue: number;
  conversionRate: number;
  activeClients: number;
  completedOrders: number;
  pendingOrders: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface TopClient {
  id: string;
  name: string;
  total: number;
  orders: number;
}

interface AnalyticsState {
  kpis: KPIData;
  revenueByMonth: ChartDataPoint[];
  ordersByStatus: ChartDataPoint[];
  topClients: TopClient[];
  loading: boolean;
  lastUpdated: string | null;
  loadKPIs: (orgId: string) => Promise<void>;
  loadCharts: (orgId: string) => Promise<void>;
  refresh: (orgId: string) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  kpis: {
    totalRevenue: 0,
    totalOrders: 0,
    totalClients: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    activeClients: 0,
    completedOrders: 0,
    pendingOrders: 0,
  },
  revenueByMonth: [],
  ordersByStatus: [],
  topClients: [],
  loading: false,
  lastUpdated: null,

  loadKPIs: async (orgId: string) => {
    set({ loading: true });

    try {
      const [ordersRes, clientsRes] = await Promise.all([
        supabase.from('orders').select('amount, status, created_at, client_id').eq('org_id', orgId),
        supabase.from('clients').select('id').eq('org_id', orgId),
      ]);

      const orders = ordersRes.data || [];
      const clients = clientsRes.data || [];

      const completedOrders = orders.filter((o) => o.status === 'completed');
      const pendingOrders = orders.filter((o) => o.status === 'pending');

      const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      const totalOrders = orders.length;
      const totalClients = clients.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const completedCount = completedOrders.length;
      const conversionRate = totalOrders > 0 ? (completedCount / totalOrders) * 100 : 0;

      const clientsWithOrders = new Set(orders.map((o) => o.client_id).filter(Boolean));
      const activeClients = clientsWithOrders.size;

      set({
        kpis: {
          totalRevenue,
          totalOrders,
          totalClients,
          avgOrderValue,
          conversionRate,
          activeClients,
          completedOrders: completedCount,
          pendingOrders: pendingOrders.length,
        },
        loading: false,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error loading KPIs:', error);
      set({ loading: false });
    }
  },

  loadCharts: async (orgId: string) => {
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        supabase
          .from('orders')
          .select('amount, status, created_at, client_id')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('id, full_name').eq('org_id', orgId),
      ]);

      const orders = ordersRes.data || [];
      const clients = clientsRes.data || [];

      const revenueByMonth = calculateRevenueByMonth(orders);
      const ordersByStatus = calculateOrdersByStatus(orders);
      const topClients = calculateTopClients(orders, clients);

      set({
        revenueByMonth,
        ordersByStatus,
        topClients,
      });
    } catch (error) {
      console.error('Error loading charts:', error);
    }
  },

  refresh: async (orgId: string) => {
    await Promise.all([get().loadKPIs(orgId), get().loadCharts(orgId)]);
  },
}));

function calculateRevenueByMonth(orders: any[]): ChartDataPoint[] {
  const monthlyRevenue: Record<string, number> = {};

  orders.forEach((order) => {
    if (order.status === 'completed' && order.amount) {
      const date = new Date(order.created_at);
      const monthKey = date.toLocaleDateString('uk-UA', { month: 'short', year: 'numeric' });

      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += order.amount;
    }
  });

  return Object.entries(monthlyRevenue)
    .map(([label, value]) => ({ label, value }))
    .slice(-6);
}

function calculateOrdersByStatus(orders: any[]): ChartDataPoint[] {
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    in_progress: '#0284c7',
    completed: '#16a34a',
    cancelled: '#ef4444',
  };

  const statusCounts: Record<string, number> = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
  };

  orders.forEach((order) => {
    if (statusCounts[order.status] !== undefined) {
      statusCounts[order.status]++;
    }
  });

  const statusLabels: Record<string, string> = {
    pending: 'Очікує',
    in_progress: 'У роботі',
    completed: 'Виконано',
    cancelled: 'Скасовано',
  };

  return Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, value]) => ({
      label: statusLabels[status] || status,
      value,
      color: statusColors[status],
    }));
}

function calculateTopClients(orders: any[], clients: any[]): TopClient[] {
  const clientTotals: Record<
    string,
    { name: string; total: number; orders: number }
  > = {};

  orders.forEach((order) => {
    if (order.client_id && order.status === 'completed' && order.amount) {
      if (!clientTotals[order.client_id]) {
        const client = clients.find((c) => c.id === order.client_id);
        clientTotals[order.client_id] = {
          name: client?.full_name || 'Невідомий клієнт',
          total: 0,
          orders: 0,
        };
      }
      clientTotals[order.client_id].total += order.amount;
      clientTotals[order.client_id].orders++;
    }
  });

  return Object.entries(clientTotals)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}
