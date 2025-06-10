
import { useState } from 'react';
import { Plus, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useReels } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import ReelCard from './ReelCard';
import ReelUpload from './ReelUpload';
import { type Reel } from '@/services/reelsService';

const ReelsSection = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const { reels, loading, hasMore, toggleLike, recordView, loadMore, refresh } = useReels();
  const { user } = useAuth();

  const handleUploadComplete = () => {
    setShowUpload(false);
    refresh();
  };

  const handleComment = (reel: Reel) => {
    setSelectedReel(reel);
    // TODO: Implement comments modal
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Video className="w-12 h-12 mx-auto text-purple-400 mb-4" />
          <p className="text-gray-500">Loading reels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-purple-800 dark:text-purple-300">
            Short Video Reels
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Discover amazing short videos from the community
          </p>
        </div>
        
        {user && (
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-6 py-3">
                <Plus className="w-5 h-5 mr-2" />
                Create Reel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ReelUpload
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUpload(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Reels Grid */}
      {reels.length === 0 ? (
        <div className="text-center py-16">
          <Video className="w-20 h-20 mx-auto text-gray-400 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-4">No reels yet</h3>
          <p className="text-gray-500 mb-6 text-lg">Be the first to share a short video!</p>
          {user && (
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Reel
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onLike={toggleLike}
                onView={recordView}
                onComment={handleComment}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loading}
                className="min-w-40 py-3 text-lg"
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReelsSection;
