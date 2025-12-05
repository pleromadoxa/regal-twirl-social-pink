import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLiveStreaming, LiveStream } from '@/hooks/useLiveStreaming';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { 
  Radio, Play, Users, Eye, Video, StopCircle, Wifi, Camera, Mic, MicOff, 
  VideoOff, Settings, RefreshCw, Volume2, VolumeX, Maximize2, Minimize2,
  MessageCircle, Heart, Share2, Gift, Send, Clock, Signal, Zap, TrendingUp,
  Monitor, Smartphone, ScreenShare, ScreenShareOff, PhoneOff, Settings2,
  Sparkles, Crown, Star, ChevronRight, MoreVertical, Copy, ExternalLink
} from 'lucide-react';

interface MediaDevice {
  deviceId: string;
  label: string;
}

interface StreamStats {
  bitrate: number;
  fps: number;
  resolution: string;
  packetsLost: number;
  latency: number;
}

const LiveStreaming = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { liveStreams, myStream, loading, startStream, endStream, updateViewerCount } = useLiveStreaming();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingStream, setViewingStream] = useState<LiveStream | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; message: string; timestamp: Date }>>([]);
  
  // Device & Quality settings
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [videoQuality, setVideoQuality] = useState<'720p' | '1080p' | '480p'>('720p');
  const [audioGain, setAudioGain] = useState([100]);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  
  // Stream stats
  const [streamStats, setStreamStats] = useState<StreamStats>({
    bitrate: 0, fps: 0, resolution: '0x0', packetsLost: 0, latency: 0
  });
  const [streamDuration, setStreamDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewerVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const qualitySettings = {
    '480p': { width: 854, height: 480, frameRate: 30 },
    '720p': { width: 1280, height: 720, frameRate: 30 },
    '1080p': { width: 1920, height: 1080, frameRate: 30 }
  };

  // Fetch available devices
  const fetchDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => stream.getTracks().forEach(track => track.stop()));

      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoInputs = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`
        }));
      
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`
        }));

      setVideoDevices(videoInputs);
      setAudioDevices(audioInputs);
      
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Failed to access camera/microphone');
    }
  };

  // Start preview with WebRTC quality settings
  const startPreview = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const quality = qualitySettings[videoQuality];
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: quality.width },
          height: { ideal: quality.height },
          frameRate: { ideal: quality.frameRate }
        },
        audio: {
          deviceId: selectedAudioDevice ? { exact: selectedAudioDevice } : undefined,
          echoCancellation,
          noiseSuppression,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsPreviewActive(true);
      updateStreamStats(stream);
      toast.success('Preview started!');
    } catch (error) {
      console.error('Error starting preview:', error);
      toast.error('Failed to start camera preview');
    }
  };

  // Update stream statistics
  const updateStreamStats = (stream: MediaStream) => {
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      setStreamStats(prev => ({
        ...prev,
        resolution: `${settings.width || 0}x${settings.height || 0}`,
        fps: settings.frameRate || 0
      }));
    }
  };

  // Stop preview
  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewActive(false);
    setIsScreenSharing(false);
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        if (streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
        setIsScreenSharing(false);
        toast.success('Screen sharing stopped');
      } else {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: true
        });
        screenStreamRef.current = screenStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          if (streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
          }
        };
        
        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast.error('Failed to share screen');
    }
  };

  // Toggle mute/video
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => { track.enabled = isMuted; });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => { track.enabled = isVideoOff; });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Handle stream start
  const handleStartStream = async () => {
    if (!streamTitle) {
      toast.error('Please enter a stream title');
      return;
    }
    if (!isPreviewActive) {
      toast.error('Please start the preview first');
      return;
    }
    
    const result = await startStream(streamTitle, streamDescription);
    if (result) {
      setStreamTitle('');
      setStreamDescription('');
      setDialogOpen(false);
      durationIntervalRef.current = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
      toast.success('You are now live!');
    }
  };

  // Handle stream end
  const handleEndStream = async () => {
    stopPreview();
    await endStream();
    setStreamDuration(0);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Send chat message
  const sendChatMessage = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { user: profile?.display_name || 'You', message: chatMessage, timestamp: new Date() }]);
    setChatMessage('');
  };

  // Effects
  useEffect(() => {
    if (dialogOpen) fetchDevices();
    else stopPreview();
  }, [dialogOpen]);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (screenStreamRef.current) screenStreamRef.current.getTracks().forEach(track => track.stop());
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, []);

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <Card 
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50"
      onClick={() => setViewingStream(stream)}
    >
      <div className="relative">
        {stream.thumbnail_url ? (
          <img src={stream.thumbnail_url} alt={stream.title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
            <Video className="w-20 h-20 text-white/30" />
          </div>
        )}
        
        <Badge className="absolute top-3 left-3 bg-red-600 text-white animate-pulse">
          <Radio className="w-3 h-3 mr-1" />
          LIVE
        </Badge>
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
            <Eye className="w-4 h-4" />
            {stream.viewer_count.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            Live
          </div>
        </div>
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="lg" className="bg-red-600 hover:bg-red-700">
            <Play className="w-5 h-5 mr-2" />
            Watch Now
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-red-500 transition-colors">
          {stream.title}
        </h3>
        
        {stream.streamer && (
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 ring-2 ring-red-500 ring-offset-2 ring-offset-background">
              <AvatarImage src={stream.streamer.avatar_url} />
              <AvatarFallback>{stream.streamer.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium flex items-center gap-1">
                {stream.streamer.display_name}
                <Crown className="w-4 h-4 text-amber-500" />
              </p>
              <p className="text-sm text-muted-foreground">@{stream.streamer.username}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      
      <main className={`flex-1 ${isMobile ? 'px-4 pb-20' : 'ml-80'} p-4 lg:p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center animate-pulse">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                Live Streams
              </h1>
              <p className="text-muted-foreground mt-1">Watch and broadcast live to your community</p>
            </div>
            
            {myStream ? (
              <Button variant="destructive" size="lg" onClick={handleEndStream}>
                <StopCircle className="w-5 h-5 mr-2" />
                End Stream
              </Button>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90">
                    <Radio className="w-5 h-5 mr-2" />
                    Go Live
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-red-500" />
                      Start Live Stream
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Preview Section */}
                    <div className="space-y-4">
                      <div className="relative bg-black rounded-xl overflow-hidden aspect-video">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                        />
                        {(!isPreviewActive || isVideoOff) && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                            <VideoOff className="w-16 h-16 text-white/30 mb-2" />
                            <p className="text-white/50 text-sm">
                              {!isPreviewActive ? 'Start preview to see camera' : 'Camera is off'}
                            </p>
                          </div>
                        )}
                        
                        {isPreviewActive && (
                          <>
                            {/* Stats Overlay */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between">
                              <Badge variant="secondary" className="bg-black/50">
                                {streamStats.resolution} @ {Math.round(streamStats.fps)}fps
                              </Badge>
                              {isScreenSharing && (
                                <Badge className="bg-blue-600">
                                  <Monitor className="w-3 h-3 mr-1" />
                                  Screen
                                </Badge>
                              )}
                            </div>
                            
                            {/* Controls */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/70 rounded-full px-4 py-2">
                              <Button size="icon" variant={isMuted ? 'destructive' : 'ghost'} className="h-10 w-10 rounded-full" onClick={toggleMute}>
                                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-white" />}
                              </Button>
                              <Button size="icon" variant={isVideoOff ? 'destructive' : 'ghost'} className="h-10 w-10 rounded-full" onClick={toggleVideo}>
                                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5 text-white" />}
                              </Button>
                              <Button size="icon" variant={isScreenSharing ? 'default' : 'ghost'} className="h-10 w-10 rounded-full" onClick={toggleScreenShare}>
                                {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5 text-white" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full" onClick={() => setSettingsOpen(true)}>
                                <Settings2 className="w-5 h-5 text-white" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Device Selection */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs flex items-center gap-1 mb-1">
                            <Camera className="w-3 h-3" /> Camera
                          </Label>
                          <Select value={selectedVideoDevice} onValueChange={setSelectedVideoDevice}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {videoDevices.map(d => (
                                <SelectItem key={d.deviceId} value={d.deviceId}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs flex items-center gap-1 mb-1">
                            <Mic className="w-3 h-3" /> Microphone
                          </Label>
                          <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {audioDevices.map(d => (
                                <SelectItem key={d.deviceId} value={d.deviceId}>{d.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {/* Quality Selection */}
                      <div>
                        <Label className="text-xs mb-1 block">Quality</Label>
                        <div className="flex gap-2">
                          {(['480p', '720p', '1080p'] as const).map(q => (
                            <Button
                              key={q}
                              size="sm"
                              variant={videoQuality === q ? 'default' : 'outline'}
                              onClick={() => setVideoQuality(q)}
                              className="flex-1"
                            >
                              {q}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      {!isPreviewActive ? (
                        <Button onClick={startPreview} className="w-full" size="lg">
                          <Camera className="w-5 h-5 mr-2" />
                          Start Preview
                        </Button>
                      ) : (
                        <Button onClick={stopPreview} variant="outline" className="w-full" size="lg">
                          <StopCircle className="w-5 h-5 mr-2" />
                          Stop Preview
                        </Button>
                      )}
                    </div>
                    
                    {/* Stream Details */}
                    <div className="space-y-4">
                      <div>
                        <Label>Stream Title *</Label>
                        <Input
                          value={streamTitle}
                          onChange={(e) => setStreamTitle(e.target.value)}
                          placeholder="What's your stream about?"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={streamDescription}
                          onChange={(e) => setStreamDescription(e.target.value)}
                          placeholder="Tell viewers what to expect..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Audio Settings */}
                      <Card className="p-4 space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Audio Settings
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Noise Suppression</Label>
                            <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label className="text-sm">Echo Cancellation</Label>
                            <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} />
                          </div>
                          <div>
                            <Label className="text-sm">Microphone Volume</Label>
                            <Slider value={audioGain} onValueChange={setAudioGain} max={150} step={1} className="mt-2" />
                          </div>
                        </div>
                      </Card>
                      
                      <Button 
                        onClick={handleStartStream} 
                        className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90"
                        size="lg"
                        disabled={!isPreviewActive || !streamTitle}
                      >
                        <Radio className="w-5 h-5 mr-2" />
                        Start Broadcasting
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStreams.length}</p>
                  <p className="text-xs text-muted-foreground">Live Now</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStreams.reduce((a, s) => a + s.viewer_count, 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Viewers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveStreams.length > 0 ? Math.max(...liveStreams.map(s => s.viewer_count)).toLocaleString() : 0}</p>
                  <p className="text-xs text-muted-foreground">Peak Viewers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Signal className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Good</p>
                  <p className="text-xs text-muted-foreground">Connection</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Stream Banner */}
          {myStream && (
            <Card className="bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10 border-red-500/30 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50" />
                    <div>
                      <h3 className="text-xl font-bold">You are live!</h3>
                      <p className="text-muted-foreground">{myStream.title}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2">
                      <Eye className="w-4 h-4 text-red-500" />
                      <span className="font-semibold">{myStream.viewer_count.toLocaleString()}</span>
                      <span className="text-muted-foreground text-sm">viewers</span>
                    </div>
                    <div className="flex items-center gap-2 bg-background/50 rounded-full px-4 py-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="font-mono font-semibold">{formatDuration(streamDuration)}</span>
                    </div>
                    <Button variant="destructive" onClick={handleEndStream}>
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Stream
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Streams Grid */}
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              Live Now
            </h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-8 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : liveStreams.length === 0 ? (
              <Card className="p-12 text-center">
                <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No live streams</h3>
                <p className="text-muted-foreground mb-4">Be the first to go live!</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-gradient-to-r from-red-500 to-pink-600">
                  <Radio className="w-4 h-4 mr-2" />
                  Start Streaming
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveStreams.map(stream => (
                  <StreamCard key={stream.id} stream={stream} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stream Viewer Dialog */}
        <Dialog open={!!viewingStream} onOpenChange={() => setViewingStream(null)}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden">
            {viewingStream && (
              <div className="flex flex-col md:flex-row h-[80vh]">
                {/* Video Section */}
                <div className="flex-1 bg-black relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-24 h-24 text-white/20" />
                  </div>
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge className="bg-red-600 animate-pulse">
                      <Radio className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50">
                      <Eye className="w-3 h-3 mr-1" />
                      {viewingStream.viewer_count}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-red-500">
                          <AvatarImage src={viewingStream.streamer?.avatar_url} />
                          <AvatarFallback>{viewingStream.streamer?.display_name?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-semibold">{viewingStream.streamer?.display_name}</p>
                          <p className="text-white/70 text-sm">{viewingStream.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Heart className="w-5 h-5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-white hover:bg-white/20">
                          <Share2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chat Section */}
                <div className="w-full md:w-80 flex flex-col border-l border-border">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Live Chat
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-semibold text-primary text-sm">{msg.user}:</span>
                          <span className="text-sm">{msg.message}</span>
                        </div>
                      ))}
                      {chatMessages.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-8">No messages yet. Say hello!</p>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-border">
                    <div className="flex gap-2">
                      <Input 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Send a message..."
                        onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                      />
                      <Button size="icon" onClick={sendChatMessage}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default LiveStreaming;