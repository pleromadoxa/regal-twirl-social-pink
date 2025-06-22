
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MessageEditFormProps {
  messageId: string;
  currentContent: string;
  currentUserId: string;
  onCancel: () => void;
  onSave: () => void;
}

const MessageEditForm = ({ 
  messageId, 
  currentContent, 
  currentUserId, 
  onCancel, 
  onSave 
}: MessageEditFormProps) => {
  const [editedContent, setEditedContent] = useState(currentContent);
  const { toast } = useToast();

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editedContent.trim(),
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', currentUserId);

      if (error) throw error;

      onSave();
      toast({
        title: "Message updated",
        description: "Your message has been edited"
      });
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <Input
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className="bg-transparent border-white/20 text-inherit"
        onKeyPress={handleKeyPress}
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSaveEdit} className="h-6 px-2">
          <Check className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel} className="h-6 px-2">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

export default MessageEditForm;
