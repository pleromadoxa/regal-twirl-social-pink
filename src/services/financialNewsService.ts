
export interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

export interface FinancialNewsResponse {
  feed: NewsArticle[];
  items: string;
  sentiment_score_definition: string;
  relevance_score_definition: string;
}

// Using Alpha Vantage free tier - 25 requests per day
const API_KEY = 'demo'; // Users can replace with their own key
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchFinancialNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=NEWS_SENTIMENT&tickers=AAPL,MSFT,GOOGL,AMZN,TSLA&apikey=${API_KEY}&limit=50`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch financial news');
    }
    
    const data: FinancialNewsResponse = await response.json();
    
    // If demo key is being used, return mock data
    if (data.feed && data.feed.length === 0) {
      return getMockFinancialNews();
    }
    
    return data.feed || [];
  } catch (error) {
    console.error('Error fetching financial news:', error);
    // Return mock data as fallback
    return getMockFinancialNews();
  }
};

export const fetchStockData = async (symbol: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    return data['Global Quote'] || null;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return null;
  }
};

const getMockFinancialNews = (): NewsArticle[] => [
  {
    title: "Tech Stocks Rally as AI Investment Continues to Surge",
    url: "#",
    time_published: "20241206T143000",
    authors: ["Financial Reporter"],
    summary: "Major technology companies see significant gains as artificial intelligence investments drive market optimism.",
    banner_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
    source: "Financial Times",
    category_within_source: "Technology",
    source_domain: "ft.com",
    topics: [
      { topic: "Technology", relevance_score: "0.9" },
      { topic: "Artificial Intelligence", relevance_score: "0.8" }
    ],
    overall_sentiment_score: 0.7,
    overall_sentiment_label: "Bullish",
    ticker_sentiment: [
      {
        ticker: "AAPL",
        relevance_score: "0.8",
        ticker_sentiment_score: "0.6",
        ticker_sentiment_label: "Bullish"
      }
    ]
  },
  {
    title: "Federal Reserve Signals Potential Rate Adjustment in Q1 2024",
    url: "#",
    time_published: "20241206T120000",
    authors: ["Economic Analyst"],
    summary: "The Federal Reserve hints at possible interest rate modifications as inflation data shows mixed signals.",
    banner_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=200&fit=crop",
    source: "Reuters",
    category_within_source: "Economy",
    source_domain: "reuters.com",
    topics: [
      { topic: "Federal Reserve", relevance_score: "0.9" },
      { topic: "Interest Rates", relevance_score: "0.8" }
    ],
    overall_sentiment_score: 0.1,
    overall_sentiment_label: "Neutral",
    ticker_sentiment: []
  },
  {
    title: "Renewable Energy Stocks Soar on Climate Policy Announcements",
    url: "#",
    time_published: "20241206T100000",
    authors: ["Energy Reporter"],
    summary: "Clean energy companies experience significant growth following new government sustainability initiatives.",
    banner_image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=200&fit=crop",
    source: "Bloomberg",
    category_within_source: "Energy",
    source_domain: "bloomberg.com",
    topics: [
      { topic: "Renewable Energy", relevance_score: "0.9" },
      { topic: "Climate Policy", relevance_score: "0.7" }
    ],
    overall_sentiment_score: 0.8,
    overall_sentiment_label: "Bullish",
    ticker_sentiment: []
  }
];
