import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Signal, Router } from 'lucide-react';

interface CallQualityIndicatorProps {
  connectionState?: RTCPeerConnectionState | null;
  iceConnectionState?: RTCIceConnectionState | null;
  networkQuality?: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  bitrate?: number;
  packetLoss?: number;
  className?: string;
}

export const CallQualityIndicator = ({
  connectionState,
  iceConnectionState,
  networkQuality,
  bitrate,
  packetLoss,
  className = ''
}: CallQualityIndicatorProps) => {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'disconnected'>('disconnected');

  useEffect(() => {
    const determineQuality = () => {
      // Use network quality if provided (from network monitoring)
      if (networkQuality) {
        return networkQuality;
      }

      // Enhanced quality determination based on multiple factors
      const isConnected = connectionState === 'connected' && 
        (iceConnectionState === 'connected' || iceConnectionState === 'completed');
      
      if (isConnected) {
        // Consider packet loss and bitrate if available
        if (packetLoss !== undefined && bitrate !== undefined) {
          if (packetLoss < 1 && bitrate > 100000) return 'excellent';
          if (packetLoss < 3 && bitrate > 50000) return 'good';
          if (packetLoss < 5 && bitrate > 25000) return 'fair';
          return 'poor';
        }
        
        // Base quality on connection state only
        if (iceConnectionState === 'completed') return 'excellent';
        if (iceConnectionState === 'connected') return 'good';
        return 'fair';
      }
      
      // Handle connection issues
      if (connectionState === 'connecting' || iceConnectionState === 'checking') {
        return 'fair';
      }
      
      if (connectionState === 'disconnected' || iceConnectionState === 'disconnected') {
        return 'poor';
      }
      
      if (connectionState === 'failed' || iceConnectionState === 'failed') {
        return 'disconnected';
      }
      
      return 'fair';
    };

    setQuality(determineQuality());
  }, [connectionState, iceConnectionState, networkQuality, bitrate, packetLoss]);

  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: CheckCircle,
          label: 'Excellent',
          color: 'bg-success/20 text-success border-success/30',
          iconColor: 'text-success',
          description: bitrate ? `${Math.round(bitrate / 1000)}kbps` : 'HD Quality'
        };
      case 'good':
        return {
          icon: Signal,
          label: 'Good',
          color: 'bg-primary/20 text-primary border-primary/30',
          iconColor: 'text-primary',
          description: bitrate ? `${Math.round(bitrate / 1000)}kbps` : 'Good Quality'
        };
      case 'fair':
        return {
          icon: Router,
          label: 'Fair',
          color: 'bg-warning/20 text-warning border-warning/30',
          iconColor: 'text-warning',
          description: packetLoss ? `${packetLoss.toFixed(1)}% loss` : 'Connecting...'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          label: 'Poor',
          color: 'bg-destructive/20 text-destructive border-destructive/30',
          iconColor: 'text-destructive',
          description: 'Network Issues'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'bg-muted/20 text-muted-foreground border-muted/30',
          iconColor: 'text-muted-foreground',
          description: 'Connection Lost'
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${config.color} border backdrop-blur-sm transition-all duration-300`}
      >
        <Icon className={`w-3 h-3 mr-1.5 ${config.iconColor}`} />
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>
      {config.description && (
        <span className="text-xs text-muted-foreground">
          {config.description}
        </span>
      )}
    </div>
  );
};