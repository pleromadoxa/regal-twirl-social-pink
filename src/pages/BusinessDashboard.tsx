
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  MessageSquare, 
  DollarSign,
  Package,
  Users,
  TrendingUp,
  ArrowLeft,
  Megaphone
} from 'lucide-react';
import BusinessInvoices from '@/components/business/BusinessInvoices';
import BusinessProducts from '@/components/business/BusinessProducts';
import BusinessOrders from '@/components/business/BusinessOrders';
import BusinessMessages from '@/components/business/BusinessMessages';
import BusinessEarnings from '@/components/business/BusinessEarnings';
import BusinessOverview from '@/components/business/BusinessOverview';
import BusinessAdsManager from '@/components/business/BusinessAdsManager';
import EcommerceDashboard from '@/components/business/EcommerceDashboard';
import ITServicesDashboard from '@/components/business/ITServicesDashboard';
import ImportExportDashboard from '@/components/business/ImportExportDashboard';

const BusinessDashboard = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const { myPages, loading } = useBusinessPages();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<any>(null);

  useEffect(() => {
    console.log('BusinessDashboard useEffect:', { 
      user: !!user, 
      pageId, 
      myPagesLength: myPages.length, 
      loading,
      myPages: myPages.map(p => ({ id: p.id, name: p.page_name }))
    });
    
    if (!user) {
      console.log('No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    if (pageId && !loading && myPages.length > 0) {
      console.log('Looking for page with ID:', pageId);
      console.log('Available pages:', myPages.map(p => ({ id: p.id, name: p.page_name })));
      
      const page = myPages.find(p => p.id === pageId);
      if (page) {
        console.log('Page found:', page.page_name);
        setCurrentPage(page);
      } else {
        console.log('Page not found in available pages, redirecting to professional');
        navigate('/professional');
      }
    } else if (pageId && !loading && myPages.length === 0) {
      console.log('No pages available, redirecting to professional');
      navigate('/professional');
    }
  }, [user, pageId, myPages, navigate, loading]);

  if (loading) {
    console.log('Still loading business pages...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!currentPage) {
    console.log('No current page found, showing error state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Business Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested business page could not be found.
            </p>
            <Button onClick={() => navigate('/professional')}>
              Back to Professional Accounts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/professional')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentPage.page_name} - Business Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Manage your {currentPage.business_type} business
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white/50 dark:bg-slate-800/50">
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
              {currentPage.business_type === 'ecommerce' && (
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
              {currentPage.business_type === 'ecommerce' ? (
                <EcommerceDashboard businessPage={currentPage} />
              ) : currentPage.business_type === 'it_services' ? (
                <ITServicesDashboard businessPage={currentPage} />
              ) : currentPage.business_type === 'import_export' ? (
                <ImportExportDashboard businessPage={currentPage} />
              ) : (
                <BusinessOverview businessPage={currentPage} />
              )}
            </TabsContent>

            <TabsContent value="earnings">
              <BusinessEarnings businessPage={currentPage} />
            </TabsContent>

            <TabsContent value="invoices">
              <BusinessInvoices businessPage={currentPage} />
            </TabsContent>

            {currentPage.business_type === 'ecommerce' && (
              <>
                <TabsContent value="products">
                  <BusinessProducts businessPage={currentPage} />
                </TabsContent>

                <TabsContent value="orders">
                  <BusinessOrders businessPage={currentPage} />
                </TabsContent>
              </>
            )}

            <TabsContent value="ads">
              <BusinessAdsManager businessPage={currentPage} />
            </TabsContent>

            <TabsContent value="messages">
              <BusinessMessages businessPage={currentPage} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
