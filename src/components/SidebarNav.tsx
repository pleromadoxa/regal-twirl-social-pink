
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useSidebarProfile } from '@/hooks/useSidebarProfile';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import SidebarHeader from '@/components/sidebar/SidebarHeader';
import SidebarNavigation from '@/components/sidebar/SidebarNavigation';
import SidebarPremiumButton from '@/components/sidebar/SidebarPremiumButton';
import SidebarProfile from '@/components/sidebar/SidebarProfile';
import SidebarFooter from '@/components/sidebar/SidebarFooter';

const SidebarNav = () => {
  const { myPages } = useBusinessPages();
  const { profile, isAdmin, setProfile } = useSidebarProfile();
  const { subscriptionData } = useSubscriptionStatus(isAdmin, setProfile);

  // Check if user has valid subscription or is admin
  const hasValidSubscription = (subscriptionData?.subscribed && subscriptionData?.subscription_end && new Date(subscriptionData.subscription_end) > new Date()) || isAdmin;
  const isPremiumUser = profile?.premium_tier !== 'free';
  const isBusinessUser = profile?.premium_tier === 'business';
  const hasBusinessPages = myPages && myPages.length > 0;

  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/20 dark:from-slate-900 dark:via-purple-950/20 dark:to-pink-950/10 border-r border-gradient-to-b from-purple-200 via-purple-300 to-pink-200 dark:from-purple-800 dark:via-purple-700 dark:to-pink-800 py-4 px-3 flex flex-col z-50 shadow-lg shadow-purple-100/50 dark:shadow-purple-900/20">
      <SidebarHeader />
      
      <SidebarNavigation 
        hasValidSubscription={hasValidSubscription}
        isPremiumUser={isPremiumUser}
        isBusinessUser={isBusinessUser}
        hasBusinessPages={hasBusinessPages}
        subscriptionData={subscriptionData}
        isAdmin={isAdmin}
      />

      <SidebarPremiumButton 
        hasValidSubscription={hasValidSubscription}
        isAdmin={isAdmin}
      />

      <SidebarProfile 
        profile={profile}
        isPremiumUser={isPremiumUser}
        isAdmin={isAdmin}
      />

      <SidebarFooter />
    </div>
  );
};

export default SidebarNav;
