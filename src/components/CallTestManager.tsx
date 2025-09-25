import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Mic,
  Video,
  Wifi,
  Server
} from 'lucide-react';
import { checkWebRTCSupport, checkSecureContext } from '@/services/callService';
import { getMobileBrowserInfo, getMobileOptimizedConstraints, requestMobileMediaPermissions } from '@/utils/mobileWebRTC';
import { WebRTCService } from '@/services/webrtcService';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

interface CallTestManagerProps {
  onTestComplete?: (success: boolean) => void;
}

export const CallTestManager = ({ onTestComplete }: CallTestManagerProps) => {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    const tests = [
      { name: 'Browser Support', test: testBrowserSupport },
      { name: 'Secure Context', test: testSecureContext },
      { name: 'Audio Permission', test: testAudioPermission },
      { name: 'Video Permission', test: testVideoPermission },
      { name: 'WebRTC Connection', test: testWebRTCConnection },
      { name: 'Supabase Connection', test: testSupabaseConnection },
      { name: 'Signaling Channel', test: testSignalingChannel }
    ];

    const results: TestResult[] = [];
    let allPassed = true;

    for (const { name, test } of tests) {
      const result: TestResult = {
        name,
        status: 'pending',
        message: 'Running...'
      };
      
      results.push(result);
      setTestResults([...results]);

      try {
        const testResult = await test();
        result.status = testResult.status;
        result.message = testResult.message;
        result.details = testResult.details;
        
        if (testResult.status === 'fail') {
          allPassed = false;
        }
      } catch (error) {
        result.status = 'fail';
        result.message = error instanceof Error ? error.message : 'Test failed';
        allPassed = false;
      }

      setTestResults([...results]);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsRunning(false);
    
    toast({
      title: allPassed ? "All Tests Passed!" : "Some Tests Failed",
      description: allPassed 
        ? "Your device is ready for video calls." 
        : "Check the test results for issues.",
      variant: allPassed ? "default" : "destructive"
    });

    onTestComplete?.(allPassed);
  };

  const testBrowserSupport = async (): Promise<Omit<TestResult, 'name'>> => {
    const { supported, missing, warnings } = checkWebRTCSupport();
    const browserInfo = getMobileBrowserInfo();
    
    if (!supported) {
      return {
        status: 'fail',
        message: 'WebRTC not supported',
        details: `Missing: ${missing.join(', ')}`
      };
    }
    
    if (warnings.length > 0) {
      return {
        status: 'warning',
        message: 'WebRTC supported with warnings',
        details: `Warnings: ${warnings.join(', ')}`
      };
    }
    
    return {
      status: 'pass',
      message: `WebRTC supported (${browserInfo.isMobile ? 'Mobile' : 'Desktop'})`,
      details: `Browser: ${browserInfo.isChrome ? 'Chrome' : browserInfo.isSafari ? 'Safari' : 'Other'} ${browserInfo.version}`
    };
  };

  const testSecureContext = async (): Promise<Omit<TestResult, 'name'>> => {
    const isSecure = checkSecureContext();
    
    return {
      status: isSecure ? 'pass' : 'fail',
      message: isSecure ? 'Secure context available' : 'Secure context required',
      details: isSecure ? 'HTTPS/localhost detected' : 'Please use HTTPS for production calls'
    };
  };

  const testAudioPermission = async (): Promise<Omit<TestResult, 'name'>> => {
    try {
      const browserInfo = getMobileBrowserInfo();
      const constraints = getMobileOptimizedConstraints('audio', browserInfo);
      
      const stream = await requestMobileMediaPermissions({ audio: constraints.audio });
      
      // Test audio tracks
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      
      return {
        status: 'pass',
        message: 'Audio permission granted',
        details: `Audio tracks: ${audioTracks.length}`
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Audio permission denied or unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testVideoPermission = async (): Promise<Omit<TestResult, 'name'>> => {
    try {
      const browserInfo = getMobileBrowserInfo();
      const constraints = getMobileOptimizedConstraints('video', browserInfo);
      
      const stream = await requestMobileMediaPermissions(constraints);
      
      // Test video tracks
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length === 0) {
        throw new Error('No video tracks available');
      }
      
      // Cleanup
      stream.getTracks().forEach(track => track.stop());
      
      return {
        status: 'pass',
        message: 'Video permission granted',
        details: `Video tracks: ${videoTracks.length}`
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Video permission denied or unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testWebRTCConnection = async (): Promise<Omit<TestResult, 'name'>> => {
    try {
      const webrtcService = new WebRTCService();
      
      return new Promise((resolve) => {
        let resolved = false;
        
        webrtcService.onConnectionStateChange((state) => {
          if (!resolved && state === 'connecting') {
            resolved = true;
            webrtcService.cleanup();
            resolve({
              status: 'pass',
              message: 'WebRTC connection initialized',
              details: 'Peer connection created successfully'
            });
          }
        });
        
        webrtcService.onError((error) => {
          if (!resolved) {
            resolved = true;
            webrtcService.cleanup();
            resolve({
              status: 'fail',
              message: 'WebRTC connection failed',
              details: error.message
            });
          }
        });
        
        try {
          webrtcService.initializePeerConnection();
          
          // Timeout after 5 seconds
          setTimeout(() => {
            if (!resolved) {
              resolved = true;
              webrtcService.cleanup();
              resolve({
                status: 'warning',
                message: 'WebRTC connection timeout',
                details: 'Connection took too long to establish'
              });
            }
          }, 5000);
        } catch (error) {
          if (!resolved) {
            resolved = true;
            resolve({
              status: 'fail',
              message: 'Failed to initialize WebRTC',
              details: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      });
    } catch (error) {
      return {
        status: 'fail',
        message: 'WebRTC test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testSupabaseConnection = async (): Promise<Omit<TestResult, 'name'>> => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        return {
          status: 'fail',
          message: 'Supabase connection failed',
          details: error.message
        };
      }
      
      return {
        status: 'pass',
        message: 'Supabase connected',
        details: 'Database connection verified'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: 'Supabase connection error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testSignalingChannel = async (): Promise<Omit<TestResult, 'name'>> => {
    try {
      return new Promise((resolve) => {
        let resolved = false;
        
        const testChannel = supabase.channel('test-signaling-channel')
          .on('broadcast', { event: 'test' }, () => {
            if (!resolved) {
              resolved = true;
              supabase.removeChannel(testChannel);
              resolve({
                status: 'pass',
                message: 'Signaling channel working',
                details: 'Real-time communication verified'
              });
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              // Send a test message
              testChannel.send({
                type: 'broadcast',
                event: 'test',
                payload: { test: true }
              });
            }
          });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            supabase.removeChannel(testChannel);
            resolve({
              status: 'fail',
              message: 'Signaling channel timeout',
              details: 'Real-time channel not responding'
            });
          }
        }, 5000);
      });
    } catch (error) {
      return {
        status: 'fail',
        message: 'Signaling test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="secondary" className="bg-success/20 text-success">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Warning</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="w-5 h-5" />
          Call Connection Test
        </CardTitle>
        <CardDescription>
          Test your device and connection for video calling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Start Connection Test
            </>
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {result.message}
                    </div>
                    {result.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.details}
                      </div>
                    )}
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CallTestManager;