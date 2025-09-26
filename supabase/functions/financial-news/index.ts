
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting financial news fetch...');
    
    // Use Google News RSS feed for financial news with better parameters
    const queries = [
      'finance+stocks+market+trading',
      'cryptocurrency+bitcoin+ethereum',
      'economy+federal+reserve+inflation',
      'tech+stocks+nasdaq+sp500'
    ];
    
    const allArticles: Array<{
      title: string;
      link: string;
      pubDate: string;
      description: string;
      source: string;
      sentiment: string;
      category: string;
    }> = [];
    
    for (const query of queries) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
        console.log(`Fetching from: ${rssUrl}`);
        
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
          },
        });
        
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status} for query: ${query}`);
          continue;
        }
        
        const xmlText = await response.text();
        console.log(`Received XML length: ${xmlText.length} for query: ${query}`);
        
        // Parse RSS XML to extract news items
        const itemRegex = /<item[^>]*>(.*?)<\/item>/gs;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/s;
        const linkRegex = /<link[^>]*>(.*?)<\/link>/s;
        const pubDateRegex = /<pubDate[^>]*>(.*?)<\/pubDate>/s;
        const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/s;
        
        let match;
        let itemCount = 0;
        
        while ((match = itemRegex.exec(xmlText)) !== null && itemCount < 3) {
          const itemContent = match[1];
          
          const titleMatch = titleRegex.exec(itemContent);
          const linkMatch = linkRegex.exec(itemContent);
          const pubDateMatch = pubDateRegex.exec(itemContent);
          const descriptionMatch = descriptionRegex.exec(itemContent);
          
          if (titleMatch && linkMatch) {
            const title = titleMatch[1].trim();
            const link = linkMatch[1].trim();
            const description = descriptionMatch ? descriptionMatch[1].trim() : title;
            
            // Skip duplicate titles
            if (!allArticles.some(article => article.title === title)) {
              allArticles.push({
                title,
                link,
                pubDate: pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString(),
                description: description.length > 200 ? description.substring(0, 200) + '...' : description,
                source: 'Google News',
                sentiment: determineSentiment(title + ' ' + description),
                category: determineCategory(query)
              });
              itemCount++;
            }
          }
        }
      } catch (queryError) {
        console.error(`Error processing query ${query}:`, queryError);
        continue;
      }
    }

    // If we couldn't fetch any articles, return fallback data
    if (allArticles.length === 0) {
      console.log('No articles fetched, returning fallback data');
      allArticles.push(...getFallbackArticles());
    }

    // Sort by publication date (newest first) and limit to 12 articles
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 12);

    console.log(`Returning ${sortedArticles.length} articles`);

    return new Response(JSON.stringify({ articles: sortedArticles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching financial news:', error);
    
    // Return fallback articles in case of error
    const fallbackArticles = getFallbackArticles();
    
    return new Response(JSON.stringify({ 
      articles: fallbackArticles,
      error: 'Fallback data due to fetch error'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function determineSentiment(text: string): string {
  const positiveWords = ['gain', 'rise', 'up', 'surge', 'bullish', 'rally', 'growth', 'increase', 'boom', 'strong'];
  const negativeWords = ['fall', 'drop', 'down', 'crash', 'bearish', 'decline', 'loss', 'decrease', 'weak', 'plunge'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function determineCategory(query: string): string {
  if (query.includes('crypto')) return 'cryptocurrency';
  if (query.includes('tech')) return 'technology';
  if (query.includes('economy')) return 'economy';
  return 'finance';
}

function getFallbackArticles() {
  return [
    {
      title: "Financial Markets Show Mixed Signals Amid Economic Uncertainty",
      link: "https://news.google.com",
      pubDate: new Date().toISOString(),
      description: "Global financial markets are experiencing volatility as investors assess economic indicators and policy changes affecting market sentiment.",
      source: "Google News",
      sentiment: "neutral",
      category: "finance"
    },
    {
      title: "Technology Stocks Lead Market Recovery",
      link: "https://news.google.com",
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      description: "Major technology companies are driving market gains as investors show renewed confidence in the sector's growth potential.",
      source: "Google News",
      sentiment: "positive",
      category: "technology"
    },
    {
      title: "Federal Reserve Considers Policy Adjustments",
      link: "https://news.google.com",
      pubDate: new Date(Date.now() - 7200000).toISOString(),
      description: "Central bank officials are evaluating monetary policy options in response to changing economic conditions and inflation data.",
      source: "Google News",
      sentiment: "neutral",
      category: "economy"
    }
  ];
}
