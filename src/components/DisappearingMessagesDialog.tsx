import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DisappearingMessagesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string;
  currentUserId: string;
  currentDuration?: number;
}

const DURATION_OPTIONS = [
  { label: 'Off', value: 0, description: 'Messages will not disappear' },
  { label: '24 hours', value: 86400, description: 'Messages disappear after 1 day' },
  { label: '7 days', value: 604800, description: 'Messages disappear after 1 week' },
  { label: '30 days', value: 2592000, description: 'Messages disappear after 1 month' }
];

const DisappearingMessagesDialog = ({ 
  isOpen, 
  onClose, 
  conversationId, 
  currentUserId,
  currentDuration = 0 
}: DisappearingMessagesDialogProps) => {
  const [selectedDuration, setSelectedDuration] = useState(currentDuration.toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSelectedDuration(currentDuration.toString());
  }, [currentDuration]);

  const handleUpdateDuration = async () => {
    setIsUpdating(true);
    try {
      const duration = parseInt(selectedDuration);
      
      const { error } = await supabase
        .from('conversations')
        .update({
          disappearing_messages_duration: duration,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;

      // If enabling disappearing messages, set expiry for future messages
      if (duration > 0) {
        toast({
          title: "Disappearing messages enabled",
          description: `New messages will disappear after ${DURATION_OPTIONS.find(opt => opt.value === duration)?.label.toLowerCase()}`
        });
      } else {
        toast({
          title: "Disappearing messages disabled",
          description: "Messages will no longer disappear automatically"
        });
      }

      onClose();
    } catch (error) {
      console.error('Error updating disappearing messages:', error);
      toast({
        title: "Error",
        description: "Failed to update disappearing messages setting",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Disappearing Messages
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Info */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Privacy Protection
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-200">
                When enabled, new messages will automatically disappear after the selected time.
                This setting applies to all participants in the conversation.
              </p>
            </div>
          </div>

          {/* Duration Options */}
          <RadioGroup 
            value={selectedDuration} 
            onValueChange={setSelectedDuration}
            className="space-y-3"
          >
            {DURATION_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <RadioGroupItem 
                  value={option.value.toString()} 
                  id={option.value.toString()}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <Label 
                    htmlFor={option.value.toString()}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDuration}
              disabled={isUpdating || selectedDuration === currentDuration.toString()}
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisappearingMessagesDialog;