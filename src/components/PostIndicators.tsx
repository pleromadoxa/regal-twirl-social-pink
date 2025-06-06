
import { MessageCircle, Music, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PostIndicatorsProps {
  isThread?: boolean;
  hasAudio?: boolean;
  className?: string;
}

export const PostIndicators = ({ isThread, hasAudio, className = "" }: PostIndicatorsProps) => {
  if (!isThread && !hasAudio) return null;

  return (
    <div className={`flex items-center gap-2 mb-2 ${className}`}>
      {isThread && (
        <Badge 
          variant="secondary" 
          className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-md border border-white/30 dark:border-slate-600/30 text-purple-700 dark:text-purple-300 shadow-lg hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-300"
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Thread
        </Badge>
      )}
      {hasAudio && (
        <Badge 
          variant="secondary" 
          className="bg-white/20 dark:bg-slate-800/20 backdrop-blur-md border border-white/30 dark:border-slate-600/30 text-blue-700 dark:text-blue-300 shadow-lg hover:bg-white/30 dark:hover:bg-slate-700/30 transition-all duration-300"
        >
          <Music className="w-3 h-3 mr-1" />
          Audio
        </Badge>
      )}
    </div>
  );
};

export default PostIndicators;
