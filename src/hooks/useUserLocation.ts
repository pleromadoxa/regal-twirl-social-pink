import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, LocationData, UserLocationState } from '@/services/locationService';

export const useUserLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [userLocations, setUserLocations] = useState<Record<string, UserLocationState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user's location
  const initializeLocation = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Track location in Supabase presence
      const channel = supabase.channel(`user_location_${user.id}`);
      
      const locationState = {
        userId: user.id,
        location,
        timestamp: new Date().toISOString()
      };

      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(locationState);
        }
      });

      return () => {
        channel.unsubscribe();
      };
    } catch (err) {
      console.error('Error getting location:', err);
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Subscribe to other users' locations
  const subscribeToUserLocations = useCallback(() => {
    if (!user) return;

    const channel = supabase.channel('user_locations_global')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const locations: Record<string, UserLocationState> = {};
        
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((state: any) => {
            if (state.userId && state.location) {
              locations[state.userId] = state as UserLocationState;
            }
          });
        });
        
        setUserLocations(locations);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.userId && presence.location) {
            setUserLocations(prev => ({
              ...prev,
              [presence.userId]: presence as UserLocationState
            }));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence.userId) {
            setUserLocations(prev => {
              const updated = { ...prev };
              delete updated[presence.userId];
              return updated;
            });
          }
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  // Get location for a specific user
  const getUserLocation = useCallback((userId: string): LocationData | null => {
    return userLocations[userId]?.location || null;
  }, [userLocations]);

  // Update current user's location
  const updateLocation = useCallback(async () => {
    if (!user) return;

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Update presence with new location
      const channel = supabase.channel(`user_location_${user.id}`);
      const locationState = {
        userId: user.id,
        location,
        timestamp: new Date().toISOString()
      };

      await channel.track(locationState);
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location');
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeLocation: (() => void) | undefined;
    let unsubscribeGlobal: (() => void) | undefined;

    const setup = async () => {
      unsubscribeLocation = await initializeLocation();
      unsubscribeGlobal = subscribeToUserLocations();
    };

    if (user) {
      setup();
    }

    return () => {
      unsubscribeLocation?.();
      unsubscribeGlobal?.();
    };
  }, [user, initializeLocation, subscribeToUserLocations]);

  return {
    currentLocation,
    userLocations,
    loading,
    error,
    getUserLocation,
    updateLocation
  };
};