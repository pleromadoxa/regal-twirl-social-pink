
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft
} from 'lucide-react';
import BusinessInvoices from '@/components/business/BusinessInvoices';
import BusinessProducts from '@/components/business/BusinessProducts';
import BusinessOrders from '@/components/business/BusinessOrders';
import BusinessMessages from '@/components/business/BusinessMessages';
import BusinessEarnings from '@/components/business/BusinessEarnings';
import BusinessOverview from '@/components/business/BusinessOverview';

const BusinessDashboard = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (pageId && myPages.length > 0) {
      const page = myPages.find(p => p.id === pageId);
      if (page) {
        setCurrentPage(page);
      } else {
        navigate('/professional');
      }
    }
  }, [user, pageId, myPages, navigate]);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const getBusinessTools = () => {
    const tools = ['overview', 'earnings', 'invoices', 'messages'];
    
    if (currentPage.business_type === 'e-commerce') {
      tools.push('products', 'orders');
    }
    
    return tools;
  };

  const tools = getBusinessTools();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
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
              {currentPage.business_type === 'e-commerce' && (
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
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <BusinessOverview businessPage={currentPage} />
            </TabsContent>

            <TabsContent value="earnings">
              <BusinessEarnings businessPage={currentPage} />
            </TabsContent>

            <TabsContent value="invoices">
              <BusinessInvoices businessPage={currentPage} />
            </TabsContent>

            {currentPage.business_type === 'e-commerce' && (
              <>
                <TabsContent value="products">
                  <BusinessProducts businessPage={currentPage} />
                </TabsContent>

                <TabsContent value="orders">
                  <BusinessOrders businessPage={currentPage} />
                </TabsContent>
              </>
            )}

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
