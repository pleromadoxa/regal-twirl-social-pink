
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Image, Smile, Calendar, MapPin, Hash, AtSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TweetComposer = () => {
  const [tweetText, setTweetText] = useState("");
  const [isThreadMode, setIsThreadMode] = useState(false);
  const [threadTweets, setThreadTweets] = useState([""]);
  const { toast } = useToast();
  const maxLength = 280;

  const handleTweetSubmit = () => {
    if (isThreadMode) {
      const validTweets = threadTweets.filter(tweet => tweet.trim().length > 0);
      if (validTweets.length > 0) {
        toast({
          description: `Thread with ${validTweets.length} posts posted!`,
          duration: 3000,
        });
        setThreadTweets([""]);
        setIsThreadMode(false);
      }
    } else {
      if (tweetText.trim()) {
        toast({
          description: "Post published successfully!",
          duration: 3000,
        });
        setTweetText("");
      }
    }
  };

  const addThreadTweet = () => {
    setThreadTweets([...threadTweets, ""]);
  };

  const updateThreadTweet = (index: number, text: string) => {
    const newThreadTweets = [...threadTweets];
    newThreadTweets[index] = text;
    setThreadTweets(newThreadTweets);
  };

  const removeThreadTweet = (index: number) => {
    if (threadTweets.length > 1) {
      setThreadTweets(threadTweets.filter((_, i) => i !== index));
    }
  };

  const getCharacterCountColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  const getProgressColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-amber-500';
    return 'text-purple-500';
  };

  const renderTweetInput = (text: string, onChange: (text: string) => void, index?: number) => (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={index === 0 || !isThreadMode ? "What's happening?" : "Continue your thread..."}
        className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent min-h-[80px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-lg p-2 hover:shadow-lg"
        maxLength={maxLength + 50}
      />
      
      {isThreadMode && index !== undefined && index > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeThreadTweet(index)}
          className="absolute top-2 right-2 text-purple-400 hover:text-red-500 transition-all duration-300 hover:scale-125 hover:rotate-180"
        >
          ×
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
      <div className="flex space-x-4">
        <Avatar className="ring-2 ring-purple-300 dark:ring-purple-500 transition-all duration-500 hover:ring-pink-400 dark:hover:ring-pink-400 shadow-lg hover:scale-110 hover:shadow-2xl">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-to-br from-purple-500 via-blue-500 to-pink-500 text-white font-semibold animate-pulse">
            You
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          {/* Main post or thread */}
          {isThreadMode ? (
            <div className="space-y-4">
              {threadTweets.map((tweet, index) => (
                <div key={index} className="relative">
                  {index > 0 && (
                    <div className="absolute -left-8 top-0 w-0.5 h-full bg-gradient-to-b from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 animate-pulse"></div>
                  )}
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-700 p-4 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    {renderTweetInput(tweet, (text) => updateThreadTweet(index, text), index)}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-purple-400 dark:text-purple-500 bg-purple-100 dark:bg-purple-700 px-2 py-1 rounded-full animate-pulse">Post {index + 1}</span>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-medium ${getCharacterCountColor(tweet)}`}>
                          {tweet.length}/{maxLength}
                        </span>
                        <div className="w-6 h-6">
                          <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className="text-purple-200 dark:text-purple-600"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeDasharray={`${Math.min((tweet.length / maxLength) * 50.3, 50.3)} 50.3`}
                              className={getProgressColor(tweet)}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={addThreadTweet}
                className="border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-full hover:scale-110"
              >
                + Add to thread
              </Button>
            </div>
          ) : (
            <div className="relative">
              <textarea
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
                placeholder="What's happening?"
                className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent dark:text-slate-100 min-h-[100px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-xl p-3 hover:shadow-lg"
                maxLength={maxLength + 50}
              />
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-700">
            <div className="flex items-center space-x-2">
              {[Image, Smile, Calendar, MapPin, Hash, AtSign].map((Icon, idx) => (
                <Button 
                  key={idx}
                  variant="ghost" 
                  size="sm" 
                  className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
                >
                  <Icon className="w-5 h-5" />
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={`border-blue-300 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-full hover:scale-110 ${isThreadMode ? 'bg-blue-50 dark:bg-blue-900/20 scale-105' : ''}`}
              >
                {isThreadMode ? 'Single Post' : 'Thread'}
              </Button>
              
              {!isThreadMode && (
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${getCharacterCountColor(tweetText)}`}>
                    {tweetText.length}/{maxLength}
                  </span>
                  <div className="w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-purple-200 dark:text-purple-600"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${Math.min((tweetText.length / maxLength) * 62.8, 62.8)} 62.8`}
                        className={getProgressColor(tweetText)}
                      />
                    </svg>
                  </div>
                </div>
              )}
              
              <Button
                disabled={isThreadMode ? threadTweets.every(tweet => !tweet.trim()) : (!tweetText.trim() || tweetText.length > maxLength)}
                onClick={handleTweetSubmit}
                className="bg-gradient-to-r from-purple-600 via-blue-500 to-pink-600 hover:from-purple-700 hover:via-blue-600 hover:to-pink-700 text-white rounded-full px-8 py-2 disabled:opacity-50 transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-2xl font-medium"
              >
                {isThreadMode ? 'Post Thread' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
