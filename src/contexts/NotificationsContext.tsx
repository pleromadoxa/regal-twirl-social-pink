
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { NotificationsContextType } from '@/types/notifications';
import { useNotificationsData } from '@/hooks/useNotificationsData';

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const notificationsData = useNotificationsData(user?.id, authLoading);

  return (
    <NotificationsContext.Provider value={notificationsData}>
      {children}
    </NotificationsContext.Provider>
  );
};
