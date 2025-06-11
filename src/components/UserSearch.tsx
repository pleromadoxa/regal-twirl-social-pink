
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Star, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { findExistingConversation, createConversation } from "@/services/conversationService";
import { useToast } from "@/hooks/use-toast";

interface UserSearchResult {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  is_verified: boolean;
  type: 'user' | 'business';
  business_type?: string;
}

interface UserSearchProps {
  showMessageButton?: boolean;
}

const UserSearch = ({ showMessageButton = false }: UserSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search regular users
      const { data: userResults, error: userError } = await supabase
        .from('profiles')
        .select('id, username, display_name, avatar_url, is_verified')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(5);

      // Search business pages
      const { data: businessResults, error: businessError } = await supabase
        .from('business_pages')
        .select('id, page_name, avatar_url, is_verified, business_type')
        .or(`page_name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(5);

      if (userError || businessError) {
        console.error('Search error:', userError || businessError);
        return;
      }

      // Combine and format results
      const formattedResults: UserSearchResult[] = [
        ...(userResults || []).map(user => ({
          id: user.id,
          username: user.username || '',
          display_name: user.display_name || user.username || 'Unknown User',
          avatar_url: user.avatar_url || '',
          is_verified: user.is_verified || false,
          type: 'user' as const
        })),
        ...(businessResults || []).map(business => ({
          id: business.id,
          username: business.page_name,
          display_name: business.page_name,
          avatar_url: business.avatar_url || '',
          is_verified: business.is_verified || false,
          type: 'business' as const,
          business_type: business.business_type
        }))
      ];

      setSearchResults(formattedResults);
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

  const handleMessageUser = async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    try {
      // Check if conversation already exists
      let conversation = await findExistingConversation(user.id, targetUserId);
      
      if (!conversation) {
        // Create new conversation
        conversation = await createConversation(user.id, targetUserId);
      }
      
      // Navigate to messages with the conversation
      navigate('/messages');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const handleResultClick = (result: UserSearchResult) => {
    if (result.type === 'business') {
      navigate(`/professional/${result.id}`);
    } else {
      navigate(`/profile/${result.id}`);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users and businesses..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isSearching && (
            <div className="text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Search Results</p>
              {searchResults.map((result) => (
                <div 
                  key={`${result.type}-${result.id}`} 
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={result.avatar_url} />
                      <AvatarFallback className="bg-purple-500 text-white">
                        {result.type === 'business' ? (
                          <Building className="w-5 h-5" />
                        ) : (
                          result.display_name?.charAt(0) || '?'
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{result.display_name}</p>
                        {result.is_verified && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                        {result.type === 'business' && (
                          <Badge variant="secondary" className="text-xs">
                            Business
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.type === 'business' ? result.business_type : result.username}
                      </p>
                    </div>
                  </div>
                  {showMessageButton && result.type === 'user' && result.id !== user?.id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMessageUser(result.id);
                      }}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="text-center text-sm text-muted-foreground">
              No users or businesses found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserSearch;
