import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, LocationData, UserLocationState } from '@/services/locationService';

export const useUserLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [userLocations, setUserLocations] = useState<Record<string, UserLocationState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to store channel references to prevent multiple subscriptions
  const locationChannelRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  // Get location for a specific user
  const getUserLocation = (userId: string): LocationData | null => {
    return userLocations[userId]?.location || null;
  };

  // Update current user's location
  const updateLocation = async () => {
    if (!user) return;

    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      // Update presence with new location using existing channel
      if (locationChannelRef.current) {
        const locationState = {
          userId: user.id,
          location,
          timestamp: new Date().toISOString()
        };
        await locationChannelRef.current.track(locationState);
      }
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update location');
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    console.log('[useUserLocation] Setting up location tracking for user:', user.id);

    const initializeLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const location = await getCurrentLocation();
        setCurrentLocation(location);

        // Clean up existing channels first
        if (locationChannelRef.current) {
          locationChannelRef.current.unsubscribe();
          supabase.removeChannel(locationChannelRef.current);
        }
        if (presenceChannelRef.current) {
          presenceChannelRef.current.unsubscribe();
          supabase.removeChannel(presenceChannelRef.current);
        }

        // Create location tracking channel
        const locationChannelName = `user_location_${user.id}`;
        locationChannelRef.current = supabase.channel(locationChannelName);
        
        const locationState = {
          userId: user.id,
          location,
          timestamp: new Date().toISOString()
        };

        await locationChannelRef.current.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('[useUserLocation] Location channel subscribed');
            await locationChannelRef.current.track(locationState);
          }
        });

        // Create presence listening channel
        const presenceChannelName = `user_locations_global`;
        presenceChannelRef.current = supabase.channel(presenceChannelName)
          .on('presence', { event: 'sync' }, () => {
            const presenceState = presenceChannelRef.current.presenceState();
            const locations: Record<string, UserLocationState> = {};
            
            Object.values(presenceState).forEach((presences: any) => {
              presences.forEach((state: any) => {
                if (state.userId && state.location && state.userId !== user.id) {
                  locations[state.userId] = state as UserLocationState;
                }
              });
            });
            
            setUserLocations(locations);
          })
          .on('presence', { event: 'join' }, ({ newPresences }) => {
            newPresences.forEach((presence: any) => {
              if (presence.userId && presence.location && presence.userId !== user.id) {
                setUserLocations(prev => ({
                  ...prev,
                  [presence.userId]: presence as UserLocationState
                }));
              }
            });
          })
          .on('presence', { event: 'leave' }, ({ leftPresences }) => {
            leftPresences.forEach((presence: any) => {
              if (presence.userId && presence.userId !== user.id) {
                setUserLocations(prev => {
                  const updated = { ...prev };
                  delete updated[presence.userId];
                  return updated;
                });
              }
            });
          });

        await presenceChannelRef.current.subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('[useUserLocation] Presence channel subscribed');
          }
        });

      } catch (err) {
        console.error('Error initializing location:', err);
        setError('Failed to get location');
      } finally {
        setLoading(false);
      }
    };

    initializeLocation();

    // Cleanup on unmount or user change
    return () => {
      console.log('[useUserLocation] Cleaning up location tracking');
      if (locationChannelRef.current) {
        locationChannelRef.current.unsubscribe();
        supabase.removeChannel(locationChannelRef.current);
        locationChannelRef.current = null;
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe();
        supabase.removeChannel(presenceChannelRef.current);
        presenceChannelRef.current = null;
      }
    };
  }, [user?.id]); // Only depend on user.id, not user object

  return {
    currentLocation,
    userLocations,
    loading,
    error,
    getUserLocation,
    updateLocation
  };
};