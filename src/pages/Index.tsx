
import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Share, Search, Home, User, Bell, Mail, Bookmark, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import TweetComposer from "@/components/TweetComposer";
import SidebarNav from "@/components/SidebarNav";
import TrendingWidget from "@/components/TrendingWidget";

const Index = () => {
  const [tweets] = useState([
    {
      id: 1,
      author: "Sarah Chen",
      handle: "@sarahchen",
      avatar: "/placeholder.svg",
      time: "2h",
      content: "Just launched my new project! Excited to share it with the world 🚀✨",
      likes: 24,
      retweets: 8,
      replies: 12,
      isLiked: false,
      isRetweeted: false
    },
    {
      id: 2,
      author: "Alex Rivera",
      handle: "@alexr",
      avatar: "/placeholder.svg",
      time: "4h",
      content: "Beautiful sunset today! Sometimes you need to stop and appreciate the little things in life 🌅💜",
      likes: 156,
      retweets: 23,
      replies: 45,
      isLiked: true,
      isRetweeted: false
    },
    {
      id: 3,
      author: "Maya Patel",
      handle: "@mayatech",
      avatar: "/placeholder.svg",
      time: "6h",
      content: "Working on some exciting new features. Can't wait to show you all what we've been building! The future is bright 💎",
      likes: 89,
      retweets: 34,
      replies: 28,
      isLiked: false,
      isRetweeted: true
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar */}
        <SidebarNav />
        
        {/* Main Content */}
        <main className="flex-1 border-x border-pink-100">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-pink-100 p-4">
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
              <Card key={tweet.id} className="rounded-none border-0 shadow-none hover:bg-pink-50/30 transition-colors cursor-pointer">
                <div className="p-4">
                  <div className="flex space-x-3">
                    <Avatar className="ring-2 ring-pink-200">
                      <AvatarImage src={tweet.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                        {tweet.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">{tweet.author}</h3>
                        <span className="text-gray-500 text-sm">{tweet.handle}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500 text-sm">{tweet.time}</span>
                      </div>
                      
                      <p className="mt-2 text-gray-900 leading-relaxed">{tweet.content}</p>
                      
                      <div className="flex items-center justify-between mt-4 max-w-md">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pink-600 hover:bg-pink-50 -ml-2">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">{tweet.replies}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 hover:text-green-600 hover:bg-green-50 ${tweet.isRetweeted ? 'text-green-600' : ''}`}
                        >
                          <Repeat2 className="w-4 h-4 mr-1" />
                          <span className="text-sm">{tweet.retweets}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-gray-500 hover:text-pink-600 hover:bg-pink-50 ${tweet.isLiked ? 'text-pink-600' : ''}`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${tweet.isLiked ? 'fill-current' : ''}`} />
                          <span className="text-sm">{tweet.likes}</span>
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600 hover:bg-purple-50">
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
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Regal"
              className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-0 focus:ring-2 focus:ring-pink-300 focus:bg-white transition-all"
            />
          </div>

          <TrendingWidget />
        </aside>
      </div>
    </div>
  );
};

export default Index;
