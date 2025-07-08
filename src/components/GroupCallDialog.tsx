
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GroupCallDialogProps {
  participants: Array<{
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  }>;
}

const GroupCallDialog = ({ participants }: GroupCallDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const startGroupCall = async () => {
    toast({
      title: "Feature unavailable",
      description: "Group calling feature is currently disabled",
      variant: "destructive"
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="rounded-full">
          <Users className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Call Unavailable
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Group calling feature is currently disabled.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCallDialog;
