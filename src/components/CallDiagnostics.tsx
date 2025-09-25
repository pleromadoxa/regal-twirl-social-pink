import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Wifi, 
  Signal, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface CallDiagnosticsProps {
  callState?: {
    status: 'idle' | 'connecting' | 'connected' | 'ended' | 'failed';
    duration: number;
    connectionState: RTCPeerConnectionState | null;
    iceConnectionState: RTCIceConnectionState | null;
    error: string | null;
  };
  onRefresh?: () => void;
}

export const CallDiagnostics = ({ callState, onRefresh }: CallDiagnosticsProps) => {
  const [networkQuality, setNetworkQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    // Simulate network quality check
    const testConnection = async () => {
      try {
        const start = Date.now();
        await fetch('/api/ping').catch(() => {});
        const end = Date.now();
        const ping = end - start;
        
        setLatency(ping);
        
        if (ping < 100) {
          setNetworkQuality('good');
        } else if (ping < 300) {
          setNetworkQuality('fair');
        } else {
          setNetworkQuality('poor');
        }
      } catch {
        setNetworkQuality('poor');
      }
    };

    const interval = setInterval(testConnection, 5000);
    testConnection();

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'text-success';
      case 'connecting':
      case 'checking':
        return 'text-warning';
      case 'failed':
      case 'disconnected':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'connecting':
      case 'checking':
        return <Activity className="w-4 h-4 text-warning animate-pulse" />;
      case 'failed':
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5" />
          Call Diagnostics
        </CardTitle>
        <CardDescription>
          Real-time connection status and quality metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Call Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Call Status</span>
            <Badge variant={callState?.status === 'connected' ? 'default' : 'secondary'}>
              {callState?.status || 'idle'}
            </Badge>
          </div>

          {callState?.duration && callState.duration > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration
              </span>
              <span className="text-sm font-mono">
                {formatDuration(callState.duration)}
              </span>
            </div>
          )}
        </div>

        {/* Connection Details */}
        <div className="space-y-3 border-t pt-3">
          <h4 className="text-sm font-medium">Connection Details</h4>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(callState?.connectionState || undefined)}
                <span className="text-xs text-muted-foreground">Peer</span>
              </div>
              <div className={`text-xs ${getStatusColor(callState?.connectionState || undefined)}`}>
                {callState?.connectionState || 'Not connected'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(callState?.iceConnectionState || undefined)}
                <span className="text-xs text-muted-foreground">ICE</span>
              </div>
              <div className={`text-xs ${getStatusColor(callState?.iceConnectionState || undefined)}`}>
                {callState?.iceConnectionState || 'Not connected'}
              </div>
            </div>
          </div>
        </div>

        {/* Network Quality */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              Network Quality
            </span>
            <Badge variant={
              networkQuality === 'good' ? 'default' : 
              networkQuality === 'fair' ? 'secondary' : 'destructive'
            }>
              {networkQuality}
            </Badge>
          </div>

          {latency !== null && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Signal className="w-3 h-3" />
                Latency
              </span>
              <span className="text-sm font-mono">
                {latency}ms
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {callState?.error && (
          <div className="border-t pt-3">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div className="space-y-1">
                  <div className="text-sm font-medium text-destructive">
                    Connection Error
                  </div>
                  <div className="text-xs text-destructive/80">
                    {callState.error}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Diagnostics
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CallDiagnostics;