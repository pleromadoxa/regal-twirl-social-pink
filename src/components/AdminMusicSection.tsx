
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Music, 
  Play, 
  Pause, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search,
  Users,
  TrendingUp,
  Download
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
  is_public: boolean;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

const AdminMusicSection = () => {
  const { toast } = useToast();
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchAllTracks();
  }, []);

  const fetchAllTracks = async () => {
    console.log('Fetching all music tracks...');
    try {
      const { data, error } = await supabase
        .from('music_tracks')
        .select(`
          *,
          profiles!music_tracks_user_id_fkey (
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tracks:', error);
        toast({
          title: "Error fetching tracks",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('Fetched tracks:', data);

      const transformedTracks: MusicTrack[] = (data || []).map(track => ({
        ...track,
        profiles: Array.isArray(track.profiles) ? track.profiles[0] : track.profiles
      }));

      setTracks(transformedTracks);
    } catch (error) {
      console.error('Error in fetchAllTracks:', error);
      toast({
        title: "Failed to load tracks",
        description: "There was an error loading the music tracks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTrackVisibility = async (trackId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from('music_tracks')
        .update({ is_public: !isPublic })
        .eq('id', trackId);

      if (error) throw error;

      setTracks(prev => prev.map(track => 
        track.id === trackId ? { ...track, is_public: !isPublic } : track
      ));

      toast({
        title: "Track updated",
        description: `Track ${!isPublic ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error) {
      console.error('Error updating track:', error);
      toast({
        title: "Error",
        description: "Failed to update track visibility",
        variant: "destructive"
      });
    }
  };

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Are you sure you want to delete this track? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('music_tracks')
        .delete()
        .eq('id', trackId);

      if (error) throw error;

      setTracks(prev => prev.filter(track => track.id !== trackId));
      
      toast({
        title: "Track deleted",
        description: "Track has been permanently deleted",
      });
    } catch (error) {
      console.error('Error deleting track:', error);
      toast({
        title: "Error",
        description: "Failed to delete track",
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

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    track.genre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTracks = tracks.length;
  const publicTracks = tracks.filter(t => t.is_public).length;
  const totalPlays = tracks.reduce((sum, track) => sum + track.plays_count, 0);
  const totalLikes = tracks.reduce((sum, track) => sum + track.likes_count, 0);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTracks}</p>
                <p className="text-sm text-muted-foreground">Total Tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publicTracks}</p>
                <p className="text-sm text-muted-foreground">Public Tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalPlays}</p>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalLikes}</p>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Music Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Music Management
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchAllTracks} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto text-gray-300 mb-4 animate-spin" />
                <p className="text-gray-500">Loading tracks...</p>
              </div>
            ) : filteredTracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No tracks found</h3>
                <p className="text-gray-500">
                  {tracks.length === 0 ? 'No music tracks have been uploaded yet.' : 'No tracks match your search criteria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="relative w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute inset-0 w-full h-full bg-black/30 hover:bg-black/50 text-white opacity-80 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setCurrentTrack(track);
                          setIsPlaying(!isPlaying);
                        }}
                      >
                        {currentTrack?.id === track.id && isPlaying ? 
                          <Pause className="w-6 h-6" /> : 
                          <Play className="w-6 h-6" />
                        }
                      </Button>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{track.title}</h4>
                        <Badge variant={track.is_public ? "default" : "secondary"}>
                          {track.is_public ? "Public" : "Private"}
                        </Badge>
                        {track.genre && (
                          <Badge variant="outline">{track.genre}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {track.artist} {track.album && `• ${track.album}`}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Duration: {formatDuration(track.duration)}</span>
                        <span>Plays: {track.plays_count}</span>
                        <span>Likes: {track.likes_count}</span>
                        <span>Created: {new Date(track.created_at).toLocaleDateString()}</span>
                      </div>
                      {track.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {track.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={track.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          {track.profiles?.display_name?.[0] || track.profiles?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {track.profiles?.display_name || track.profiles?.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ID: {track.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleTrackVisibility(track.id, track.is_public)}
                        title={track.is_public ? 'Make Private' : 'Make Public'}
                      >
                        {track.is_public ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        asChild
                        title="Download"
                      >
                        <a href={track.file_url} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTrack(track.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Audio Player */}
      {currentTrack && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg z-50 min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">{currentTrack.title}</h4>
              <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCurrentTrack(null);
                setIsPlaying(false);
              }}
            >
              ×
            </Button>
          </div>
          
          {currentTrack.file_url && (
            <audio
              src={currentTrack.file_url}
              autoPlay={isPlaying}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              controls
              className="w-full mt-3"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminMusicSection;
