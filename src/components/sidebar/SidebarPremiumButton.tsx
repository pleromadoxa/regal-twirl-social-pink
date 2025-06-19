
import { Button } from "@/components/ui/button";
import PremiumDialog from "@/components/PremiumDialog";
import { Crown } from 'lucide-react';

interface SidebarPremiumButtonProps {
  hasValidSubscription: boolean;
  isAdmin: boolean;
}

const SidebarPremiumButton = ({ hasValidSubscription, isAdmin }: SidebarPremiumButtonProps) => {
  if (hasValidSubscription || isAdmin) return null;

  return (
    <div className="px-4 mb-4">
      <PremiumDialog
        trigger={
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        }
      />
    </div>
  );
};

export default SidebarPremiumButton;
