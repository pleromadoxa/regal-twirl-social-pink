
import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share, Search, MoreHorizontal, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TweetComposer from "@/components/TweetComposer";
import SidebarNav from "@/components/SidebarNav";
import TrendingWidget from "@/components/TrendingWidget";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [tweets, setTweets] = useState([
    {
      id: 1,
      author: "Sarah Chen",
      handle: "@sarahchen",
      avatar: "/placeholder.svg",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      content: "Just launched my new project! Excited to share it with the world 🚀✨ #WebDev #Launch",
      likes: 24,
      retweets: 8,
      replies: 12,
      isLiked: false,
      isRetweeted: false,
      isVerified: true,
      thread: ["This has been months in the making...", "Can't wait to see what you all think!"]
    },
    {
      id: 2,
      author: "Alex Rivera",
      handle: "@alexr",
      avatar: "/placeholder.svg",
      time: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      content: "Beautiful sunset today! Sometimes you need to stop and appreciate the little things in life 🌅💜 #Nature #Mindfulness",
      likes: 156,
      retweets: 23,
      replies: 45,
      isLiked: true,
      isRetweeted: false,
      isVerified: false,
      thread: []
    },
    {
      id: 3,
      author: "Maya Patel",
      handle: "@mayatech",
      avatar: "/placeholder.svg",
      time: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      content: "Working on some exciting new features. Can't wait to show you all what we've been building! The future is bright 💎 #TechNews #Innovation",
      likes: 89,
      retweets: 34,
      replies: 28,
      isLiked: false,
      isRetweeted: true,
      isVerified: true,
      thread: ["Hint: It involves AI...", "And it's going to change everything 🤖"]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d`;
    }
  };

  const handleLike = (tweetId: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === tweetId) {
        const newIsLiked = !tweet.isLiked;
        return {
          ...tweet,
          isLiked: newIsLiked,
          likes: newIsLiked ? tweet.likes + 1 : tweet.likes - 1
        };
      }
      return tweet;
    }));

    toast({
      description: tweets.find(t => t.id === tweetId)?.isLiked ? "Removed from likes" : "Added to likes",
      duration: 2000,
    });
  };

  const handleRetweet = (tweetId: number) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === tweetId) {
        const newIsRetweeted = !tweet.isRetweeted;
        return {
          ...tweet,
          isRetweeted: newIsRetweeted,
          retweets: newIsRetweeted ? tweet.retweets + 1 : tweet.retweets - 1
        };
      }
      return tweet;
    }));

    toast({
      description: tweets.find(t => t.id === tweetId)?.isRetweeted ? "Repost removed" : "Reposted!",
      duration: 2000,
    });
  };

  const handleShare = (tweet: any) => {
    navigator.clipboard.writeText(`"${tweet.content}" - ${tweet.author} (${tweet.handle})`);
    toast({
      description: "Post copied to clipboard!",
      duration: 2000,
    });
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(hashtag);
    toast({
      description: `Searching for ${hashtag}`,
      duration: 2000,
    });
  };

  const renderTweetContent = (content: string) => {
    return content.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span
            key={index}
            className="text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer font-medium transition-all duration-300 hover:scale-110 inline-block"
            onClick={() => handleHashtagClick(word)}
          >
            {word}{' '}
          </span>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-purple-950 dark:via-blue-950 dark:to-pink-950 transition-all duration-700">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-purple-200 dark:border-purple-700 bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-700 p-5 z-10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
              Home
            </h1>
          </div>

          {/* Post Composer */}
          <div className="border-b border-purple-200 dark:border-purple-700 bg-white/40 dark:bg-slate-900/40">
            <TweetComposer />
          </div>

          {/* Timeline */}
          <div className="divide-y divide-purple-200 dark:divide-purple-700">
            {tweets.map((tweet) => (
              <Card key={tweet.id} className="rounded-none border-0 shadow-none hover:bg-gradient-to-r hover:from-purple-50/80 hover:to-pink-50/60 dark:hover:from-purple-900/60 dark:hover:to-pink-900/40 transition-all duration-500 cursor-pointer group bg-white/40 dark:bg-slate-900/40 hover:scale-[1.02] hover:shadow-xl">
                <div className="p-6">
                  <div className="flex space-x-4">
                    <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-500 group-hover:ring-pink-400 dark:group-hover:ring-pink-400 group-hover:scale-110 shadow-lg group-hover:shadow-2xl">
                      <AvatarImage src={tweet.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold">
                        {tweet.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">{tweet.author}</h3>
                        {tweet.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500 fill-current animate-pulse" />
                        )}
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{tweet.handle}</span>
                        <span className="text-slate-400 dark:text-slate-500">·</span>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{formatTimeAgo(tweet.time)}</span>
                        <Button variant="ghost" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-500 p-1 hover:bg-purple-100 dark:hover:bg-purple-700 rounded-full hover:scale-125 hover:rotate-180">
                          <MoreHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                        </Button>
                      </div>
                      
                      <p className="mt-3 text-slate-900 dark:text-slate-100 leading-relaxed text-lg">
                        {renderTweetContent(tweet.content)}
                      </p>

                      {tweet.thread.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {tweet.thread.map((threadTweet, index) => (
                            <div key={index} className="border-l-4 border-gradient-to-b from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 pl-4 py-3 bg-gradient-to-r from-purple-50/60 to-pink-50/40 dark:from-purple-900/60 dark:to-pink-900/40 rounded-r-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                              <p className="text-slate-800 dark:text-slate-200">{threadTweet}</p>
                            </div>
                          ))}
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border-0 shadow-sm animate-pulse">
                            Thread
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-6 max-w-md">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 -ml-2 transition-all duration-300 hover:scale-125 hover:-translate-y-1 rounded-full"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">{tweet.replies}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 hover:scale-125 hover:rotate-180 rounded-full ${tweet.isRetweeted ? 'text-purple-600 dark:text-purple-400' : ''}`}
                          onClick={() => handleRetweet(tweet.id)}
                        >
                          <Repeat2 className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">{tweet.retweets}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full ${tweet.isLiked ? 'text-rose-600 dark:text-rose-400' : ''}`}
                          onClick={() => handleLike(tweet.id)}
                        >
                          <Heart className={`w-5 h-5 mr-2 transition-all duration-300 ${tweet.isLiked ? 'fill-current scale-125 animate-bounce' : ''}`} />
                          <span className="text-sm font-medium">{tweet.likes}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-500 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-300 hover:scale-125 hover:-rotate-12 rounded-full"
                          onClick={() => handleShare(tweet)}
                        >
                          <Share className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="w-80 p-4 space-y-6 bg-white/40 dark:bg-slate-900/40">
          {/* Enhanced Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-4 w-5 h-5 text-purple-400 dark:text-purple-500 group-hover:scale-110 transition-transform duration-300" />
            <input
              type="text"
              placeholder="Search Regal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-purple-100 dark:bg-purple-900 rounded-2xl border-0 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 focus:bg-white dark:focus:bg-purple-700 transition-all duration-500 placeholder:text-purple-500 dark:placeholder:text-purple-400 text-slate-900 dark:text-slate-100 shadow-lg hover:shadow-xl focus:scale-105"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-3 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-full hover:scale-125 transition-all duration-300"
                onClick={() => setSearchQuery("")}
              >
                ×
              </Button>
            )}
          </div>

          <TrendingWidget onHashtagClick={handleHashtagClick} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
