
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Music as MusicIcon, Play, Pause, Search, Heart, Share, Download, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string;
  file_url: string;
  likes_count: number;
  plays_count: number;
  created_at: string;
  user_id: string;
  is_public: boolean;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

const Music = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          profiles (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        toast({
          title: "Error",
          description: "Failed to load music tracks",
          variant: "destructive"
        });
        return;
      }

      setTracks(data || []);
    } catch (error) {
      console.error('Error in fetchTracks:', error);
      toast({
        title: "Error",
        description: "Something went wrong while loading tracks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = (track: MusicTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const genres = [...new Set(tracks.map(track => track.genre).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MusicIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Music</h1>
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Track
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search for songs, artists, or albums..."
                className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="featured" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="featured">Featured</TabsTrigger>
                <TabsTrigger value="genres">Genres</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="uploads">My Uploads</TabsTrigger>
              </TabsList>

              <TabsContent value="featured" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Featured Tracks</h2>
                  {loading ? (
                    <div className="text-center py-12">
                      <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
                      <p className="text-gray-500">Loading tracks...</p>
                    </div>
                  ) : filteredTracks.length === 0 ? (
                    <div className="text-center py-12">
                      <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No tracks found</p>
                    </div>
                  ) : (
                    filteredTracks.map((track) => (
                      <Card key={track.id} className="group hover:shadow-lg transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg flex items-center justify-center">
                                <MusicIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                              </div>
                              <Button
                                size="sm"
                                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900"
                                onClick={() => handlePlayPause(track)}
                              >
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <Pause className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <Play className="w-4 h-4 text-purple-600" />
                                )}
                              </Button>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {track.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {track.artist}
                              </p>
                              {track.album && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                  {track.album}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="w-5 h-5">
                                  <AvatarImage src={track.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {track.profiles?.display_name?.[0] || track.profiles?.username?.[0] || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">
                                  {track.profiles?.display_name || track.profiles?.username}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {track.genre && (
                                <Badge variant="secondary" className="text-xs">
                                  {track.genre}
                                </Badge>
                              )}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDuration(track.duration)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <Share className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="genres" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {genres.map((genre) => (
                    <Card key={genre} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MusicIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{genre}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {tracks.filter(t => t.genre === genre).length} tracks
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="playlists" className="mt-6">
                <div className="text-center py-12">
                  <MusicIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No playlists yet
                  </h2>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    Create your first playlist to organize your favorite tracks.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Create Playlist
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="uploads" className="mt-6">
                <div className="text-center py-12">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No uploads yet
                  </h2>
                  <p className="text-gray-500 dark:text-gray-500 mb-6">
                    Share your music with the community by uploading your tracks.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Track
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Music;
