
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { 
  Music2, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  SkipBack, 
  SkipForward,
  Heart,
  Share2,
  Download,
  List,
  Grid3x3,
  Filter
} from 'lucide-react';

// Audio Visualizer Component
const AudioVisualizer = ({ isPlaying }: { isPlaying: boolean }) => {
  return (
    <div className="flex items-center justify-center space-x-1 h-20">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={`bg-gradient-to-t from-purple-500 to-pink-500 rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            width: '4px',
            height: isPlaying ? `${Math.random() * 60 + 20}px` : '20px',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

const MusicPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [uploadedTracks, setUploadedTracks] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Mock data for demonstration
  const mockTracks = [
    {
      id: 1,
      title: "Blessed Assurance",
      artist: "Worship Team",
      duration: "4:32",
      genre: "Christian",
      plays: 1250,
      likes: 89
    },
    {
      id: 2,
      title: "Amazing Grace",
      artist: "Gospel Choir",
      duration: "3:45",
      genre: "Gospel",
      plays: 2100,
      likes: 156
    },
    {
      id: 3,
      title: "How Great Thou Art",
      artist: "Community Singers",
      duration: "5:12",
      genre: "Hymn",
      plays: 890,
      likes: 67
    }
  ];

  const [musicLibrary, setMusicLibrary] = useState(mockTracks);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    artist: '',
    genre: '',
    description: '',
    file: null as File | null
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.artist) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const newTrack = {
      id: Date.now(),
      title: uploadForm.title,
      artist: uploadForm.artist,
      genre: uploadForm.genre || 'Unknown',
      duration: '0:00',
      plays: 0,
      likes: 0
    };

    setMusicLibrary(prev => [newTrack, ...prev]);
    setUploadForm({
      title: '',
      artist: '',
      genre: '',
      description: '',
      file: null
    });

    toast({
      title: "Track Uploaded!",
      description: `${uploadForm.title} has been added to the library`
    });
  };

  const togglePlay = (track?: any) => {
    if (track && track !== currentTrack) {
      setCurrentTrack(track);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const formatGenre = (genre: string) => {
    const colors = {
      'Christian': 'bg-blue-100 text-blue-800',
      'Gospel': 'bg-purple-100 text-purple-800',
      'Hymn': 'bg-green-100 text-green-800',
      'Worship': 'bg-yellow-100 text-yellow-800',
      'Unknown': 'bg-gray-100 text-gray-800'
    };
    return colors[genre as keyof typeof colors] || colors.Unknown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Music2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Music Studio
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">
                    Upload and manage your music collection
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Audio Player & Visualizer */}
            {currentTrack && (
              <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Music2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {currentTrack.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {currentTrack.artist}
                      </p>
                    </div>

                    <div className="flex-1">
                      <AudioVisualizer isPlaying={isPlaying} />
                    </div>

                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon">
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => togglePlay()}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <SkipForward className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Volume2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-purple-600" />
                  Upload New Track
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter track title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={uploadForm.artist}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, artist: e.target.value }))}
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={uploadForm.genre}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, genre: e.target.value }))}
                    placeholder="e.g., Christian, Gospel, Worship"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Audio File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                </div>

                <Button 
                  onClick={handleUpload}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>
              </CardContent>
            </Card>

            {/* Music Library */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <Music2 className="w-6 h-6 text-purple-600" />
                    Music Library ({musicLibrary.length} tracks)
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {musicLibrary.map((track) => (
                        <Card key={track.id} className="group hover:shadow-lg transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Music2 className="w-8 h-8 text-white" />
                            </div>
                            <h4 className="font-semibold text-sm mb-1 truncate">{track.title}</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">{track.artist}</p>
                            <Badge className={`text-xs mb-2 ${formatGenre(track.genre)}`}>
                              {track.genre}
                            </Badge>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{track.duration}</span>
                              <div className="flex items-center gap-2">
                                <span>{track.plays} plays</span>
                                <Heart className="w-3 h-3" />
                                <span>{track.likes}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-3">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => togglePlay(track)}
                                className="flex-1"
                              >
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
                                )}
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Heart className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {musicLibrary.map((track) => (
                        <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePlay(track)}
                            className="flex-shrink-0"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{track.artist}</p>
                          </div>
                          <Badge className={`text-xs ${formatGenre(track.genre)}`}>
                            {track.genre}
                          </Badge>
                          <div className="text-xs text-slate-500 w-16 text-center">{track.duration}</div>
                          <div className="text-xs text-slate-500 w-20 text-center">{track.plays} plays</div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost">
                              <Heart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default MusicPage;
