import { useProfileReels } from '@/hooks/useProfileReels';
import { Skeleton } from '@/components/ui/skeleton';
import { Play } from 'lucide-react';

interface ProfileReelsListProps {
  userId?: string;
}

const ProfileReelsList = ({ userId }: ProfileReelsListProps) => {
  const { reels, loading } = useProfileReels(userId);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[9/16] rounded-lg overflow-hidden">
            <Skeleton className="w-full h-full" />
          </div>
        ))}
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
        <p>No posted reels yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {reels.map((reel) => (
        <div
          key={reel.id}
          className="aspect-[9/16] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 relative group cursor-pointer"
        >
          {reel.thumbnail_url && (
            <img
              src={reel.thumbnail_url}
              alt={reel.title || 'Reel'}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
            <Play className="w-8 h-8 text-white" fill="white" />
          </div>
          <div className="absolute bottom-2 left-2 right-2">
            <div className="flex items-center text-white text-xs">
              <Play className="w-3 h-3 mr-1" />
              {reel.views_count || 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileReelsList;