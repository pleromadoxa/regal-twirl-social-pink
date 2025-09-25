import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Camera, CameraOff, Phone, PhoneOff, AlertTriangle } from 'lucide-react';
import { mediaPermissionManager } from '@/utils/mediaPermissionManager';
import { useToast } from '@/hooks/use-toast';

interface CallWithPermissionsProps {
  callType: 'audio' | 'video';
  otherUserName?: string;
  onCallStart?: (stream: MediaStream) => void;
  onCallEnd?: () => void;
}

export const CallWithPermissions: React.FC<CallWithPermissionsProps> = ({ 
  callType, 
  otherUserName = 'Unknown User',
  onCallStart,
  onCallEnd 
}) => {
  const [permissionState, setPermissionState] = useState<{
    mic: PermissionState;
    camera?: PermissionState;
  }>({ mic: 'prompt', camera: callType === 'video' ? 'prompt' : undefined });
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check current permissions on mount
    checkPermissions();
    
    // Cleanup on unmount
    return () => {
      if (currentStream) {
        mediaPermissionManager.cleanupStream(currentStream);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      const micState = mediaPermissionManager.getPermissionState('microphone') || 'prompt';
      const cameraState = callType === 'video' 
        ? (mediaPermissionManager.getPermissionState('camera') || 'prompt')
        : undefined;
      
      setPermissionState({ mic: micState, camera: cameraState });
      console.log('[CallWithPermissions] Current permissions - Mic:', micState, 'Camera:', cameraState);
    } catch (error) {
      console.warn('[CallWithPermissions] Could not check permissions:', error);
    }
  };

  const requestPermissions = async () => {
    if (isRequestingPermissions) {
      console.log('[CallWithPermissions] Permission request already in progress');
      return;
    }

    setIsRequestingPermissions(true);
    setError(null);

    try {
      const constraints = {
        audio: true,
        video: callType === 'video'
      };

      console.log('[CallWithPermissions] Requesting permissions for:', callType, 'call');
      
      const stream = await mediaPermissionManager.requestMediaPermissions(constraints);
      setCurrentStream(stream);
      
      // Update permission states
      setPermissionState({
        mic: 'granted',
        camera: callType === 'video' ? 'granted' : undefined
      });

      toast({
        title: "Permissions Granted",
        description: `${callType === 'video' ? 'Camera and microphone' : 'Microphone'} access granted.`,
      });

      return stream;

    } catch (error) {
      console.error('[CallWithPermissions] Permission request failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to get media permissions';
      setError(errorMessage);
      
      // Update permission states based on error
      if (errorMessage.includes('denied') || errorMessage.includes('Permission denied')) {
        setPermissionState({
          mic: 'denied',
          camera: callType === 'video' ? 'denied' : undefined
        });
      }

      toast({
        title: "Permission Error",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const startCall = async () => {
    try {
      let stream = currentStream;
      
      // Request permissions if not already granted
      if (!stream || permissionState.mic !== 'granted') {
        stream = await requestPermissions();
      }

      if (stream) {
        setIsInCall(true);
        if (onCallStart) {
          onCallStart(stream);
        }
        
        toast({
          title: "Call Started",
          description: `${callType === 'video' ? 'Video' : 'Audio'} call with ${otherUserName} started.`,
        });
      }
    } catch (error) {
      console.error('[CallWithPermissions] Failed to start call:', error);
    }
  };

  const endCall = () => {
    if (currentStream) {
      mediaPermissionManager.cleanupStream(currentStream);
      setCurrentStream(null);
    }
    
    setIsInCall(false);
    
    if (onCallEnd) {
      onCallEnd();
    }
    
    toast({
      title: "Call Ended",
      description: "Call has been ended successfully.",
    });
  };

  const getPermissionIcon = (permission: PermissionState, type: 'mic' | 'camera') => {
    const icons = {
      mic: { granted: Mic, denied: MicOff, prompt: Mic },
      camera: { granted: Camera, denied: CameraOff, prompt: Camera }
    };
    
    const Icon = icons[type][permission] || icons[type].prompt;
    const colorClass = permission === 'granted' ? 'text-green-500' : 
                      permission === 'denied' ? 'text-red-500' : 'text-gray-500';
    
    return <Icon className={`h-5 w-5 ${colorClass}`} />;
  };

  const getPermissionText = (permission: PermissionState) => {
    switch (permission) {
      case 'granted': return 'Granted';
      case 'denied': return 'Denied';
      case 'prompt': return 'Not requested';
      default: return 'Unknown';
    }
  };

  const canStartCall = permissionState.mic === 'granted' && 
                      (callType === 'audio' || permissionState.camera === 'granted');

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {isInCall ? `${callType === 'video' ? 'Video' : 'Audio'} Call` : `Start ${callType === 'video' ? 'Video' : 'Audio'} Call`}
        </CardTitle>
        {!isInCall && (
          <p className="text-center text-muted-foreground">
            with {otherUserName}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Permission Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPermissionIcon(permissionState.mic, 'mic')}
              <span className="text-sm">Microphone</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {getPermissionText(permissionState.mic)}
            </span>
          </div>
          
          {callType === 'video' && permissionState.camera && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getPermissionIcon(permissionState.camera, 'camera')}
                <span className="text-sm">Camera</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {getPermissionText(permissionState.camera)}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission Denied Help */}
        {(permissionState.mic === 'denied' || permissionState.camera === 'denied') && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Permissions were denied. Please click the permission icon in your browser's address bar 
              and allow access, then refresh the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isInCall ? (
            <>
              {!canStartCall && (
                <Button 
                  onClick={requestPermissions}
                  disabled={isRequestingPermissions}
                  variant="outline"
                  className="flex-1"
                >
                  {isRequestingPermissions ? 'Requesting...' : 'Grant Permissions'}
                </Button>
              )}
              
              <Button 
                onClick={startCall}
                disabled={!canStartCall || isRequestingPermissions}
                className="flex-1"
              >
                <Phone className="h-4 w-4 mr-2" />
                Start Call
              </Button>
            </>
          ) : (
            <Button 
              onClick={endCall}
              variant="destructive"
              className="w-full"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Call
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};