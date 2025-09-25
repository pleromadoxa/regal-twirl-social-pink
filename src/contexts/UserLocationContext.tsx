import React, { createContext, useContext, ReactNode } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { LocationData, UserLocationState } from '@/services/locationService';

interface UserLocationContextType {
  currentLocation: LocationData | null;
  userLocations: Record<string, UserLocationState>;
  loading: boolean;
  error: string | null;
  getUserLocation: (userId: string) => LocationData | null;
  updateLocation: () => Promise<void>;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

interface UserLocationProviderProps {
  children: ReactNode;
}

export const UserLocationProvider = ({ children }: UserLocationProviderProps) => {
  const locationData = useUserLocation();

  return (
    <UserLocationContext.Provider value={locationData}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocationContext = () => {
  const context = useContext(UserLocationContext);
  if (context === undefined) {
    throw new Error('useUserLocationContext must be used within a UserLocationProvider');
  }
  return context;
};