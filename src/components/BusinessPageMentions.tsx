import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface BusinessPage {
  id: string;
  page_name: string;
  page_avatar_url?: string;
  page_type: string;
  is_verified: boolean;
  description?: string;
}

interface BusinessPageMentionsProps {
  onMention: (mention: string) => void;
  searchTerm: string;
}

export const BusinessPageMentions = ({ onMention, searchTerm }: BusinessPageMentionsProps) => {
  const [businessPages, setBusinessPages] = useState<BusinessPage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchTerm.length < 2) {
      setBusinessPages([]);
      return;
    }

    const searchBusinessPages = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('business_pages')
          .select('id, page_name, page_avatar_url, page_type, is_verified, description')
          .or(`page_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5);

        if (error) throw error;
        setBusinessPages(data || []);
      } catch (error) {
        console.error('Error searching business pages:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchBusinessPages, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const generateShareableUrl = (page: BusinessPage) => {
    const baseUrl = window.location.origin;
    const urlSlug = page.page_name.toLowerCase().replace(/\s+/g, '-');
    return `${baseUrl}/business/${urlSlug}/${page.id}`;
  };

  const handleShare = async (page: BusinessPage) => {
    const url = generateShareableUrl(page);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: page.page_name,
          text: page.description || `Check out ${page.page_name} on Regal Network`,
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Business page link copied to clipboard",
      });
    }
  };

  const handleCopyUrl = async (page: BusinessPage) => {
    const url = generateShareableUrl(page);
    await navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Business page link copied to clipboard",
    });
  };

  const handleMention = (page: BusinessPage) => {
    const mention = `#${page.page_name.replace(/\s+/g, '')}`;
    onMention(mention);
  };

  if (!searchTerm || businessPages.length === 0) return null;

  return (
    <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-700 shadow-lg">
      <CardContent className="p-2">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : (
          <div className="space-y-1">
            {businessPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              >
                <div 
                  className="flex items-center space-x-3 cursor-pointer flex-1"
                  onClick={() => handleMention(page)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={page.page_avatar_url} />
                    <AvatarFallback className="bg-purple-500 text-white">
                      {page.page_name[0]?.toUpperCase() || 'B'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {page.page_name}
                      </span>
                      {page.is_verified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      #{page.page_name.replace(/\s+/g, '')} • {page.page_type}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyUrl(page)}
                    className="p-2"
                    title="Copy link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(page)}
                    className="p-2"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessPageMentions;