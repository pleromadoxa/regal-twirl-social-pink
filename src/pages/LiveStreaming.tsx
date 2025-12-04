import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLiveStreaming, LiveStream } from '@/hooks/useLiveStreaming';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import TopNavigation from '@/components/TopNavigation';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Radio, 
  Play, 
  Users, 
  Eye,
  Video,
  StopCircle,
  Wifi
} from 'lucide-react';

const LiveStreaming = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { liveStreams, myStream, loading, startStream, endStream } = useLiveStreaming();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');

  const handleStartStream = async () => {
    if (!streamTitle) return;
    await startStream(streamTitle, streamDescription);
    setStreamTitle('');
    setStreamDescription('');
    setDialogOpen(false);
  };

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
    <div className="min-h-screen bg-background">
      {!isMobile && <SidebarNav />}
      <TopNavigation />
      
      <main className={`${isMobile ? 'pt-16 pb-20' : 'ml-80 pt-4'} px-4`}>
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
                onClick={endStream}
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
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start Live Stream</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
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
                    <Button onClick={handleStartStream} className="w-full bg-red-600 hover:bg-red-700">
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
                    <Button variant="destructive" size="sm" onClick={endStream}>
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
