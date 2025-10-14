
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import RegalAIEngine from '@/components/RegalAIEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';

const RegalAIEnginePage = () => {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className="flex-1 max-w-2xl border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto">
          <div className="p-6">
            <RegalAIEngine />
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default RegalAIEnginePage;
