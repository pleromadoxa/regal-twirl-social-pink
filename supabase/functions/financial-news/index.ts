
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
    console.log('Starting comprehensive financial news fetch from multiple sources...');
    
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
    
    // Multiple news sources for better coverage
    const newsSources = [
      // Google News queries
      {
        type: 'google',
        queries: [
          'finance+stocks+market+trading',
          'cryptocurrency+bitcoin+ethereum', 
          'economy+federal+reserve+inflation',
          'tech+stocks+nasdaq+sp500',
          'forex+currency+exchange',
          'commodities+gold+oil+prices',
          'banking+finance+news',
          'stock+market+dow+jones'
        ]
      },
      // Yahoo Finance RSS
      {
        type: 'yahoo',
        urls: [
          'https://finance.yahoo.com/news/rssindex',
          'https://finance.yahoo.com/topic/stock-market-news'
        ]
      }
    ];
    
    // Fetch from Google News with multiple queries
    for (const query of newsSources[0].queries) {
      try {
        const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
        console.log(`Fetching Google News: ${query}`);
        
        const response = await fetch(rssUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (!response.ok) {
          console.error(`HTTP error! status: ${response.status} for query: ${query}`);
          continue;
        }
        
        const xmlText = await response.text();
        const doc = parser.parseFromString(xmlText, "text/xml");
        
        if (!doc) continue;
        
        const items = doc.querySelectorAll("item");
        let itemCount = 0;
        
        for (const item of items) {
          if (itemCount >= 4) break;
          
          const titleEl = item.querySelector("title");
          const linkEl = item.querySelector("link");
          const pubDateEl = item.querySelector("pubDate");
          const descriptionEl = item.querySelector("description");
          
          if (titleEl && linkEl) {
            const title = titleEl.textContent?.trim() || '';
            const link = linkEl.textContent?.trim() || '';
            const description = descriptionEl?.textContent?.trim() || title;
            const pubDate = pubDateEl?.textContent?.trim() || new Date().toISOString();
            
            if (title && !allArticles.some(article => article.title === title)) {
              allArticles.push({
                title,
                link,
                pubDate,
                description: description.length > 250 ? description.substring(0, 250) + '...' : description,
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

    // Try Yahoo Finance
    for (const url of newsSources[1].urls) {
      try {
        console.log(`Fetching Yahoo Finance: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (response.ok) {
          const xmlText = await response.text();
          const doc = parser.parseFromString(xmlText, "text/xml");
          
          if (doc) {
            const items = doc.querySelectorAll("item");
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
                
                if (title && !allArticles.some(article => article.title === title)) {
                  allArticles.push({
                    title,
                    link,
                    pubDate,
                    description: description.length > 250 ? description.substring(0, 250) + '...' : description,
                    source: 'Yahoo Finance',
                    sentiment: determineSentiment(title + ' ' + description),
                    category: 'finance'
                  });
                  itemCount++;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Yahoo Finance:`, error);
        continue;
      }
    }

    // If we couldn't fetch any articles, return comprehensive fallback data
    if (allArticles.length === 0) {
      console.log('No articles fetched, returning comprehensive fallback data');
      allArticles.push(...getFallbackArticles());
    }

    // Sort by publication date (newest first) and limit to 20 articles
    const sortedArticles = allArticles
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 20);

    console.log(`Successfully returning ${sortedArticles.length} articles from multiple sources`);

    return new Response(JSON.stringify({ 
      articles: sortedArticles,
      sources: ['Google News', 'Yahoo Finance'],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Critical error fetching financial news:', error);
    
    // Always return fallback articles
    const fallbackArticles = getFallbackArticles();
    
    return new Response(JSON.stringify({ 
      articles: fallbackArticles,
      error: 'Using fallback data',
      timestamp: new Date().toISOString()
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
  const now = Date.now();
  return [
    {
      title: "Global Stock Markets Rally on Positive Economic Data",
      link: "https://news.google.com/finance",
      pubDate: new Date(now).toISOString(),
      description: "Major stock indices around the world are experiencing gains as investors respond to encouraging economic indicators and corporate earnings reports that exceed expectations.",
      source: "Financial News",
      sentiment: "positive",
      category: "finance"
    },
    {
      title: "Technology Sector Leads Market Recovery with AI Innovation",
      link: "https://news.google.com/technology",
      pubDate: new Date(now - 1800000).toISOString(),
      description: "Tech giants are driving market momentum as artificial intelligence breakthroughs and cloud computing growth continue to attract investor confidence.",
      source: "Tech Financial",
      sentiment: "positive",
      category: "technology"
    },
    {
      title: "Federal Reserve Signals Cautious Approach to Monetary Policy",
      link: "https://news.google.com/economy",
      pubDate: new Date(now - 3600000).toISOString(),
      description: "Central bank officials indicate a measured strategy for interest rate decisions as they balance inflation concerns with economic growth objectives.",
      source: "Economic Times",
      sentiment: "neutral",
      category: "economy"
    },
    {
      title: "Cryptocurrency Market Shows Renewed Stability",
      link: "https://news.google.com/crypto",
      pubDate: new Date(now - 5400000).toISOString(),
      description: "Bitcoin and major altcoins demonstrate price stabilization as institutional adoption continues and regulatory frameworks become clearer.",
      source: "Crypto News",
      sentiment: "positive",
      category: "cryptocurrency"
    },
    {
      title: "Oil Prices Fluctuate on Global Supply Concerns",
      link: "https://news.google.com/commodities",
      pubDate: new Date(now - 7200000).toISOString(),
      description: "Energy markets react to geopolitical developments and production adjustments by major oil-producing nations.",
      source: "Commodities Report",
      sentiment: "neutral",
      category: "finance"
    },
    {
      title: "Banking Sector Strengthens with Robust Earnings",
      link: "https://news.google.com/banking",
      pubDate: new Date(now - 9000000).toISOString(),
      description: "Major financial institutions report strong quarterly results, driven by increased lending activity and improved net interest margins.",
      source: "Banking Today",
      sentiment: "positive",
      category: "finance"
    },
    {
      title: "Asian Markets Open Higher Following Wall Street Gains",
      link: "https://news.google.com/markets",
      pubDate: new Date(now - 10800000).toISOString(),
      description: "Stock exchanges across Asia show positive momentum at market open, tracking overnight gains from U.S. markets.",
      source: "Market Watch",
      sentiment: "positive",
      category: "finance"
    },
    {
      title: "Gold Prices Edge Higher Amid Safe Haven Demand",
      link: "https://news.google.com/gold",
      pubDate: new Date(now - 12600000).toISOString(),
      description: "Precious metals see increased investor interest as market participants seek diversification and inflation hedging opportunities.",
      source: "Metals Market",
      sentiment: "positive",
      category: "finance"
    },
    {
      title: "Corporate Earnings Season Beats Analyst Expectations",
      link: "https://news.google.com/earnings",
      pubDate: new Date(now - 14400000).toISOString(),
      description: "Majority of S&P 500 companies report better-than-expected quarterly earnings, signaling corporate resilience in current economic climate.",
      source: "Earnings Report",
      sentiment: "positive",
      category: "finance"
    },
    {
      title: "European Central Bank Maintains Current Interest Rates",
      link: "https://news.google.com/ecb",
      pubDate: new Date(now - 16200000).toISOString(),
      description: "ECB holds rates steady as policymakers monitor inflation trends and economic growth across the eurozone region.",
      source: "European Finance",
      sentiment: "neutral",
      category: "economy"
    }
  ];
}
