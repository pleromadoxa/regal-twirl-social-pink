import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MusicUpload from '@/components/MusicUpload';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Music as MusicIcon, Play, Pause, Search, Heart, Share, Download, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMusicLikes } from '@/hooks/useMusicLikes';

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
  track_type?: string;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isTrackLiked, toggleLike } = useMusicLikes();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchTracks();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    // Check if user is admin by email
    const isUserAdmin = user.email === 'pleromadoxa@gmail.com';
    setIsAdmin(isUserAdmin);
  };

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
      // Pause current track
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      // Play new track or resume
      setCurrentTrack(track);
      if (audioRef.current) {
        audioRef.current.src = track.file_url;
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.error('Error playing audio:', error);
          toast({
            title: "Playback Error",
            description: "Unable to play this track",
            variant: "destructive"
          });
        });
      }
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const featuredTracks = tracks.filter(track => track.track_type === 'featured' || !track.track_type);
  const affirmationTracks = tracks.filter(track => track.track_type === 'affirmation');

  const renderTracksList = (tracksList: MusicTrack[]) => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
          <p className="text-gray-500">Loading tracks...</p>
        </div>
      );
    }

    if (tracksList.length === 0) {
      return (
        <div className="text-center py-12">
          <MusicIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tracks found</p>
        </div>
      );
    }

    return tracksList.map((track) => (
      <Card key={track.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-gradient-to-r from-white to-purple-50/30 dark:from-slate-800 dark:to-purple-900/20 border-purple-200/50 dark:border-purple-800/50">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Album Art & Play Button */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 dark:from-purple-600 dark:via-pink-600 dark:to-purple-800 flex items-center justify-center rounded-l-lg">
                <MusicIcon className="w-10 h-10 text-white/90" />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-l-lg">
                <Button
                  size="sm"
                  className="w-12 h-12 rounded-full p-0 bg-white/90 hover:bg-white border-0 shadow-lg"
                  onClick={() => handlePlayPause(track)}
                >
                  {currentTrack?.id === track.id && isPlaying ? (
                    <Pause className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Play className="w-6 h-6 text-purple-600 ml-1" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Track Info */}
            <div className="flex-1 p-4 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 truncate mb-1">
                    {track.title}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 font-medium truncate mb-2">
                    {track.artist}
                  </p>
                  {track.album && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                      Album: {track.album}
                    </p>
                  )}
                  
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={track.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs bg-purple-100 dark:bg-purple-800">
                        {track.profiles?.display_name?.[0] || track.profiles?.username?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {track.profiles?.display_name || track.profiles?.username}
                    </span>
                  </div>
                </div>
                
                {/* Stats & Controls */}
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex items-center space-x-3">
                    {track.genre && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                        {track.genre}
                      </Badge>
                    )}
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {formatDuration(track.duration)}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`w-9 h-9 p-0 rounded-full transition-all ${
                        isTrackLiked(track.id) 
                          ? 'text-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                      title="Like"
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart className={`w-4 h-4 ${isTrackLiked(track.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-9 h-9 p-0 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all" 
                      title="Share"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: track.title,
                            text: `Listen to "${track.title}" by ${track.artist}`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(`${window.location.href}?track=${track.id}`);
                          toast({
                            title: "Link copied",
                            description: "Track link copied to clipboard"
                          });
                        }
                      }}
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-9 h-9 p-0 rounded-full text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all" 
                      title="Download"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = track.file_url;
                        a.download = `${track.title} - ${track.artist}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        toast({
                          title: "Download started",
                          description: `"${track.title}" is downloading`
                        });
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Play Stats */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>♥ {track.likes_count}</span>
                    <span>▶ {track.plays_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Now Playing Indicator */}
          {currentTrack?.id === track.id && isPlaying && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500">
              <div className="h-full bg-white/30 animate-pulse"></div>
            </div>
          )}
        </CardContent>
      </Card>
    ));
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const genres = [...new Set(tracks.map(track => track.genre).filter(Boolean))];

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);
      toast({
        title: "Playback Error",
        description: "Unable to play this track",
        variant: "destructive"
      });
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 flex gap-8 ${isMobile ? 'px-4 pb-20' : 'pl-80 pr-[420px]'}`}>
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MusicIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Music</h1>
              </div>
              {isAdmin && <MusicUpload onUploadComplete={fetchTracks} />}
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
                <TabsTrigger value="affirmations">Affirmations</TabsTrigger>
                <TabsTrigger value="genres">Genres</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
              </TabsList>

              <TabsContent value="featured" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Featured Tracks</h2>
                  {renderTracksList(featuredTracks.filter(track =>
                    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="affirmations" className="mt-6">
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Affirmations</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      These are affirmations of Pastor Chris Oyakhilome Dsc Dsc DD.
                    </p>
                  </div>
                  {renderTracksList(affirmationTracks.filter(track =>
                    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
                  ))}
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
            </Tabs>

            {/* Hidden audio element for playback */}
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              onError={() => {
                setIsPlaying(false);
                toast({
                  title: "Playback Error",
                  description: "Unable to play this track",
                  variant: "destructive"
                });
              }}
            />
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Music;
