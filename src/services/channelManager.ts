import { supabase } from '@/integrations/supabase/client';

interface ChannelRegistry {
  [channelName: string]: {
    channel: any;
    subscribers: number;
    subscribed: boolean;
  };
}

class ChannelManager {
  private registry: ChannelRegistry = {};

  /**
   * Creates or reuses an existing channel
   */
  getChannel(channelName: string): any {
    if (this.registry[channelName]) {
      this.registry[channelName].subscribers++;
      console.log(`📡 Reusing existing channel: ${channelName} (${this.registry[channelName].subscribers} subscribers)`);
      return this.registry[channelName].channel;
    }

    console.log(`📡 Creating new channel: ${channelName}`);
    const channel = supabase.channel(channelName);
    this.registry[channelName] = {
      channel,
      subscribers: 1,
      subscribed: false
    };

    return channel;
  }

  /**
   * Removes a channel subscription and cleans up if no more subscribers
   */
  removeChannel(channelName: string): void {
    if (!this.registry[channelName]) {
      console.warn(`📡 Attempted to remove non-existent channel: ${channelName}`);
      return;
    }

    this.registry[channelName].subscribers--;
    console.log(`📡 Removing channel subscription: ${channelName} (${this.registry[channelName].subscribers} remaining)`);

    if (this.registry[channelName].subscribers <= 0) {
      console.log(`📡 Cleaning up channel: ${channelName}`);
      try {
        supabase.removeChannel(this.registry[channelName].channel);
      } catch (error) {
        console.error(`Error removing channel ${channelName}:`, error);
      }
      delete this.registry[channelName];
    }
  }

  /**
   * Safely subscribe to a channel, preventing duplicate subscriptions
   */
  subscribeToChannel(channelName: string, config: any): any {
    const channel = this.getChannel(channelName);
    const registry = this.registry[channelName];
    
    // Check if channel is already subscribed
    if (registry && registry.subscribed) {
      console.log(`📡 Channel ${channelName} already subscribed`);
      return channel;
    }

    // Apply configuration
    Object.entries(config).forEach(([event, handler]: [string, any]) => {
      if (event === 'presence') {
        channel.on('presence', handler.event, handler.callback);
      } else if (event === 'postgres_changes') {
        channel.on('postgres_changes', handler.config, handler.callback);
      }
    });

    // Subscribe only once
    channel.subscribe((status: string) => {
      console.log(`📡 Channel ${channelName} subscription status: ${status}`);
      if (status === 'SUBSCRIBED' && registry) {
        registry.subscribed = true;
      }
    });

    return channel;
  }

  /**
   * Clean up all channels (useful on app shutdown or user logout)
   */
  cleanupAll(): void {
    console.log('📡 Cleaning up all channels');
    Object.keys(this.registry).forEach(channelName => {
      try {
        supabase.removeChannel(this.registry[channelName].channel);
      } catch (error) {
        console.error(`Error cleaning up channel ${channelName}:`, error);
      }
    });
    this.registry = {};
  }

  /**
   * Get current registry for debugging
   */
  getRegistry(): ChannelRegistry {
    return this.registry;
  }
}

// Singleton instance
export const channelManager = new ChannelManager();

// Helper function to create stable channel names (removed timestamp)
export const createUniqueChannelName = (prefix: string, identifier: string): string => {
  return `${prefix}-${identifier}`;
};