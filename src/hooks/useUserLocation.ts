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
  
  // Use ref to store channel reference for presence tracking
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
      if (presenceChannelRef.current) {
        const locationState = {
          userId: user.id,
          location,
          timestamp: new Date().toISOString()
        };
        await presenceChannelRef.current.track(locationState);
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

        // Clean up existing channel first
        if (presenceChannelRef.current) {
          try {
            presenceChannelRef.current.unsubscribe();
            supabase.removeChannel(presenceChannelRef.current);
          } catch (error) {
            console.warn('Error cleaning up presence channel:', error);
          }
          presenceChannelRef.current = null;
        }

        // Create single presence channel for both tracking and listening
        const presenceChannelName = `user_locations_global`;
        
        presenceChannelRef.current = supabase
          .channel(presenceChannelName)
          .on('presence', { event: 'sync' }, () => {
            const presenceState = presenceChannelRef.current.presenceState();
            const locations: Record<string, UserLocationState> = {};
            
            Object.values(presenceState).forEach((presences: any) => {
              if (Array.isArray(presences)) {
                presences.forEach((state: any) => {
                  if (state.userId && state.location && state.userId !== user.id) {
                    locations[state.userId] = state as UserLocationState;
                  }
                });
              }
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

        presenceChannelRef.current.subscribe(async (status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('[useUserLocation] Presence channel subscribed');
            
            // Track current user's location
            const locationState = {
              userId: user.id,
              location,
              timestamp: new Date().toISOString()
            };
            
            await presenceChannelRef.current.track(locationState);
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
      if (presenceChannelRef.current) {
        try {
          presenceChannelRef.current.unsubscribe();
          supabase.removeChannel(presenceChannelRef.current);
        } catch (error) {
          console.warn('Error cleaning up presence channel:', error);
        }
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