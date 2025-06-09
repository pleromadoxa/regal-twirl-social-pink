
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
    // Use Google News RSS feed for financial news
    const rssUrl = 'https://news.google.com/rss/search?q=finance+stocks+market&hl=en-US&gl=US&ceid=US:en';
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // Parse RSS XML to extract news items
    const items = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/;
    const linkRegex = /<link>(.*?)<\/link>/;
    const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
    const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/;
    
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null && items.length < 10) {
      const itemContent = match[1];
      
      const titleMatch = titleRegex.exec(itemContent);
      const linkMatch = linkRegex.exec(itemContent);
      const pubDateMatch = pubDateRegex.exec(itemContent);
      const descriptionMatch = descriptionRegex.exec(itemContent);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1],
          link: linkMatch[1],
          pubDate: pubDateMatch ? pubDateMatch[1] : new Date().toISOString(),
          description: descriptionMatch ? descriptionMatch[1] : titleMatch[1],
          source: 'Google News',
          sentiment: 'neutral',
          category: 'finance'
        });
      }
    }

    return new Response(JSON.stringify({ articles: items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching financial news:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
