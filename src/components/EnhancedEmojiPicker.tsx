import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile, Zap, Star, Flame } from 'lucide-react';

interface EnhancedEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

const QUICK_REACTIONS = [
  { emoji: '😀', label: 'Happy' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🎉', label: 'Party' },
  { emoji: '👏', label: 'Clap' },
];

const ANIMATED_EMOJIS = [
  { emoji: '🎊', label: 'Confetti', animated: true },
  { emoji: '✨', label: 'Sparkles', animated: true },
  { emoji: '💫', label: 'Dizzy', animated: true },
  { emoji: '🌟', label: 'Glowing Star', animated: true },
  { emoji: '💥', label: 'Explosion', animated: true },
  { emoji: '🎆', label: 'Fireworks', animated: true },
  { emoji: '🌈', label: 'Rainbow', animated: true },
  { emoji: '⚡', label: 'Lightning', animated: true },
];

export const EnhancedEmojiPicker = ({ onEmojiSelect, children }: EnhancedEmojiPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'animated' | 'all'>('quick');

  const handleEmojiClick = (emojiData: any) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const handleQuickReaction = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-500 hover:text-purple-600" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-0 shadow-2xl bg-white dark:bg-gray-800" 
        align="end"
        sideOffset={8}
      >
        <div className="border rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-gray-50 dark:bg-gray-700 border-b">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'quick'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Quick
              </div>
            </button>
            <button
              onClick={() => setActiveTab('animated')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'animated'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Star className="w-4 h-4" />
                Animated
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-gray-800 text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Smile className="w-4 h-4" />
                All
              </div>
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'quick' && (
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_REACTIONS.map((reaction) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => handleQuickReaction(reaction.emoji)}
                      className="p-3 text-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      title={reaction.label}
                    >
                      {reaction.emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'animated' && (
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {ANIMATED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji.emoji}
                      onClick={() => handleQuickReaction(emoji.emoji)}
                      className="p-3 text-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110 animate-pulse"
                      title={emoji.label}
                    >
                      <span className="inline-block animate-bounce">{emoji.emoji}</span>
                    </button>
                  ))}
                </div>
                
                {/* Animated GIF-like emojis */}
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Special Effects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {['🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '🎶'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleQuickReaction(emoji)}
                        className="p-2 text-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      >
                        <span className="inline-block hover:animate-spin">{emoji}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'all' && (
              <div className="p-2">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width="100%"
                  height={300}
                  previewConfig={{
                    showPreview: false
                  }}
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  autoFocusSearch={false}
                />
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EnhancedEmojiPicker;