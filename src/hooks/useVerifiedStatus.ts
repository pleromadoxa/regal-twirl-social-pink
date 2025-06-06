
import { useMemo } from 'react';

interface User {
  username?: string;
  is_verified?: boolean;
  followers_count?: number;
}

export const useVerifiedStatus = (user: User | null | undefined) => {
  const isVerified = useMemo(() => {
    if (!user) return false;
    
    // Special case for @pleromadoxa
    if (user.username === 'pleromadoxa') {
      return true;
    }
    
    // Check if manually verified
    if (user.is_verified) {
      return true;
    }
    
    // Check if has 100+ followers
    if (user.followers_count && user.followers_count >= 100) {
      return true;
    }
    
    return false;
  }, [user?.username, user?.is_verified, user?.followers_count]);

  return isVerified;
};
