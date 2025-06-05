
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
      description: tweets.find(t => t.id === tweetId)?.isRetweeted ? "Retweet removed" : "Retweeted!",
      duration: 2000,
    });
  };

  const handleShare = (tweet: any) => {
    navigator.clipboard.writeText(`"${tweet.content}" - ${tweet.author} (${tweet.handle})`);
    toast({
      description: "Tweet copied to clipboard!",
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-pink-100">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-pink-100 p-4 z-10">
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Home
            </h1>
          </div>

          {/* Tweet Composer */}
          <div className="border-b border-pink-100">
            <TweetComposer />
          </div>

          {/* Timeline */}
          <div className="divide-y divide-pink-100">
            {tweets.map((tweet) => (
              <Card key={tweet.id} className="rounded-none border-0 shadow-none hover:bg-pink-50/30 transition-all duration-300 cursor-pointer group">
                <div className="p-4">
                  <div className="flex space-x-3">
                    <Avatar className="ring-2 ring-pink-200 transition-all duration-300 group-hover:ring-pink-300">
                      <AvatarImage src={tweet.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                        {tweet.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">{tweet.author}</h3>
                        {tweet.isVerified && (
                          <Verified className="w-4 h-4 text-blue-500 fill-current" />
                        )}
                        <span className="text-gray-500 text-sm">{tweet.handle}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 text-sm">{formatTimeAgo(tweet.time)}</span>
                        <Button variant="ghost" size="sm" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </Button>
                      </div>
                      
                      <p className="mt-2 text-gray-900 leading-relaxed">
                        {renderTweetContent(tweet.content)}
                      </p>

                      {tweet.thread.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {tweet.thread.map((threadTweet, index) => (
                            <div key={index} className="border-l-2 border-pink-200 pl-4 py-2">
                              <p className="text-gray-800 text-sm">{threadTweet}</p>
                            </div>
                          ))}
                          <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
                            Thread
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-4 max-w-md">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-pink-600 hover:bg-pink-50 -ml-2 transition-all duration-200 hover:scale-105"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{tweet.replies}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200 hover:scale-105 ${tweet.isRetweeted ? 'text-green-600' : ''}`}
                          onClick={() => handleRetweet(tweet.id)}
                        >
                          <Repeat2 className="w-4 h-4 mr-1" />
                          <span className="text-sm">{tweet.retweets}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 hover:scale-105 ${tweet.isLiked ? 'text-pink-600' : ''}`}
                          onClick={() => handleLike(tweet.id)}
                        >
                          <Heart className={`w-4 h-4 mr-1 transition-all duration-200 ${tweet.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">{tweet.likes}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 hover:scale-105"
                          onClick={() => handleShare(tweet)}
                        >
                          <Share className="w-4 h-4" />
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
        <aside className="w-80 p-4 space-y-4">
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Regal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all duration-300 placeholder:text-gray-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
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
