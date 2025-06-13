
import { useMemo } from 'react';

interface User {
  username?: string;
  email?: string;
  is_verified?: boolean;
  followers_count?: number;
  premium_tier?: string;
}

export type VerificationLevel = 'verified' | 'vip' | 'business' | 'professional' | null;

export const useVerifiedStatus = (user: User | null | undefined) => {
  const verificationLevel = useMemo((): VerificationLevel => {
    if (!user) return null;
    
    // Special case for VIP user
    if (user.email === 'pleromadoxa@gmail.com' || user.username === 'pleromadoxa') {
      return 'vip';
    }
    
    // Business verification (for business accounts)
    if (user.premium_tier === 'business') {
      return 'business';
    }
    
    // Professional verification (for professional accounts)
    if (user.premium_tier === 'professional') {
      return 'professional';
    }
    
    // Check if manually verified
    if (user.is_verified) {
      return 'verified';
    }
    
    // Check if has 100+ followers
    if (user.followers_count && user.followers_count >= 100) {
      return 'verified';
    }
    
    return null;
  }, [user?.username, user?.email, user?.is_verified, user?.followers_count, user?.premium_tier]);

  const isVerified = verificationLevel !== null;

  return { isVerified, verificationLevel };
};
