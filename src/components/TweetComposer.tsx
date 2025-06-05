
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Smile, Calendar, MapPin } from "lucide-react";

const TweetComposer = () => {
  const [tweetText, setTweetText] = useState("");
  const maxLength = 280;

  return (
    <div className="p-4">
      <div className="flex space-x-3">
        <Avatar className="ring-2 ring-pink-200">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
            You
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <textarea
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            placeholder="What's happening?"
            className="w-full text-xl placeholder:text-gray-500 border-0 resize-none outline-none bg-transparent"
            rows={3}
            maxLength={maxLength}
          />
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2">
                <Calendar className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2">
                <MapPin className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`text-sm ${tweetText.length > maxLength ? 'text-red-500' : 'text-gray-500'}`}>
                  {tweetText.length}/{maxLength}
                </div>
                <div className="w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-gray-200"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${(tweetText.length / maxLength) * 62.8} 62.8`}
                      className={tweetText.length > maxLength ? 'text-red-500' : 'text-pink-500'}
                    />
                  </svg>
                </div>
              </div>
              
              <Button
                disabled={!tweetText.trim() || tweetText.length > maxLength}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-6 disabled:opacity-50"
              >
                Tweet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
