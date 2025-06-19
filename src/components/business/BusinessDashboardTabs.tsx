
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  MessageSquare, 
  DollarSign,
  Package,
  Megaphone
} from 'lucide-react';
import BusinessInvoices from '@/components/business/BusinessInvoices';
import BusinessProducts from '@/components/business/BusinessProducts';
import BusinessOrders from '@/components/business/BusinessOrders';
import BusinessMessages from '@/components/business/BusinessMessages';
import BusinessEarnings from '@/components/business/BusinessEarnings';
import BusinessOverview from '@/components/business/BusinessOverview';
import BusinessAdsManager from '@/components/business/BusinessAdsManager';
import BusinessBoostManager from '@/components/business/BusinessBoostManager';
import EcommerceDashboard from '@/components/business/EcommerceDashboard';
import ITServicesDashboard from '@/components/business/ITServicesDashboard';
import ImportExportDashboard from '@/components/business/ImportExportDashboard';

interface BusinessDashboardTabsProps {
  businessPage: any;
}

const BusinessDashboardTabs = ({ businessPage }: BusinessDashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-7 bg-white/50 dark:bg-slate-800/50">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="earnings" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Earnings
        </TabsTrigger>
        <TabsTrigger value="invoices" className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Invoices
        </TabsTrigger>
        {businessPage?.business_type === 'ecommerce' && (
          <>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </>
        )}
        <TabsTrigger value="boost" className="flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Boost
        </TabsTrigger>
        <TabsTrigger value="ads" className="flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Ads
        </TabsTrigger>
        <TabsTrigger value="messages" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Messages
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {businessPage?.business_type === 'ecommerce' ? (
          <EcommerceDashboard businessPage={businessPage} />
        ) : businessPage?.business_type === 'it_services' ? (
          <ITServicesDashboard businessPage={businessPage} />
        ) : businessPage?.business_type === 'import_export' ? (
          <ImportExportDashboard businessPage={businessPage} />
        ) : (
          <BusinessOverview businessPage={businessPage} />
        )}
      </TabsContent>

      <TabsContent value="earnings">
        <BusinessEarnings businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="invoices">
        <BusinessInvoices businessPage={businessPage} />
      </TabsContent>

      {businessPage?.business_type === 'ecommerce' && (
        <>
          <TabsContent value="products">
            <BusinessProducts businessPage={businessPage} />
          </TabsContent>

          <TabsContent value="orders">
            <BusinessOrders businessPage={businessPage} />
          </TabsContent>
        </>
      )}

      <TabsContent value="boost">
        <BusinessBoostManager businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="ads">
        <BusinessAdsManager businessPage={businessPage} />
      </TabsContent>

      <TabsContent value="messages">
        <BusinessMessages businessPage={businessPage} />
      </TabsContent>
    </Tabs>
  );
};

export default BusinessDashboardTabs;
