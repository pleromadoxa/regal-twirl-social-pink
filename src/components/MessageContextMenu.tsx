
import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Forward, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import MessageForwardDialog from './MessageForwardDialog';

interface MessageContextMenuProps {
  messageId: string;
  content: string;
  isOwnMessage: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const MessageContextMenu = ({
  messageId,
  content,
  isOwnMessage,
  onEdit,
  onDelete
}: MessageContextMenuProps) => {
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied",
        description: "Message copied to clipboard"
      });
    } catch (error) {
      console.error('Error copying message:', error);
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowForwardDialog(true)}>
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </DropdownMenuItem>
          {isOwnMessage && (
            <>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <MessageForwardDialog
        messageContent={content}
        isOpen={showForwardDialog}
        onClose={() => setShowForwardDialog(false)}
      />
    </>
  );
};

export default MessageContextMenu;
