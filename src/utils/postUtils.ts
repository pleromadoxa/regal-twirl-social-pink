
import { Post } from '@/hooks/usePosts';

export const getVerificationLevel = (user: any): 'vip' | 'business' | 'professional' | 'verified' | null => {
  if (!user || typeof user !== 'object') return null;
  
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
};

export const getVerifiedStatus = (user: any): boolean => {
  if (!user || typeof user !== 'object') return false;
  
  if (user.username === 'pleromadoxa') {
    return true;
  }
  
  if (user.is_verified) {
    return true;
  }
  
  if (user.followers_count && user.followers_count >= 100) {
    return true;
  }
  
  return false;
};

export const isThreadPost = (content: string): boolean => {
  return content.includes('\n\n') || content.toLowerCase().includes('thread') || content.includes('🧵');
};

export const hasAudioContent = (content: string): boolean => {
  return content.toLowerCase().includes('🎵') || 
         content.toLowerCase().includes('🎧') || 
         content.toLowerCase().includes('audio') ||
         content.toLowerCase().includes('music') ||
         content.toLowerCase().includes('🎶');
};
