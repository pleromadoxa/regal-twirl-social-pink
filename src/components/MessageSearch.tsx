
import { useState, useEffect } from 'react';
import { Search, MessageCircle, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedMessages } from '@/hooks/useEnhancedMessages';
import { useToast } from '@/hooks/use-toast';

interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

interface MessageSearchProps {
  onStartConversation: (userId: string) => void;
  messagesData: ReturnType<typeof useEnhancedMessages>;
}

export const MessageSearch = ({ onStartConversation, messagesData }: MessageSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // messagesData is required - no fallback to prevent multiple subscriptions
  if (!messagesData) {
    console.error('MessageSearch: messagesData prop is required');
    return null;
  }
  
  const { startDirectConversation } = messagesData;

  // Additional safety check
  if (!startDirectConversation) {
    console.error('startDirectConversation is not available');
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('id', user?.id)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm) {
        searchUsers(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleStartConversation = async (userId: string) => {
    if (!startDirectConversation) {
      toast({
        title: "Error",
        description: "Conversation service not available",
        variant: "destructive"
      });
      return;
    }

    try {
      await startDirectConversation(userId);
      onStartConversation(userId);
      setIsDialogOpen(false);
      setSearchTerm('');
      setSearchResults([]);
      
      toast({
        title: "Conversation started",
        description: "You can now start messaging"
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isSearching && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Searching...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => handleStartConversation(result.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={result.avatar_url} />
                      <AvatarFallback className="bg-purple-500 text-white">
                        {result.display_name?.charAt(0) || result.username?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{result.display_name || result.username}</p>
                      <p className="text-xs text-muted-foreground">@{result.username}</p>
                    </div>
                  </div>
                  <MessageCircle className="w-4 h-4 text-purple-500" />
                </div>
              ))}
            </div>
          )}
          
          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              No users found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageSearch;
