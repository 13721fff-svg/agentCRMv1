import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type TableName = 'orders' | 'clients' | 'meetings' | 'tasks' | 'campaigns' | 'team_members';

interface RealtimeCallbacks {
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  subscribe(
    table: TableName,
    orgId: string,
    callbacks: RealtimeCallbacks
  ): () => void {
    const channelName = `${table}:${orgId}`;

    if (this.channels.has(channelName)) {
      console.log(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          console.log(`INSERT on ${table}:`, payload);
          callbacks.onInsert?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          console.log(`UPDATE on ${table}:`, payload);
          callbacks.onUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          console.log(`DELETE on ${table}:`, payload);
          callbacks.onDelete?.(payload.old);
        }
      )
      .subscribe((status) => {
        console.log(`Realtime ${table} status:`, status);
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  subscribeToUser(userId: string, callbacks: RealtimeCallbacks): () => void {
    const channelName = `user:${userId}`;

    if (this.channels.has(channelName)) {
      console.log(`Already subscribed to ${channelName}`);
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `assigned_to=eq.${userId}`,
        },
        (payload) => {
          console.log('Task update for user:', payload);
          if (payload.eventType === 'INSERT') callbacks.onInsert?.(payload.new);
          if (payload.eventType === 'UPDATE') callbacks.onUpdate?.(payload.new);
          if (payload.eventType === 'DELETE') callbacks.onDelete?.(payload.old);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings',
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          const participants = newData?.participants || oldData?.participants || [];
          if (participants.includes(userId)) {
            console.log('Meeting update for user:', payload);
            if (payload.eventType === 'INSERT') callbacks.onInsert?.(payload.new);
            if (payload.eventType === 'UPDATE') callbacks.onUpdate?.(payload.new);
            if (payload.eventType === 'DELETE') callbacks.onDelete?.(payload.old);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime user ${userId} status:`, status);
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`Unsubscribed from ${channelName}`);
    }
  }

  unsubscribeAll(): void {
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
      console.log(`Unsubscribed from ${name}`);
    });
    this.channels.clear();
  }

  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

export const realtimeService = new RealtimeService();
