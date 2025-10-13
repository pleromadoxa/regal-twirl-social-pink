
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
    
    // Use Google News RSS feed for financial news
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
    
    const parser = new DOMParser();
    
    for (const query of queries) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
        console.log(`Fetching from: ${rssUrl}`);
        
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          },
        });
        
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status} for query: ${query}`);
          continue;
        }
        
        const xmlText = await response.text();
        console.log(`Received XML length: ${xmlText.length} for query: ${query}`);
        
        // Parse XML using DOMParser
        const doc = parser.parseFromString(xmlText, "text/xml");
        
        if (!doc) {
          console.error('Failed to parse XML for query:', query);
          continue;
        }
        
        const items = doc.querySelectorAll("item");
        console.log(`Found ${items.length} items for query: ${query}`);
        
        let itemCount = 0;
        
        for (const item of items) {
          if (itemCount >= 3) break;
          
          const titleEl = item.querySelector("title");
          const linkEl = item.querySelector("link");
          const pubDateEl = item.querySelector("pubDate");
          const descriptionEl = item.querySelector("description");
          
          if (titleEl && linkEl) {
            const title = titleEl.textContent?.trim() || '';
            const link = linkEl.textContent?.trim() || '';
            const description = descriptionEl?.textContent?.trim() || title;
            const pubDate = pubDateEl?.textContent?.trim() || new Date().toISOString();
            
            // Skip duplicate titles
            if (title && !allArticles.some(article => article.title === title)) {
              allArticles.push({
                title,
                link,
                pubDate,
                description: description.length > 200 ? description.substring(0, 200) + '...' : description,
                source: 'Google News',
                sentiment: determineSentiment(title + ' ' + description),
                category: determineCategory(query)
              });
              itemCount++;
              console.log(`Added article: ${title.substring(0, 50)}...`);
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
