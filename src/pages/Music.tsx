
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Music as MusicIcon, Play, Pause, Search, Heart, Share, Download, Upload } from 'lucide-react';
import { useState } from 'react';

const Music = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);

  const featuredTracks = [
    {
      id: '1',
      title: 'Amazing Grace',
      artist: 'Worship Team',
      album: 'Sunday Service Vol. 1',
      duration: '4:32',
      genre: 'Gospel',
      image: '/lovable-uploads/music-placeholder.png'
    },
    {
      id: '2',
      title: 'How Great Thou Art',
      artist: 'Community Choir',
      album: 'Classic Hymns',
      duration: '5:18',
      genre: 'Hymn',
      image: '/lovable-uploads/music-placeholder.png'
    },
    {
      id: '3',
      title: 'Blessed Be Your Name',
      artist: 'Contemporary Worship',
      album: 'Modern Praise',
      duration: '4:45',
      genre: 'Contemporary',
      image: '/lovable-uploads/music-placeholder.png'
    }
  ];

  const handlePlayPause = (trackId: string) => {
    if (currentTrack === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentTrack(trackId);
      setIsPlaying(true);
    }
  };

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
                  {featuredTracks.map((track) => (
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
                              onClick={() => handlePlayPause(track.id)}
                            >
                              {currentTrack === track.id && isPlaying ? (
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
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              {track.album}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {track.genre}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {track.duration}
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
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="genres" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['Gospel', 'Hymns', 'Contemporary', 'Praise & Worship', 'Christian Rock', 'Instrumental'].map((genre) => (
                    <Card key={genre} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MusicIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{genre}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {Math.floor(Math.random() * 50) + 10} tracks
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
