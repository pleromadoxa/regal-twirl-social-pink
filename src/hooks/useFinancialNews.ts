
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NewsArticle {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
  sentiment: string;
  category: string;
}

export const useFinancialNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchNews = useCallback(async (showToast = false) => {
    // Prevent too frequent requests (minimum 30 seconds between requests)
    if (lastFetch && Date.now() - lastFetch.getTime() < 30000) {
      if (showToast) {
        toast({
          title: "Please wait",
          description: "News was recently updated. Please wait 30 seconds before refreshing again.",
          variant: "default"
        });
      }
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching financial news...');
      const { data, error } = await supabase.functions.invoke('financial-news');

      if (error) {
        console.error('Error fetching financial news:', error);
        
        // If no existing news, show error toast
        if (news.length === 0 && showToast) {
          toast({
            title: "Unable to fetch news",
            description: "We're experiencing issues fetching the latest financial news. Please try again later.",
            variant: "destructive"
          });
        }
        return;
      }

      console.log('Financial news data received:', data);
      
      if (data?.articles && Array.isArray(data.articles)) {
        setNews(data.articles);
        setLastFetch(new Date());
        
        if (showToast && data.articles.length > 0) {
          toast({
            title: "News Updated",
            description: `Loaded ${data.articles.length} latest financial news articles.`,
            variant: "default"
          });
        }
      } else {
        console.warn('No articles found in response:', data);
        
        // Only clear news if this is the first fetch
        if (news.length === 0) {
          setNews([]);
        }
      }
    } catch (error) {
      console.error('Error in fetchNews:', error);
      
      if (news.length === 0 && showToast) {
        toast({
          title: "Network Error",
          description: "Unable to connect to news service. Please check your internet connection.",
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  }, [lastFetch, news.length, toast]);

  // Initial fetch
  useEffect(() => {
    fetchNews(false);
    
    // Set up auto-refresh every 15 minutes
    const interval = setInterval(() => {
      fetchNews(false);
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNews]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchNews(true);
  }, [fetchNews]);

  return {
    news,
    loading,
    refetch,
    lastUpdated: lastFetch
  };
};
