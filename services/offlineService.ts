import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface QueuedAction {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
}

class OfflineService {
  private isOnline = true;
  private syncInProgress = false;
  private listeners: ((isOnline: boolean) => void)[] = [];

  async init() {
    this.isOnline = true;
  }

  onNetworkChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline));
  }

  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  async cacheData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`cache:${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Cache error:', error);
    }
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(`cache:${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  async clearCache(key?: string): Promise<void> {
    try {
      if (key) {
        await AsyncStorage.removeItem(`cache:${key}`);
      } else {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter((k) => k.startsWith('cache:'));
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      console.error('Clear cache error:', error);
    }
  }

  async queueAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> {
    try {
      const queue = await this.getQueue();
      const newAction: QueuedAction = {
        ...action,
        id: `${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
      };
      queue.push(newAction);
      await AsyncStorage.setItem('offline:queue', JSON.stringify(queue));

      if (this.isOnline) {
        await this.syncQueue();
      }
    } catch (error) {
      console.error('Queue action error:', error);
    }
  }

  private async getQueue(): Promise<QueuedAction[]> {
    try {
      const data = await AsyncStorage.getItem('offline:queue');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Get queue error:', error);
      return [];
    }
  }

  async syncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    try {
      this.syncInProgress = true;
      const queue = await this.getQueue();

      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }

      console.log(`Syncing ${queue.length} queued actions...`);

      for (const action of queue) {
        try {
          await this.executeAction(action);
        } catch (error) {
          console.error('Action execution error:', action, error);
        }
      }

      await AsyncStorage.setItem('offline:queue', JSON.stringify([]));
      console.log('Sync completed');
    } catch (error) {
      console.error('Sync queue error:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'INSERT':
        await supabase.from(action.table).insert([action.data]);
        break;
      case 'UPDATE':
        await supabase.from(action.table).update(action.data).eq('id', action.data.id);
        break;
      case 'DELETE':
        await supabase.from(action.table).delete().eq('id', action.data.id);
        break;
    }
  }

  async getQueuedActionsCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  async clearQueue(): Promise<void> {
    await AsyncStorage.setItem('offline:queue', JSON.stringify([]));
  }

  async fetchWithCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> {
    if (!this.isOnline && !forceRefresh) {
      const cached = await this.getCachedData<T>(key);
      if (cached) return cached;
    }

    try {
      const data = await fetcher();
      await this.cacheData(key, data);
      return data;
    } catch (error) {
      const cached = await this.getCachedData<T>(key);
      if (cached) return cached;
      throw error;
    }
  }
}

export const offlineService = new OfflineService();
