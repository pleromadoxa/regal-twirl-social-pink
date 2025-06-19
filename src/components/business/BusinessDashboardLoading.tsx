
import SidebarNav from '@/components/SidebarNav';

const BusinessDashboardLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading business dashboard...</p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardLoading;
