
import { Button } from '@/components/ui/button';
import SidebarNav from '@/components/SidebarNav';
import { useNavigate } from 'react-router-dom';

interface BusinessDashboardErrorProps {
  pageId?: string;
  availablePages: number;
  onRetry: () => void;
}

const BusinessDashboardError = ({ pageId, availablePages, onRetry }: BusinessDashboardErrorProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      <div className="flex-1 ml-80 mr-96 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Business Page Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested business page could not be found or hasn't loaded yet.
          </p>
          <div className="space-x-4">
            <Button onClick={onRetry}>
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/professional')}>
              Back to Professional Accounts
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Page ID: {pageId}</p>
            <p>Available Pages: {availablePages}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardError;
