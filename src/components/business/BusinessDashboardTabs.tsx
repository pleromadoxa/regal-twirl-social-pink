
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessOverview from './BusinessOverview';
import BusinessAnalytics from './BusinessAnalytics';
import BusinessMessages from './BusinessMessages';
import BusinessEcommerce from './BusinessEcommerce';
import BusinessAccountManagement from './BusinessAccountManagement';
import BusinessProfileUpdate from './BusinessProfileUpdate';

interface BusinessDashboardTabsProps {
  businessPage: any;
  onPageUpdate?: () => void;
}

const BusinessDashboardTabs = ({ businessPage, onPageUpdate }: BusinessDashboardTabsProps) => {
  const showEcommerce = businessPage?.page_type === 'business';

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className={`grid w-full ${showEcommerce ? 'grid-cols-6' : 'grid-cols-5'}`}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        {showEcommerce && <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>}
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <BusinessOverview businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="profile">
        <BusinessProfileUpdate businessPage={businessPage} onUpdate={onPageUpdate || (() => {})} />
      </TabsContent>

      {showEcommerce && (
        <TabsContent value="ecommerce">
          <BusinessEcommerce businessPage={businessPage} />
        </TabsContent>
      )}

      <TabsContent value="messages">
        <BusinessMessages businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="analytics">
        <BusinessAnalytics businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="settings">
        <BusinessAccountManagement businessPage={businessPage} />
      </TabsContent>
    </Tabs>
  );
};

export default BusinessDashboardTabs;
