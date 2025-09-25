import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentLocation, LocationData, UserLocationState } from '@/services/locationService';
import { subscriptionManager } from '@/utils/subscriptionManager';

export const useUserLocation = () => {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [userLocations, setUserLocations] = useState<Record<string, UserLocationState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to store unsubscribe functions
  const locationUnsubscribeRef = useRef<(() => void) | null>(null);
  const presenceUnsubscribeRef = useRef<(() => void) | null>(null);

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

      // Location update will be handled automatically by the subscription
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

        // Clean up existing subscriptions first
        if (locationUnsubscribeRef.current) {
          locationUnsubscribeRef.current();
          locationUnsubscribeRef.current = null;
        }
        if (presenceUnsubscribeRef.current) {
          presenceUnsubscribeRef.current();
          presenceUnsubscribeRef.current = null;
        }

        // Create location tracking subscription
        const locationChannelName = `user_location_${user.id}`;
        
        locationUnsubscribeRef.current = subscriptionManager.subscribe(locationChannelName, {
          presence: {
            event: 'sync',
            callback: () => {
              console.log('[useUserLocation] Location channel subscribed');
            }
          }
        });

        // Create presence listening subscription
        const presenceChannelName = `user_locations_global`;
        
        presenceUnsubscribeRef.current = subscriptionManager.subscribe(presenceChannelName, {
          presence: [
            {
              event: 'sync',
              callback: (payload: any) => {
                const presenceState = payload.presenceState || {};
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
              }
            },
            {
              event: 'join',
              callback: ({ newPresences }: { newPresences: any[] }) => {
                newPresences.forEach((presence: any) => {
                  if (presence.userId && presence.location && presence.userId !== user.id) {
                    setUserLocations(prev => ({
                      ...prev,
                      [presence.userId]: presence as UserLocationState
                    }));
                  }
                });
              }
            },
            {
              event: 'leave',
              callback: ({ leftPresences }: { leftPresences: any[] }) => {
                leftPresences.forEach((presence: any) => {
                  if (presence.userId && presence.userId !== user.id) {
                    setUserLocations(prev => {
                      const updated = { ...prev };
                      delete updated[presence.userId];
                      return updated;
                    });
                  }
                });
              }
            }
          ]
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
      if (locationUnsubscribeRef.current) {
        locationUnsubscribeRef.current();
        locationUnsubscribeRef.current = null;
      }
      if (presenceUnsubscribeRef.current) {
        presenceUnsubscribeRef.current();
        presenceUnsubscribeRef.current = null;
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