import { supabase } from '@/integrations/supabase/client';

interface ActiveSubscription {
  channel: any;
  refs: number;
  subscribed: boolean;
}

class SubscriptionManager {
  private activeSubscriptions = new Map<string, ActiveSubscription>();

  /**
   * Get or create a subscription with reference counting
   */
  subscribe(channelName: string, config: any): () => void {
    console.log(`[SubscriptionManager] Subscribe request for: ${channelName}`);
    
    let subscription = this.activeSubscriptions.get(channelName);
    
    if (subscription) {
      // Increment reference count for existing subscription
      subscription.refs++;
      console.log(`[SubscriptionManager] Reusing existing subscription: ${channelName} (refs: ${subscription.refs})`);
      return () => this.unsubscribe(channelName);
    }

    // Create new subscription
    console.log(`[SubscriptionManager] Creating new subscription: ${channelName}`);
    const channel = supabase.channel(channelName);
    
    // Apply configuration
    if (config.postgres_changes) {
      if (Array.isArray(config.postgres_changes)) {
        config.postgres_changes.forEach((pgConfig: any) => {
          channel.on('postgres_changes', pgConfig.config, pgConfig.callback);
        });
      } else {
        channel.on('postgres_changes', config.postgres_changes.config, config.postgres_changes.callback);
      }
    }
    
    if (config.broadcast) {
      if (Array.isArray(config.broadcast)) {
        config.broadcast.forEach((broadcastConfig: any) => {
          channel.on('broadcast', { event: broadcastConfig.event }, broadcastConfig.callback);
        });
      } else {
        channel.on('broadcast', { event: config.broadcast.event }, config.broadcast.callback);
      }
    }
    
    if (config.presence) {
      if (Array.isArray(config.presence)) {
        config.presence.forEach((presenceConfig: any) => {
          channel.on('presence', { event: presenceConfig.event }, presenceConfig.callback);
        });
      } else {
        channel.on('presence', { event: config.presence.event }, config.presence.callback);
      }
    }

    subscription = {
      channel,
      refs: 1,
      subscribed: false
    };
    
    this.activeSubscriptions.set(channelName, subscription);
    
    // Subscribe
    channel.subscribe((status: string) => {
      console.log(`[SubscriptionManager] Channel ${channelName} status: ${status}`);
      if (status === 'SUBSCRIBED' && subscription) {
        subscription.subscribed = true;
      }
    });

    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe with reference counting
   */
  private unsubscribe(channelName: string): void {
    const subscription = this.activeSubscriptions.get(channelName);
    
    if (!subscription) {
      console.warn(`[SubscriptionManager] Attempted to unsubscribe from non-existent channel: ${channelName}`);
      return;
    }

    subscription.refs--;
    console.log(`[SubscriptionManager] Unsubscribe from: ${channelName} (refs: ${subscription.refs})`);
    
    if (subscription.refs <= 0) {
      console.log(`[SubscriptionManager] Cleaning up channel: ${channelName}`);
      try {
        subscription.channel.unsubscribe();
        supabase.removeChannel(subscription.channel);
      } catch (error) {
        console.error(`[SubscriptionManager] Error cleaning up channel ${channelName}:`, error);
      }
      this.activeSubscriptions.delete(channelName);
    }
  }

  /**
   * Force cleanup all subscriptions
   */
  cleanup(): void {
    console.log('[SubscriptionManager] Force cleanup all subscriptions');
    for (const [channelName, subscription] of this.activeSubscriptions.entries()) {
      try {
        subscription.channel.unsubscribe();
        supabase.removeChannel(subscription.channel);
      } catch (error) {
        console.error(`[SubscriptionManager] Error cleaning up channel ${channelName}:`, error);
      }
    }
    this.activeSubscriptions.clear();
  }

  /**
   * Get debug info
   */
  getDebugInfo() {
    return Array.from(this.activeSubscriptions.entries()).map(([name, sub]) => ({
      channel: name,
      refs: sub.refs,
      subscribed: sub.subscribed
    }));
  }
}

export const subscriptionManager = new SubscriptionManager();