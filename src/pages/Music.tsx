import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MusicUpload from '@/components/MusicUpload';
import { 
  Music as MusicIcon, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2,
  Heart,
  Share2,
  Download,
  TrendingUp,
  Users,
  Disc,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  file_url: string;
  genre?: string;
  description?: string;
  plays_count: number;
  likes_count: number;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    is_verified: boolean;
  };
}

const Music = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTracks();
    if (user) {
      fetchLikedTracks();
    }
  }, [user]);

  const fetchTracks = async () => {
    console.log('Fetching music tracks...');
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          id,
          title,
          artist,
          album,
          duration,
          file_url,
          genre,
          description,
          plays_count,
          likes_count,
          created_at,
          user_id,
          profiles (
            username,
            display_name,
            is_verified
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching tracks:', error);
        toast({
          title: "Error loading tracks",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched tracks:', data);
      setTracks(data || []);
    } catch (error) {
      console.error('Error in fetchTracks:', error);
      toast({
        title: "Failed to load tracks",
        description: "There was an error loading music tracks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedTracks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('music_likes')
        .select('track_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching liked tracks:', error);
        return;
      }

      setLikedTracks(new Set(data?.map(like => like.track_id) || []));
    } catch (error) {
      console.error('Error in fetchLikedTracks:', error);
    }
  };

  const handlePlayTrack = async (track: MusicTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Update play count
    try {
      const { error } = await supabase
        .from('music_tracks')
        .update({ plays_count: track.plays_count + 1 })
        .eq('id', track.id);

      if (!error) {
        // Update local state
        setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, plays_count: t.plays_count + 1 } : t
        ));
      }
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLikeTrack = async (trackId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like tracks",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedTracks.has(trackId);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('music_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('track_id', trackId);

        if (error) throw error;

        setLikedTracks(prev => {
          const newSet = new Set(prev);
          newSet.delete(trackId);
          return newSet;
        });

        // Update likes count locally
        setTracks(prev => prev.map(track => 
          track.id === trackId ? { ...track, likes_count: track.likes_count - 1 } : track
        ));
      } else {
        // Like
        const { error } = await supabase
          .from('music_likes')
          .insert({
            user_id: user.id,
            track_id: trackId
          });

        if (error) throw error;

        setLikedTracks(prev => new Set(prev).add(trackId));

        // Update likes count locally
        setTracks(prev => prev.map(track => 
          track.id === trackId ? { ...track, likes_count: track.likes_count + 1 } : track
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <MusicIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Regal Music
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Discover amazing music from artists worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={fetchTracks} 
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {user && <MusicUpload onUploadComplete={fetchTracks} />}
              </div>
            </div>
          </div>

          <div className="p-6">
            <Tabs defaultValue="discover" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="discover">Discover</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="artists">Artists</TabsTrigger>
              </TabsList>

              <TabsContent value="discover" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Featured Tracks
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {tracks.length} tracks available
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-12">
                        <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
                        <p className="text-gray-500">Loading tracks...</p>
                      </div>
                    ) : tracks.length === 0 ? (
                      <div className="text-center py-12">
                        <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No tracks yet</h3>
                        <p className="text-gray-500 mb-4">Be the first to upload music!</p>
                        {user && <MusicUpload onUploadComplete={fetchTracks} />}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tracks.map((track) => (
                          <Card key={track.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                            <CardContent className="p-4">
                              <div className="relative mb-4">
                                <div className="w-full h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center relative overflow-hidden">
                                  <MusicIcon className="w-12 h-12 text-white opacity-50" />
                                  <Button
                                    size="lg"
                                    className="absolute inset-0 w-full h-full bg-black/30 hover:bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    onClick={() => handlePlayTrack(track)}
                                  >
                                    <Play className="w-8 h-8" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-lg truncate">{track.title}</h4>
                                  {track.profiles?.is_verified && (
                                    <Badge variant="verified" className="text-xs">
                                      ✓ Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground">{track.artist}</p>
                                {track.album && (
                                  <p className="text-sm text-muted-foreground">{track.album}</p>
                                )}
                                {track.genre && (
                                  <Badge variant="outline" className="text-xs">
                                    {track.genre}
                                  </Badge>
                                )}
                                
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDuration(track.duration)}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      onClick={() => handleLikeTrack(track.id)}
                                      className={likedTracks.has(track.id) ? 'text-red-500' : ''}
                                    >
                                      <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                                      <span className="text-xs ml-1">{track.likes_count}</span>
                                    </Button>
                                    <Button size="sm" variant="ghost">
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-muted-foreground">
                                  {track.plays_count} plays • by {track.profiles?.display_name || track.profiles?.username || 'Unknown Artist'}
                                </div>

                                {track.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {track.description}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trending">
                <Card>
                  <CardHeader>
                    <CardTitle>Trending Now</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Trending Music</h3>
                      <p className="text-gray-500">Discover what's hot right now!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="playlists">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Disc className="w-5 h-5" />
                      Popular Playlists
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Disc className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Playlists</h3>
                      <p className="text-gray-500">Create and discover amazing playlists!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="artists">
                <Card>
                  <CardHeader>
                    <CardTitle>Featured Artists</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Artist Profiles</h3>
                      <p className="text-gray-500">Discover talented artists on Regal Music!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Music Player */}
          {currentTrack && (
            <div className="fixed bottom-0 left-80 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-purple-200 dark:border-purple-800 p-4 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                  <MusicIcon className="w-8 h-8 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold">{currentTrack.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                  <div className="text-xs text-muted-foreground">
                    {currentTrack.plays_count} plays • {formatDuration(currentTrack.duration)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={togglePlayPause} className="bg-purple-600 hover:bg-purple-700">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Volume2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleLikeTrack(currentTrack.id)}
                    className={likedTracks.has(currentTrack.id) ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${likedTracks.has(currentTrack.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Enhanced Audio element */}
              {currentTrack.file_url && (
                <div className="mt-3">
                  <audio
                    src={currentTrack.file_url}
                    autoPlay={isPlaying}
                    onEnded={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controls
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Music;
