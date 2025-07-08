
import { useAuth } from '@/contexts/AuthContext';

const WebRTCCallManager = () => {
  const { user, loading } = useAuth();

  // Component maintained for compatibility but no call functionality
  if (loading || !user) return null;
  
  return null;
};

export default WebRTCCallManager;
