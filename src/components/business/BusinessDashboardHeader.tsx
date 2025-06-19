
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessDashboardHeaderProps {
  businessPage: any;
}

const BusinessDashboardHeader = ({ businessPage }: BusinessDashboardHeaderProps) => {
  const navigate = useNavigate();

  return (
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
            {businessPage?.page_name} - Business Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your {businessPage?.business_type || 'business'} business
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboardHeader;
