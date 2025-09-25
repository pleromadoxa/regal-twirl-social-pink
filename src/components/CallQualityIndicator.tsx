import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface CallQualityIndicatorProps {
  connectionState?: RTCPeerConnectionState | null;
  iceConnectionState?: RTCIceConnectionState | null;
  className?: string;
}

export const CallQualityIndicator = ({
  connectionState,
  iceConnectionState,
  className = ''
}: CallQualityIndicatorProps) => {
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor' | 'disconnected'>('disconnected');

  useEffect(() => {
    const determineQuality = () => {
      if (connectionState === 'connected' && iceConnectionState === 'connected') {
        return 'excellent';
      } else if (connectionState === 'connected' && iceConnectionState === 'completed') {
        return 'excellent';
      } else if (connectionState === 'connecting' || iceConnectionState === 'checking') {
        return 'fair';
      } else if (connectionState === 'disconnected' || iceConnectionState === 'disconnected') {
        return 'poor';
      } else if (connectionState === 'failed' || iceConnectionState === 'failed') {
        return 'disconnected';
      } else {
        return 'fair';
      }
    };

    setQuality(determineQuality());
  }, [connectionState, iceConnectionState]);

  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: CheckCircle,
          label: 'Excellent',
          color: 'bg-green-500/20 text-green-400 border-green-400/30',
          iconColor: 'text-green-400'
        };
      case 'good':
        return {
          icon: Wifi,
          label: 'Good',
          color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
          iconColor: 'text-blue-400'
        };
      case 'fair':
        return {
          icon: AlertTriangle,
          label: 'Fair',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
          iconColor: 'text-yellow-400'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          label: 'Poor',
          color: 'bg-orange-500/20 text-orange-400 border-orange-400/30',
          iconColor: 'text-orange-400'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'bg-red-500/20 text-red-400 border-red-400/30',
          iconColor: 'text-red-400'
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} border backdrop-blur-sm transition-all duration-300 ${className}`}
    >
      <Icon className={`w-3 h-3 mr-1.5 ${config.iconColor}`} />
      <span className="text-xs font-medium">{config.label}</span>
    </Badge>
  );
};