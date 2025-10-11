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
      
      // Handle connection issues - only show if connection exists
      if (connectionState === 'connecting' || iceConnectionState === 'checking') {
        return 'fair';
      }
      
      if (connectionState === 'disconnected' || iceConnectionState === 'disconnected') {
        return 'poor';
      }
      
      if (connectionState === 'failed' || iceConnectionState === 'failed') {
        return 'disconnected';
      }
      
      // Don't show anything if no connection (prevents blinking after call ends)
      return 'disconnected';
    };

    setQuality(determineQuality());
  }, [connectionState, iceConnectionState, networkQuality, bitrate, packetLoss]);
  
  // Don't render if quality is disconnected and no active connection
  if (quality === 'disconnected' && !connectionState) {
    return null;
  }

  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: CheckCircle,
          label: 'Excellent',
          color: 'bg-call-excellent/20 text-call-excellent border-call-excellent/40 shadow-lg shadow-call-excellent/10',
          iconColor: 'text-call-excellent',
          description: bitrate ? `${Math.round(bitrate / 1000)}kbps` : 'HD Quality'
        };
      case 'good':
        return {
          icon: Signal,
          label: 'Good',
          color: 'bg-call-good/20 text-call-good border-call-good/40 shadow-lg shadow-call-good/10',
          iconColor: 'text-call-good',
          description: bitrate ? `${Math.round(bitrate / 1000)}kbps` : 'Good Quality'
        };
      case 'fair':
        return {
          icon: Router,
          label: 'Fair',
          color: 'bg-call-fair/20 text-call-fair border-call-fair/40 shadow-lg shadow-call-fair/10',
          iconColor: 'text-call-fair',
          description: packetLoss ? `${packetLoss.toFixed(1)}% loss` : 'Connecting...'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          label: 'Poor',
          color: 'bg-call-poor/20 text-call-poor border-call-poor/40 shadow-lg shadow-call-poor/10',
          iconColor: 'text-call-poor',
          description: 'Network Issues'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'bg-call-disconnected/20 text-call-disconnected border-call-disconnected/40',
          iconColor: 'text-call-disconnected',
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