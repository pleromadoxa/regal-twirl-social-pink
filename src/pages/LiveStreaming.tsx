import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLiveStreaming, LiveStream } from '@/hooks/useLiveStreaming';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { 
  Radio, 
  Play, 
  Users, 
  Eye,
  Video,
  StopCircle,
  Wifi,
  Camera,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  RefreshCw
} from 'lucide-react';

interface MediaDevice {
  deviceId: string;
  label: string;
}

const LiveStreaming = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { liveStreams, myStream, loading, startStream, endStream } = useLiveStreaming();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Device selection
  const [videoDevices, setVideoDevices] = useState<MediaDevice[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDevice[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch available devices
  const fetchDevices = async () => {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
        });

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
      toast.error('Failed to access camera/microphone. Please check permissions.');
    }
  };

  // Start preview with selected devices
  const startPreview = async () => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: selectedVideoDevice 
          ? { deviceId: { exact: selectedVideoDevice } }
          : true,
        audio: selectedAudioDevice 
          ? { deviceId: { exact: selectedAudioDevice } }
          : true
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsPreviewActive(true);
      toast.success('Preview started!');
    } catch (error) {
      console.error('Error starting preview:', error);
      toast.error('Failed to start camera preview. Please check your permissions.');
    }
  };

  // Stop preview
  const stopPreview = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsPreviewActive(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Handle start stream
  const handleStartStream = async () => {
    if (!streamTitle) {
      toast.error('Please enter a stream title');
      return;
    }
    
    if (!isPreviewActive) {
      toast.error('Please start the preview first');
      return;
    }
    
    await startStream(streamTitle, streamDescription);
    setStreamTitle('');
    setStreamDescription('');
    setDialogOpen(false);
  };

  // Handle end stream
  const handleEndStream = async () => {
    stopPreview();
    await endStream();
  };

  // Fetch devices when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchDevices();
    } else {
      stopPreview();
    }
  }, [dialogOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
      <div className="relative">
        {stream.thumbnail_url ? (
          <img 
            src={stream.thumbnail_url} 
            alt={stream.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
            <Video className="w-16 h-16 text-white/50" />
          </div>
        )}
        
        <Badge className="absolute top-3 left-3 bg-red-600 text-white">
          <Radio className="w-3 h-3 mr-1 animate-pulse" />
          LIVE
        </Badge>
        
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {stream.viewer_count}
        </div>
        
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="secondary" size="lg">
            <Play className="w-5 h-5 mr-2" />
            Watch Stream
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-2 mb-2">{stream.title}</h3>
        
        {stream.streamer && (
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={stream.streamer.avatar_url} />
              <AvatarFallback>{stream.streamer.display_name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{stream.streamer.display_name}</p>
              <p className="text-xs text-muted-foreground">@{stream.streamer.username}</p>
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Radio className="w-8 h-8 text-red-500" />
                Live Streams
              </h1>
              <p className="text-muted-foreground">Watch and broadcast live content</p>
            </div>
            
            {myStream ? (
              <Button 
                variant="destructive" 
                onClick={handleEndStream}
                className="flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                End Stream
              </Button>
            ) : (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-red-500 to-pink-600">
                    <Radio className="w-4 h-4 mr-2" />
                    Go Live
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Start Live Stream</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                      />
                      {(!isPreviewActive || isVideoOff) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                          <div className="text-center text-white">
                            <VideoOff className="w-16 h-16 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-70">
                              {!isPreviewActive ? 'Click "Start Preview" to see your camera' : 'Camera is off'}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Preview Controls Overlay */}
                      {isPreviewActive && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant={isMuted ? 'destructive' : 'secondary'}
                            onClick={toggleMute}
                          >
                            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant={isVideoOff ? 'destructive' : 'secondary'}
                            onClick={toggleVideo}
                          >
                            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Device Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4" />
                          Camera
                        </Label>
                        <Select 
                          value={selectedVideoDevice} 
                          onValueChange={(value) => {
                            setSelectedVideoDevice(value);
                            if (isPreviewActive) startPreview();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select camera" />
                          </SelectTrigger>
                          <SelectContent>
                            {videoDevices.map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Mic className="w-4 h-4" />
                          Microphone
                        </Label>
                        <Select 
                          value={selectedAudioDevice} 
                          onValueChange={(value) => {
                            setSelectedAudioDevice(value);
                            if (isPreviewActive) startPreview();
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select microphone" />
                          </SelectTrigger>
                          <SelectContent>
                            {audioDevices.map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Refresh Devices Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchDevices}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Devices
                    </Button>

                    {/* Preview Button */}
                    {!isPreviewActive ? (
                      <Button onClick={startPreview} variant="outline" className="w-full">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Preview
                      </Button>
                    ) : (
                      <Button onClick={stopPreview} variant="outline" className="w-full">
                        <StopCircle className="w-4 h-4 mr-2" />
                        Stop Preview
                      </Button>
                    )}

                    {/* Stream Details */}
                    <div>
                      <Label>Stream Title *</Label>
                      <Input
                        value={streamTitle}
                        onChange={(e) => setStreamTitle(e.target.value)}
                        placeholder="What's your stream about?"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={streamDescription}
                        onChange={(e) => setStreamDescription(e.target.value)}
                        placeholder="Tell viewers what to expect..."
                      />
                    </div>
                    
                    <Button 
                      onClick={handleStartStream} 
                      className="w-full bg-red-600 hover:bg-red-700"
                      disabled={!isPreviewActive || !streamTitle}
                    >
                      <Radio className="w-4 h-4 mr-2" />
                      Start Broadcasting
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Current Stream Banner */}
          {myStream && (
            <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <div>
                      <h3 className="font-semibold">You are live!</h3>
                      <p className="text-sm text-muted-foreground">{myStream.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      {myStream.viewer_count} viewers
                    </div>
                    <Button variant="destructive" size="sm" onClick={handleEndStream}>
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
              <Wifi className="w-5 h-5 text-red-500" />
              Live Now
            </h2>
            
            {loading ? (
              <div className="text-center py-12">Loading streams...</div>
            ) : liveStreams.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No live streams</h3>
                  <p className="text-muted-foreground mb-4">Be the first to go live!</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Radio className="w-4 h-4 mr-2" />
                    Start Streaming
                  </Button>
                </CardContent>
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
      </main>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default LiveStreaming;
