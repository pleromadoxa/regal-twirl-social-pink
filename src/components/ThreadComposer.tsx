
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-4">
      {threadTweets.map((tweet, index) => (
        <div key={index} className="relative">
          {index > 0 && (
            <div className="absolute -left-8 top-0 w-0.5 h-full bg-gradient-to-b from-purple-400 to-pink-400 dark:from-purple-500 dark:to-pink-500 animate-pulse"></div>
          )}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-200 dark:border-purple-700 p-4 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
            <div className="relative">
              <textarea
                value={tweet}
                onChange={(e) => onUpdateTweet(index, e.target.value)}
                placeholder={index === 0 ? "What's happening?" : "Continue your thread..."}
                className="w-full text-xl placeholder:text-purple-500 dark:placeholder:text-purple-400 border-0 resize-none outline-none bg-transparent min-h-[80px] transition-all duration-300 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 rounded-lg p-2 hover:shadow-lg"
                maxLength={maxLength + 50}
              />
              
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveTweet(index)}
                  className="absolute top-2 right-2 text-purple-400 hover:text-red-500 transition-all duration-300 hover:scale-125 hover:rotate-180"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
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
        onClick={onAddTweet}
        className="border-purple-300 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-full hover:scale-110"
      >
        + Add to thread
      </Button>
    </div>
  );
};

export default ThreadComposer;
