import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Users, 
  Heart, 
  MessageCircle,
  Share,
  Settings,
  Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface LiveStreamingDialogProps {
  onStreamStart?: (streamData: any) => void;
}

const LiveStreamingDialog = ({ onStreamStart }: LiveStreamingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [streamCategory, setStreamCategory] = useState('general');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [comments, setComments] = useState<Array<{id: string, user: string, message: string}>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const startPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setIsPreview(true);
      
      toast({
        title: "Preview started",
        description: "Your stream preview is now active"
      });
    } catch (error) {
      toast({
        title: "Preview failed",
        description: "Could not access camera/microphone",
        variant: "destructive"
      });
    }
  };

  const startStream = async () => {
    if (!streamTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your stream",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStreaming(true);
      
      // Simulate stream start - in real app, this would connect to streaming service
      if (onStreamStart) {
        onStreamStart({
          title: streamTitle,
          description: streamDescription,
          category: streamCategory,
          startTime: new Date().toISOString()
        });
      }
      
      // Simulate viewer count updates
      const viewerInterval = setInterval(() => {
        setViewerCount(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);

      toast({
        title: "🔴 Live streaming",
        description: "Your stream is now live!",
        duration: 3000
      });

      return () => clearInterval(viewerInterval);
    } catch (error) {
      setIsStreaming(false);
      toast({
        title: "Stream failed",
        description: "Could not start live stream",
        variant: "destructive"
      });
    }
  };

  const endStream = () => {
    setIsStreaming(false);
    setIsPreview(false);
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    toast({
      title: "Stream ended",
      description: "Your live stream has ended"
    });
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
        >
          <Radio className="w-4 h-4 mr-2" />
          Go Live
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500" />
            {isStreaming ? "🔴 Live Streaming" : "Start Live Stream"}
            {isStreaming && (
              <Badge variant="destructive" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4">
          {/* Main Stream Area */}
          <div className="flex-1 space-y-4">
            {/* Video Preview */}
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              
              {!isPreview && !isStreaming && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Click "Start Preview" to see your stream</p>
                  </div>
                </div>
              )}

              {/* Stream Controls Overlay */}
              {(isPreview || isStreaming) && (
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button
                    size="sm"
                    variant={isAudioEnabled ? "secondary" : "destructive"}
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant={isVideoEnabled ? "secondary" : "destructive"}
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {/* Live Indicator */}
              {isStreaming && (
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    🔴 LIVE
                  </div>
                  <div className="bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Users className="w-4 h-4 inline mr-1" />
                    {viewerCount}
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            {!isStreaming && (
              <div className="space-y-4">
                <Input
                  placeholder="Stream title..."
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
                
                <Textarea
                  placeholder="Stream description..."
                  value={streamDescription}
                  onChange={(e) => setStreamDescription(e.target.value)}
                  rows={3}
                />

                <select
                  value={streamCategory}
                  onChange={(e) => setStreamCategory(e.target.value)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="general">General</option>
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="art">Art & Creative</option>
                  <option value="tech">Technology</option>
                  <option value="education">Education</option>
                  <option value="cooking">Cooking</option>
                  <option value="fitness">Fitness</option>
                </select>
              </div>
            )}

            {/* Stream Controls */}
            <div className="flex gap-2">
              {!isStreaming && !isPreview && (
                <Button onClick={startPreview} variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Start Preview
                </Button>
              )}
              
              {isPreview && !isStreaming && (
                <Button onClick={startStream} className="bg-red-500 hover:bg-red-600">
                  <Radio className="w-4 h-4 mr-2" />
                  Go Live
                </Button>
              )}
              
              {isStreaming && (
                <Button onClick={endStream} variant="destructive">
                  End Stream
                </Button>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          {isStreaming && (
            <div className="w-80 border-l pl-4 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto mb-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {comment.user[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{comment.user}:</span>
                      <span className="ml-1">{comment.message}</span>
                    </div>
                  </div>
                ))}
                
                {comments.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Chat will appear here when viewers join
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Share className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveStreamingDialog;