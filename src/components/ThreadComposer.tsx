
import { X, Plus, Sparkles, MessageCircle, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ThreadComposerProps {
  threadTweets: string[];
  maxLength: number;
  onUpdateTweet: (index: number, text: string) => void;
  onRemoveTweet: (index: number) => void;
  onAddTweet: () => void;
}

const ThreadComposer = ({
  threadTweets,
  maxLength,
  onUpdateTweet,
  onRemoveTweet,
  onAddTweet
}: ThreadComposerProps) => {
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

  const getProgressWidth = (text: string) => {
    return Math.min((text.length / maxLength) * 100, 100);
  };

  return (
    <div className="space-y-6 relative">
      {/* Thread Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
          <MessageCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
            Thread Creator
          </span>
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
        </div>
        <Badge variant="outline" className="border-purple-200 text-purple-600 dark:border-purple-700 dark:text-purple-400">
          {threadTweets.length} post{threadTweets.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Thread Connection Line */}
      <div className="absolute left-8 top-20 bottom-20 w-0.5 bg-gradient-to-b from-purple-300 via-pink-300 to-purple-300 dark:from-purple-600 dark:via-pink-600 dark:to-purple-600 opacity-60"></div>

      {threadTweets.map((tweet, index) => (
        <div key={index} className="relative pl-4">
          {/* Thread Node */}
          <div className="absolute -left-2 top-6 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg border-2 border-white dark:border-slate-800 z-10 animate-pulse"></div>
          
          {/* Connection to next post */}
          {index < threadTweets.length - 1 && (
            <div className="absolute left-0 top-10 w-0.5 h-16 bg-gradient-to-b from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 opacity-70"></div>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-purple-100 dark:border-purple-800 p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-purple-300 dark:hover:border-purple-600 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-blue-50/50 dark:from-purple-900/20 dark:via-pink-900/10 dark:to-blue-900/20 opacity-60"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full">
                    <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></span>
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      Post {index + 1}
                    </span>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                      Thread Start
                    </Badge>
                  )}
                </div>
                
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTweet(index)}
                    className="text-purple-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-110 hover:rotate-12 rounded-full w-8 h-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={tweet}
                  onChange={(e) => onUpdateTweet(index, e.target.value)}
                  placeholder={index === 0 ? "Start your thread... ✨" : "Continue your story..."}
                  className="w-full text-lg placeholder:text-purple-400 dark:placeholder:text-purple-500 border-0 resize-none outline-none bg-transparent min-h-[100px] p-4 rounded-2xl transition-all duration-300 focus:bg-purple-50/30 dark:focus:bg-purple-800/30 focus:ring-2 focus:ring-purple-300 dark:focus:ring-purple-600"
                  maxLength={maxLength + 50}
                />
                
                {/* Character count overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-sm">
                    <span className={`text-xs font-medium ${getCharacterCountColor(tweet)}`}>
                      {tweet.length}
                    </span>
                    <span className="text-xs text-slate-400">/{maxLength}</span>
                  </div>
                  
                  {/* Progress circle */}
                  <div className="relative w-8 h-8">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-purple-200 dark:text-purple-700"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray={`${Math.min((tweet.length / maxLength) * 75.4, 75.4)} 75.4`}
                        className={getProgressColor(tweet)}
                        strokeLinecap="round"
                      />
                    </svg>
                    {tweet.length > maxLength * 0.9 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar at bottom */}
              <div className="mt-4 w-full h-1 bg-purple-100 dark:bg-purple-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300 ${getProgressColor(tweet)}`}
                  style={{ width: `${getProgressWidth(tweet)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Continue indicator */}
          {index < threadTweets.length - 1 && (
            <div className="flex justify-center my-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
                <ArrowDown className="w-3 h-3 text-purple-500 animate-bounce" />
                <span className="text-xs text-purple-600 dark:text-purple-400">continues</span>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Add Thread Button */}
      <div className="flex justify-center pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onAddTweet}
          className="border-2 border-dashed border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-300 rounded-2xl hover:scale-105 hover:border-solid px-8 py-3 group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">Add to thread</span>
          <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
        </Button>
      </div>
    </div>
  );
};

export default ThreadComposer;
