
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessOverview from './BusinessOverview';
import BusinessAnalytics from './BusinessAnalytics';
import BusinessMessages from './BusinessMessages';
import BusinessEcommerce from './BusinessEcommerce';
import BusinessAccountManagement from './BusinessAccountManagement';

interface BusinessDashboardTabsProps {
  businessPage: any;
}

const BusinessDashboardTabs = ({ businessPage }: BusinessDashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
        <TabsTrigger value="messages">Messages</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <BusinessOverview businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="ecommerce">
        <BusinessEcommerce businessPage={businessPage} />
      </TabsContent>

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
