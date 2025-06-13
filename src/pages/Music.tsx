
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
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
  Clock,
  Users,
  Disc
} from 'lucide-react';

const Music = () => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sample music data
  const featuredTracks = [
    {
      id: 1,
      title: "Midnight Dreams",
      artist: "Luna Silva",
      album: "Nocturnal Vibes",
      duration: "3:42",
      image: "/placeholder.svg",
      plays: "2.4M",
      isVerified: true
    },
    {
      id: 2,
      title: "Electric Soul",
      artist: "Neon Pulse",
      album: "Synthetic Hearts",
      duration: "4:15",
      image: "/placeholder.svg",
      plays: "1.8M",
      isVerified: false
    },
    {
      id: 3,
      title: "Ocean Waves",
      artist: "Coastal Harmony",
      album: "Natural Sounds",
      duration: "5:23",
      image: "/placeholder.svg",
      plays: "3.1M",
      isVerified: true
    }
  ];

  const trendingPlaylists = [
    {
      id: 1,
      name: "Chill Vibes",
      creator: "RegalMusic",
      tracks: 42,
      image: "/placeholder.svg",
      followers: "156K"
    },
    {
      id: 2,
      name: "Workout Hits",
      creator: "FitnessBeats",
      tracks: 38,
      image: "/placeholder.svg",
      followers: "98K"
    },
    {
      id: 3,
      name: "Focus Flow",
      creator: "StudyTunes",
      tracks: 27,
      image: "/placeholder.svg",
      followers: "67K"
    }
  ];

  const handlePlayTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center gap-3 mb-4">
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
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Featured Tracks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featuredTracks.map((track) => (
                        <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                          <div className="relative">
                            <img 
                              src={track.image} 
                              alt={track.title}
                              className="w-12 h-12 rounded-md object-cover"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute inset-0 w-full h-full bg-black/50 hover:bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => handlePlayTrack(track)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{track.title}</h4>
                              {track.isVerified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                            <p className="text-xs text-muted-foreground">{track.album}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-sm font-medium">{track.duration}</p>
                            <p className="text-xs text-muted-foreground">{track.plays} plays</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {trendingPlaylists.map((playlist) => (
                        <Card key={playlist.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <img 
                              src={playlist.image} 
                              alt={playlist.name}
                              className="w-full h-32 object-cover rounded-md mb-3"
                            />
                            <h4 className="font-medium mb-1">{playlist.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">by {playlist.creator}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{playlist.tracks} tracks</span>
                              <span>{playlist.followers} followers</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
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

          {/* Music Player */}
          {currentTrack && (
            <div className="fixed bottom-0 left-80 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-t border-purple-200 dark:border-purple-800 p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={currentTrack.image} 
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{currentTrack.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentTrack.artist}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost">
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={togglePlayPause}>
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
                  <Button size="sm" variant="ghost">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Music;
