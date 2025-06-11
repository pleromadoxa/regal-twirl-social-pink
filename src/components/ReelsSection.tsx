
import { useState } from 'react';
import { Plus, Video, Play, Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useReels } from '@/hooks/useReels';
import { useAuth } from '@/contexts/AuthContext';
import ReelCard from './ReelCard';
import ReelUpload from './ReelUpload';

const ReelsSection = () => {
  const [showUpload, setShowUpload] = useState(false);
  const { reels, loading, hasMore, toggleLike, recordView, loadMore, refresh } = useReels();
  const { user } = useAuth();

  const handleUploadComplete = () => {
    setShowUpload(false);
    refresh();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Reels
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Discover amazing short videos from the community
          </p>
        </div>
        
        {user && (
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-full">
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

      {/* Reels Grid - Enhanced Design */}
      {reels.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-12 max-w-md mx-auto">
            <Video className="w-20 h-20 mx-auto text-purple-500 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">No reels yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Be the first to share a short video!</p>
            {user && (
              <Button
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Reel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {reels.map((reel, index) => (
              <div key={reel.id} className="group">
                <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-[1.02]">
                  <ReelCard
                    reel={reel}
                    isActive={index === 0}
                    onLike={toggleLike}
                    onView={recordView}
                  />
                </div>
                
                {/* Reel Info Below */}
                <div className="mt-4 px-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
                      {reel.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {reel.profiles?.display_name || reel.profiles?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{reel.profiles?.username || 'unknown'}
                      </p>
                      {reel.title && (
                        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 line-clamp-2">
                          {reel.title}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{reel.likes_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{reel.comments_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{reel.views_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center pt-8">
              <Button
                onClick={loadMore}
                variant="outline"
                disabled={loading}
                className="min-w-40 rounded-full border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {loading ? 'Loading...' : 'Load More Reels'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReelsSection;
