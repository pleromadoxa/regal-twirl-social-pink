
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import { 
  Music, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Trash2,
  Edit,
  Plus,
  AudioWaveform,
  Headphones,
  Radio,
  Disc3
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
  genre: string;
  uploadedAt: string;
}

const Music = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newTrack, setNewTrack] = useState({
    title: '',
    artist: '',
    genre: '',
    file: null as File | null
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Mock admin check - replace with actual admin logic
  const isAdmin = user?.email === 'admin@example.com';

  useEffect(() => {
    // Mock tracks data
    setTracks([
      {
        id: '1',
        title: 'Amazing Grace',
        artist: 'Worship Team',
        duration: 240,
        url: '/path/to/amazing-grace.mp3',
        genre: 'Worship',
        uploadedAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'How Great Thou Art',
        artist: 'Church Choir',
        duration: 210,
        url: '/path/to/how-great.mp3',
        genre: 'Hymn',
        uploadedAt: '2024-01-14'
      }
    ]);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleTrackEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleTrackEnd);
    };
  }, [currentTrack]);

  const setupAudioContext = () => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      drawVisualizer();
    } catch (error) {
      console.error('Error setting up audio context:', error);
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.width / bufferLength * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(0.5, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
  };

  const playTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      togglePlayPause();
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setTimeout(() => {
        setupAudioContext();
      }, 100);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setNewTrack({ ...newTrack, file });
    } else {
      toast({
        title: "Invalid file",
        description: "Please select an audio file",
        variant: "destructive"
      });
    }
  };

  const uploadTrack = async () => {
    if (!newTrack.file || !newTrack.title || !newTrack.artist) {
      toast({
        title: "Missing information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would upload to your storage service
    const newId = Date.now().toString();
    const mockTrack: Track = {
      id: newId,
      title: newTrack.title,
      artist: newTrack.artist,
      genre: newTrack.genre,
      duration: 180, // Mock duration
      url: URL.createObjectURL(newTrack.file),
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    setTracks([mockTrack, ...tracks]);
    setNewTrack({ title: '', artist: '', genre: '', file: null });
    setShowUploadForm(false);

    toast({
      title: "Track uploaded",
      description: "Your track has been uploaded successfully"
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 pl-80 flex items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="p-8">
              <Music className="w-16 h-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access the music management page.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 pl-80">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Headphones className="w-8 h-8 text-purple-600" />
                Music Management
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Upload and manage music for the community
              </p>
            </div>
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
            >
              <Plus className="w-4 h-4" />
              Upload Track
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio Visualizer */}
          {currentTrack && (
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Disc3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{currentTrack.title}</h3>
                    <p className="text-white/80">{currentTrack.artist}</p>
                    <Badge variant="secondary" className="mt-1">
                      {currentTrack.genre}
                    </Badge>
                  </div>
                </div>

                {/* Audio Visualizer Canvas */}
                <div className="bg-black/20 rounded-lg p-4 mb-4">
                  <canvas 
                    ref={canvasRef}
                    width={800}
                    height={200}
                    className="w-full h-32 rounded"
                  />
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 w-12 h-12 rounded-full"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </Button>
                    
                    <div className="flex-1 space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-white/80">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Form */}
          {showUploadForm && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New Track
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newTrack.title}
                      onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                      placeholder="Enter track title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="artist">Artist *</Label>
                    <Input
                      id="artist"
                      value={newTrack.artist}
                      onChange={(e) => setNewTrack({ ...newTrack, artist: e.target.value })}
                      placeholder="Enter artist name"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={newTrack.genre}
                    onChange={(e) => setNewTrack({ ...newTrack, genre: e.target.value })}
                    placeholder="Enter genre"
                  />
                </div>

                <div>
                  <Label htmlFor="file">Audio File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={uploadTrack}>
                    Upload Track
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Track List */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5" />
                Music Library ({tracks.length} tracks)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer ${
                        currentTrack?.id === track.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
                          : 'hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                      }`}
                      onClick={() => playTrack(track)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>

                      <div className="flex-1">
                        <h4 className="font-medium">{track.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{track.artist}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">
                            {track.genre}
                          </Badge>
                          <span>•</span>
                          <span>{formatTime(track.duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <AudioWaveform className="w-4 h-4 text-muted-foreground" />
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default Music;
