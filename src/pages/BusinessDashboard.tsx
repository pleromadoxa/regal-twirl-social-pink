import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import BusinessDashboardHeader from '@/components/business/BusinessDashboardHeader';
import BusinessDashboardTabs from '@/components/business/BusinessDashboardTabs';
import BusinessDashboardLoading from '@/components/business/BusinessDashboardLoading';
import BusinessDashboardError from '@/components/business/BusinessDashboardError';

const BusinessDashboard = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const { myPages, loading, refetch } = useBusinessPages();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

    if (pageId && !loading) {
      if (myPages.length === 0) {
        console.log('No pages loaded, attempting to refetch...');
        refetch();
        return;
      }
      
      console.log('Looking for page with ID:', pageId);
      console.log('Available pages:', myPages.map(p => ({ id: p.id, name: p.page_name })));
      
      const page = myPages.find(p => p.id === pageId);
      if (page) {
        console.log('Page found:', page.page_name);
        setCurrentPage(page);
      } else {
        console.log('Page not found in available pages. Available IDs:', myPages.map(p => p.id));
        console.log('Looking for ID:', pageId);
        // Don't redirect immediately, give it another chance to load
        setTimeout(() => {
          if (myPages.length === 0) {
            console.log('Still no pages after timeout, redirecting to professional');
            navigate('/professional');
          }
        }, 2000);
      }
    }
  }, [user, pageId, myPages, navigate, loading, refetch]);

  const handlePageUpdate = () => {
    refetch();
  };

  if (loading) {
    console.log('Still loading business pages...');
    return <BusinessDashboardLoading />;
  }

  if (!currentPage && !loading) {
    console.log('No current page found, showing retry option');
    return (
      <BusinessDashboardError 
        pageId={pageId}
        availablePages={myPages.length}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-6xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          <BusinessDashboardHeader businessPage={currentPage} />
          
          <div className={isMobile ? 'p-3' : 'p-6'}>
            <BusinessDashboardTabs businessPage={currentPage} onPageUpdate={handlePageUpdate} />
          </div>
        </main>
      </div>

      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default BusinessDashboard;
