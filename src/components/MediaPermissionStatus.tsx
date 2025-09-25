import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Camera, CameraOff, AlertTriangle } from 'lucide-react';
import { mediaPermissionManager } from '@/utils/mediaPermissionManager';
import { useToast } from '@/hooks/use-toast';

interface MediaPermissionStatusProps {
  onPermissionsGranted?: (stream: MediaStream) => void;
  requireVideo?: boolean;
}

export const MediaPermissionStatus: React.FC<MediaPermissionStatusProps> = ({ 
  onPermissionsGranted, 
  requireVideo = false 
}) => {
  const [micPermission, setMicPermission] = useState<PermissionState>('prompt');
  const [cameraPermission, setCameraPermission] = useState<PermissionState>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const micState = mediaPermissionManager.getPermissionState('microphone') || 'prompt';
      const cameraState = mediaPermissionManager.getPermissionState('camera') || 'prompt';
      
      setMicPermission(micState);
      setCameraPermission(cameraState);
    } catch (error) {
      console.warn('[MediaPermissionStatus] Could not check permissions:', error);
    }
  };

  const requestPermissions = async () => {
    if (isRequesting) return;

    setIsRequesting(true);
    setError(null);

    try {
      const constraints = {
        audio: true,
        video: requireVideo
      };

      console.log('[MediaPermissionStatus] Requesting permissions:', constraints);
      
      const stream = await mediaPermissionManager.requestMediaPermissions(constraints);
      
      // Update permission states
      setMicPermission('granted');
      if (requireVideo) {
        setCameraPermission('granted');
      }

      toast({
        title: "Permissions Granted",
        description: `${requireVideo ? 'Camera and microphone' : 'Microphone'} access granted successfully.`,
      });

      if (onPermissionsGranted) {
        onPermissionsGranted(stream);
      }

    } catch (error) {
      console.error('[MediaPermissionStatus] Permission request failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to get media permissions';
      setError(errorMessage);
      
      // Update permission states based on error
      if (errorMessage.includes('denied')) {
        setMicPermission('denied');
        if (requireVideo) {
          setCameraPermission('denied');
        }
      }

      toast({
        title: "Permission Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getPermissionIcon(micPermission, 'mic')}
          <span className="text-sm">Microphone: {getPermissionText(micPermission)}</span>
        </div>
        
        {requireVideo && (
          <div className="flex items-center gap-2">
            {getPermissionIcon(cameraPermission, 'camera')}
            <span className="text-sm">Camera: {getPermissionText(cameraPermission)}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(micPermission !== 'granted' || (requireVideo && cameraPermission !== 'granted')) && (
        <Button 
          onClick={requestPermissions}
          disabled={isRequesting}
          className="w-full"
        >
          {isRequesting ? 'Requesting...' : 'Grant Permissions'}
        </Button>
      )}

      {micPermission === 'denied' || (requireVideo && cameraPermission === 'denied') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Permissions were denied. Please click the permission icon in your browser's address bar 
            and allow access, then refresh the page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};