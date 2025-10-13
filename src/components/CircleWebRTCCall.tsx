import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, PhoneOff, Mic, MicOff, Signal } from 'lucide-react';
import { useCircleWebRTCCall } from '@/hooks/useCircleWebRTCCall';
import { useNavigate } from 'react-router-dom';

interface CircleWebRTCCallProps {
  circleId: string;
  circleName: string;
}

const CircleWebRTCCall = ({ circleId, circleName }: CircleWebRTCCallProps) => {
  const navigate = useNavigate();
  const { isInCall, localStream, peers, connectionStates, startCall, endCall } = useCircleWebRTCCall(circleId);
  const audioElementsRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Auto-start call when component mounts
  useEffect(() => {
    if (!isInCall) {
      startCall();
    }
  }, []);

  // Set up audio elements for remote streams
  useEffect(() => {
    peers.forEach(peer => {
      if (peer.stream && !audioElementsRef.current.has(peer.peerId)) {
        const audioElement = new Audio();
        audioElement.srcObject = peer.stream;
        audioElement.autoplay = true;
        audioElement.volume = 1.0;
        audioElementsRef.current.set(peer.peerId, audioElement);
        
        console.log(`[Call UI] Set up audio for peer ${peer.peerId}`);
      }
    });

    // Clean up audio elements for disconnected peers
    audioElementsRef.current.forEach((audio, peerId) => {
      if (!peers.find(p => p.peerId === peerId)) {
        audio.pause();
        audio.srcObject = null;
        audioElementsRef.current.delete(peerId);
        console.log(`[Call UI] Cleaned up audio for peer ${peerId}`);
      }
    });
  }, [peers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioElementsRef.current.forEach((audio) => {
        audio.pause();
        audio.srcObject = null;
      });
      audioElementsRef.current.clear();
    };
  }, []);

  const handleEndCall = () => {
    endCall();
    navigate(-1); // Go back to previous page
  };

  const getConnectionStateColor = (state?: RTCPeerConnectionState) => {
    switch (state) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'failed':
      case 'disconnected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getConnectionStateLabel = (state?: RTCPeerConnectionState) => {
    switch (state) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'new':
        return 'Initializing...';
      case 'failed':
        return 'Failed';
      case 'disconnected':
        return 'Disconnected';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Call Header */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-6 h-6 text-primary animate-pulse" />
                <div>
                  <h2 className="text-2xl font-bold">{circleName}</h2>
                  <p className="text-sm text-muted-foreground">Circle Audio Call</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-lg">
                {peers.length + 1} participant{peers.length !== 0 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-4">
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Signal className="w-4 h-4 mr-2" />
                {localStream ? 'Mic Active' : 'Mic Inactive'}
              </Badge>
              <Badge variant="outline">
                WebRTC Connection
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Participants Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Local User */}
              <div className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Avatar className="w-20 h-20 ring-4 ring-primary/30">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                    You
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold">You</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    <Mic className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                </div>
              </div>

              {/* Remote Peers */}
              {peers.map((peer) => {
                const connectionState = connectionStates.get(peer.peerId);
                return (
                  <div 
                    key={peer.peerId} 
                    className="flex flex-col items-center space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <Avatar className="w-20 h-20 ring-4 ring-muted">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl">
                        {peer.peerId.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center w-full">
                      <p className="font-semibold truncate">Peer {peer.peerId.substring(0, 8)}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${getConnectionStateColor(connectionState)}`}
                      >
                        <Signal className="w-3 h-3 mr-1" />
                        {getConnectionStateLabel(connectionState)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {peers.length === 0 && isInCall && (
              <div className="text-center py-12 text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Waiting for others to join...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call Controls */}
        <Card className="border-2 border-destructive/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-center space-x-4">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full w-16 h-16"
                disabled
              >
                <MicOff className="w-6 h-6" />
              </Button>
              
              <Button
                size="lg"
                variant="destructive"
                className="rounded-full w-20 h-20"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Click the red button to end the call
            </p>
          </CardContent>
        </Card>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Debug Info</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>Local Stream: {localStream ? '✓ Active' : '✗ Inactive'}</p>
              <p>Peers Connected: {peers.length}</p>
              <div className="space-y-1">
                {peers.map(peer => (
                  <p key={peer.peerId}>
                    Peer {peer.peerId.substring(0, 8)}: {connectionStates.get(peer.peerId) || 'unknown'}
                    {peer.stream ? ' (has stream)' : ' (no stream)'}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CircleWebRTCCall;
