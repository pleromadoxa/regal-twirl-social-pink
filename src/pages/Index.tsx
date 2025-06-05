
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
            className="text-pink-600 hover:text-pink-700 cursor-pointer font-medium transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-pink-100 dark:border-gray-700">
          {/* Header */}
          <div className="sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-pink-100 dark:border-gray-700 p-4 z-10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Home
            </h1>
          </div>

          {/* Post Composer */}
          <div className="border-b border-pink-100 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
            <TweetComposer />
          </div>

          {/* Timeline */}
          <div className="divide-y divide-pink-100 dark:divide-gray-700">
            {tweets.map((tweet) => (
              <Card key={tweet.id} className="rounded-none border-0 shadow-none hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50 transition-all duration-300 cursor-pointer group bg-white/50 dark:bg-gray-900/50">
                <div className="p-6">
                  <div className="flex space-x-4">
                    <Avatar className="ring-2 ring-pink-200 dark:ring-purple-400 transition-all duration-300 group-hover:ring-pink-300 dark:group-hover:ring-purple-300 group-hover:scale-105">
                      <AvatarImage src={tweet.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 text-white font-semibold">
                        {tweet.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{tweet.author}</h3>
                        {tweet.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{tweet.handle}</span>
                        <span className="text-gray-400 dark:text-gray-500">·</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{formatTimeAgo(tweet.time)}</span>
                        <Button variant="ghost" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <MoreHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </Button>
                      </div>
                      
                      <p className="mt-3 text-gray-900 dark:text-gray-100 leading-relaxed text-lg">
                        {renderTweetContent(tweet.content)}
                      </p>

                      {tweet.thread.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {tweet.thread.map((threadTweet, index) => (
                            <div key={index} className="border-l-2 border-gradient-to-b from-pink-300 to-purple-300 dark:from-pink-500 dark:to-purple-500 pl-4 py-3 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-r-lg">
                              <p className="text-gray-800 dark:text-gray-200">{threadTweet}</p>
                            </div>
                          ))}
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-pink-100 to-purple-100 dark:from-purple-900 dark:to-pink-900 text-pink-700 dark:text-pink-300 border-0">
                            Thread
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-6 max-w-md">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 -ml-2 transition-all duration-200 hover:scale-110 rounded-full"
                        >
                          <MessageCircle className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">{tweet.replies}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-110 rounded-full ${tweet.isRetweeted ? 'text-green-600 dark:text-green-400' : ''}`}
                          onClick={() => handleRetweet(tweet.id)}
                        >
                          <Repeat2 className="w-5 h-5 mr-2" />
                          <span className="text-sm font-medium">{tweet.retweets}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200 hover:scale-110 rounded-full ${tweet.isLiked ? 'text-pink-600 dark:text-pink-400' : ''}`}
                          onClick={() => handleLike(tweet.id)}
                        >
                          <Heart className={`w-5 h-5 mr-2 transition-all duration-200 ${tweet.isLiked ? 'fill-current scale-110' : ''}`} />
                          <span className="text-sm font-medium">{tweet.likes}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 hover:scale-110 rounded-full"
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
        <aside className="w-80 p-4 space-y-6 bg-white/50 dark:bg-gray-900/50">
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search Regal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border-0 focus:ring-2 focus:ring-pink-300 dark:focus:ring-purple-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 text-gray-900 dark:text-gray-100"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full"
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
