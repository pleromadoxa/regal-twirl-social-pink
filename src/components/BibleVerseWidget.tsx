
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, RefreshCw, Share2, Heart } from 'lucide-react';
import { fetchRandomVerse, searchVerses, type BibleVerse } from '@/services/bibleService';
import { useToast } from '@/hooks/use-toast';

interface BibleVerseWidgetProps {
  className?: string;
  showHeader?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in minutes
}

const BibleVerseWidget = ({ 
  className = "", 
  showHeader = true, 
  autoRefresh = false,
  refreshInterval = 60 
}: BibleVerseWidgetProps) => {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  const loadRandomVerse = async () => {
    setLoading(true);
    try {
      const randomVerse = await fetchRandomVerse();
      setVerse(randomVerse);
    } catch (error) {
      console.error('Error loading verse:', error);
      toast({
        title: "Error loading verse",
        description: "Failed to load Bible verse. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!verse) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Bible Verse - ${verse.reference}`,
          text: `"${verse.text}" - ${verse.reference} (${verse.translation})`,
        });
      } else {
        await navigator.clipboard.writeText(
          `"${verse.text}" - ${verse.reference} (${verse.translation})`
        );
        toast({
          title: "Copied to clipboard",
          description: "Bible verse copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error sharing",
        description: "Failed to share verse",
        variant: "destructive",
      });
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast({
        title: "Verse saved",
        description: "This verse has been added to your favorites",
      });
    }
  };

  useEffect(() => {
    loadRandomVerse();
  }, []);

  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(loadRandomVerse, refreshInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Daily Verse
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verse) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600" />
              Daily Verse
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Failed to load verse</p>
            <Button onClick={loadRandomVerse} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-purple-200 dark:border-purple-700`}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Daily Verse
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <blockquote className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 italic border-l-4 border-purple-300 pl-4">
            "{verse.text}"
          </blockquote>
          <div className="text-right">
            <cite className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {verse.reference} ({verse.translation})
            </cite>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`${liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-purple-600"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadRandomVerse}
            className="text-gray-500 hover:text-purple-600"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BibleVerseWidget;
