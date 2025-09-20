
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import GalleryUpload from "@/components/GalleryUpload";

const Gallery = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 flex gap-8 ${isMobile ? 'px-4 pb-20' : 'pl-80 pr-[400px]'} max-w-full overflow-hidden`}>
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          <div className="p-4 lg:p-6">
            <h1 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-900 dark:text-gray-100">Gallery</h1>
            <GalleryUpload />
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Gallery;
