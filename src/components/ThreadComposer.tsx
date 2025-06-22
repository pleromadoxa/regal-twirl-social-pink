
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import CharacterCounter from './CharacterCounter';

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
  return (
    <div className="space-y-4">
      {threadTweets.map((tweet, index) => (
        <div key={index} className="relative">
          <div className="flex items-start space-x-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {index + 1}
              </div>
              {index < threadTweets.length - 1 && (
                <div className="w-0.5 h-16 bg-gradient-to-b from-purple-300 to-pink-300 mt-2" />
              )}
            </div>
            
            <div className="flex-1 relative">
              <textarea
                value={tweet}
                onChange={(e) => onUpdateTweet(index, e.target.value)}
                placeholder={index === 0 ? "Start your thread..." : "Continue your thread..."}
                className="w-full text-lg placeholder:text-purple-500 dark:placeholder:text-purple-400 border-2 border-purple-200 dark:border-purple-700 rounded-xl resize-none outline-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm dark:text-slate-100 min-h-[100px] p-4 transition-all duration-300 focus:border-purple-500 focus:bg-purple-50/50 dark:focus:bg-purple-800/50 hover:shadow-lg"
                maxLength={maxLength + 50}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
              
              <div className="flex items-center justify-between mt-2">
                <CharacterCounter text={tweet} maxLength={maxLength} />
                
                {threadTweets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveTweet(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="flex justify-center pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddTweet}
          className="border-2 border-dashed border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 rounded-full px-6 py-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tweet
        </Button>
      </div>
    </div>
  );
};

export default ThreadComposer;
