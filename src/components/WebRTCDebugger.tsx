import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkWebRTCSupport, checkSecureContext } from '@/services/callService';

interface WebRTCDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const WebRTCDebugger: React.FC<WebRTCDebuggerProps> = ({ isOpen, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsLoading(true);
    const info: any = {};

    try {
      // Check WebRTC support
      const webrtcSupport = checkWebRTCSupport();
      info.webrtcSupport = webrtcSupport;

      // Check secure context
      info.secureContext = checkSecureContext();

      // Check Supabase connection
      try {
        const { data, error } = await supabase.from('profiles').select('id').limit(1);
        info.supabaseConnection = !error;
        info.supabaseError = error?.message;
      } catch (err) {
        info.supabaseConnection = false;
        info.supabaseError = (err as Error).message;
      }

      // Test media devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        info.mediaDevices = {
          audio: devices.filter(d => d.kind === 'audioinput').length,
          video: devices.filter(d => d.kind === 'videoinput').length,
        };
      } catch (err) {
        info.mediaDevices = { error: (err as Error).message };
      }

      // Test getUserMedia
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        info.getUserMedia = { success: true };
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        info.getUserMedia = { success: false, error: (err as Error).message };
      }

      // Test signaling with improved approach
      try {
        const testChannel = supabase.channel('webrtc-signaling-test', {
          config: {
            broadcast: { self: true }
          }
        });
        
        let signalReceived = false;
        let subscriptionStatus = 'PENDING';
        let testError = null;
        
        const testPromise = new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => {
            console.log('Signaling test timeout after 8 seconds');
            resolve(false);
          }, 8000);

          // Listen for our own broadcast (self: true allows this)
          testChannel.on('broadcast', { event: 'signaling-test' }, (payload) => {
            console.log('Signaling test signal received:', payload);
            if (payload.payload?.testId) {
              signalReceived = true;
              clearTimeout(timeout);
              resolve(true);
            }
          });

          testChannel.subscribe(async (status, err) => {
            console.log('Signaling test channel status:', status, err);
            subscriptionStatus = status;
            
            if (err) {
              testError = err.message;
              clearTimeout(timeout);
              resolve(false);
              return;
            }
            
            if (status === 'SUBSCRIBED') {
              console.log('Signaling test channel subscribed, sending test signal...');
              // Wait a bit for channel to be fully ready
              setTimeout(() => {
                const testId = Math.random().toString(36).substr(2, 9);
                console.log('Sending signaling test with ID:', testId);
                
                testChannel.send({
                  type: 'broadcast',
                  event: 'signaling-test',
                  payload: { 
                    testId, 
                    timestamp: Date.now(),
                    message: 'WebRTC signaling test'
                  }
                });
              }, 1000);
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              testError = `Channel status: ${status}`;
              clearTimeout(timeout);
              resolve(false);
            }
          });
        });

        const success = await testPromise;
        
        info.signaling = { 
          success, 
          subscriptionStatus,
          error: testError,
          details: success 
            ? 'Signaling working - WebRTC calls should function properly' 
            : testError 
              ? `Failed: ${testError}` 
              : 'Test signal was not received within timeout period'
        };
        
        // Clean up
        try {
          supabase.removeChannel(testChannel);
        } catch (cleanupErr) {
          console.log('Channel cleanup error (non-critical):', cleanupErr);
        }
        
      } catch (err) {
        console.error('Signaling test exception:', err);
        info.signaling = { 
          success: false, 
          error: (err as Error).message,
          details: 'Exception occurred during signaling test - this indicates a serious connectivity issue'
        };
      }

      setDebugInfo(info);
    } catch (error) {
      toast({
        title: "Diagnostics Failed",
        description: (error as Error).message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            WebRTC Diagnostics
            <Button variant="outline" onClick={onClose}>Close</Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Running diagnostics...</p>
          ) : (
            <>
              <div>
                <h3 className="font-semibold mb-2">WebRTC Support</h3>
                <Badge variant={debugInfo.webrtcSupport?.supported ? "default" : "destructive"}>
                  {debugInfo.webrtcSupport?.supported ? "Supported" : "Not Supported"}
                </Badge>
                {debugInfo.webrtcSupport?.missing?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-red-600">Missing: {debugInfo.webrtcSupport.missing.join(', ')}</p>
                  </div>
                )}
                {debugInfo.webrtcSupport?.warnings?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-yellow-600">Warnings: {debugInfo.webrtcSupport.warnings.join(', ')}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Secure Context</h3>
                <Badge variant={debugInfo.secureContext ? "default" : "destructive"}>
                  {debugInfo.secureContext ? "Secure" : "Not Secure"}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Supabase Connection</h3>
                <Badge variant={debugInfo.supabaseConnection ? "default" : "destructive"}>
                  {debugInfo.supabaseConnection ? "Connected" : "Failed"}
                </Badge>
                {debugInfo.supabaseError && (
                  <p className="text-sm text-red-600 mt-1">{debugInfo.supabaseError}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Media Devices</h3>
                {debugInfo.mediaDevices?.error ? (
                  <Badge variant="destructive">Error: {debugInfo.mediaDevices.error}</Badge>
                ) : (
                  <div className="space-x-2">
                    <Badge>Audio: {debugInfo.mediaDevices?.audio || 0}</Badge>
                    <Badge>Video: {debugInfo.mediaDevices?.video || 0}</Badge>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Media Access</h3>
                <Badge variant={debugInfo.getUserMedia?.success ? "default" : "destructive"}>
                  {debugInfo.getUserMedia?.success ? "Available" : "Failed"}
                </Badge>
                {debugInfo.getUserMedia?.error && (
                  <p className="text-sm text-red-600 mt-1">{debugInfo.getUserMedia.error}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Signaling</h3>
                <Badge variant={debugInfo.signaling?.success ? "default" : "destructive"}>
                  {debugInfo.signaling?.success ? "Working" : "Failed"}
                </Badge>
                {debugInfo.signaling?.details && (
                  <p className="text-sm text-gray-600 mt-1">{debugInfo.signaling.details}</p>
                )}
                {debugInfo.signaling?.subscriptionStatus && (
                  <p className="text-sm text-blue-600 mt-1">Status: {debugInfo.signaling.subscriptionStatus}</p>
                )}
                {debugInfo.signaling?.error && (
                  <p className="text-sm text-red-600 mt-1">{debugInfo.signaling.error}</p>
                )}
              </div>

              <Button onClick={runDiagnostics} disabled={isLoading} className="w-full">
                Run Diagnostics Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WebRTCDebugger;