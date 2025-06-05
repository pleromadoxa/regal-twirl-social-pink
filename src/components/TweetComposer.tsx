
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
          description: `Thread with ${validTweets.length} tweets posted!`,
          duration: 3000,
        });
        setThreadTweets([""]);
        setIsThreadMode(false);
      }
    } else {
      if (tweetText.trim()) {
        toast({
          description: "Tweet posted successfully!",
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
    if (length > maxLength * 0.8) return 'text-orange-500';
    return 'text-gray-500';
  };

  const getProgressColor = (text: string) => {
    const length = text.length;
    if (length > maxLength) return 'text-red-500';
    if (length > maxLength * 0.8) return 'text-orange-500';
    return 'text-pink-500';
  };

  const renderTweetInput = (text: string, onChange: (text: string) => void, index?: number) => (
    <div className="relative">
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={index === 0 || !isThreadMode ? "What's happening?" : "Continue your thread..."}
        className="w-full text-xl placeholder:text-gray-500 border-0 resize-none outline-none bg-transparent min-h-[80px] transition-all duration-200 focus:bg-pink-50/30 rounded-lg p-2"
        maxLength={maxLength + 50} // Allow some overflow for visual feedback
      />
      
      {isThreadMode && index !== undefined && index > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeThreadTweet(index)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          ×
        </Button>
      )}
    </div>
  );

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-3">
        <Avatar className="ring-2 ring-pink-200">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
            You
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          {/* Main tweet or thread */}
          {isThreadMode ? (
            <div className="space-y-3">
              {threadTweets.map((tweet, index) => (
                <div key={index} className="relative">
                  {index > 0 && (
                    <div className="absolute -left-6 top-0 w-0.5 h-full bg-pink-200"></div>
                  )}
                  <div className="bg-white rounded-lg border border-pink-100 p-3">
                    {renderTweetInput(tweet, (text) => updateThreadTweet(index, text), index)}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-400">Tweet {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs ${getCharacterCountColor(tweet)}`}>
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
                              strokeWidth="2"
                              className="text-gray-200"
                            />
                            <circle
                              cx="12"
                              cy="12"
                              r="8"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
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
                className="border-pink-300 text-pink-600 hover:bg-pink-50 transition-all duration-200"
              >
                + Add to thread
              </Button>
            </div>
          ) : (
            renderTweetInput(tweetText, setTweetText)
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <Calendar className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <MapPin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <Hash className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-pink-500 hover:bg-pink-50 p-2 transition-all duration-200 hover:scale-105">
                <AtSign className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsThreadMode(!isThreadMode)}
                className={`border-purple-300 text-purple-600 hover:bg-purple-50 transition-all duration-200 ${isThreadMode ? 'bg-purple-50' : ''}`}
              >
                {isThreadMode ? 'Single Tweet' : 'Thread'}
              </Button>
              
              {!isThreadMode && (
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${getCharacterCountColor(tweetText)}`}>
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
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-full px-6 disabled:opacity-50 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {isThreadMode ? 'Tweet Thread' : 'Tweet'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TweetComposer;
