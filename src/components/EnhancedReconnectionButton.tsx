import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedReconnectionButtonProps {
  onReconnect: () => void;
  isReconnecting?: boolean;
  className?: string;
}

export const EnhancedReconnectionButton = ({
  onReconnect,
  isReconnecting = false,
  className = ''
}: EnhancedReconnectionButtonProps) => {
  const { toast } = useToast();
  const [isPressed, setIsPressed] = useState(false);

  const handleReconnect = () => {
    if (isReconnecting) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    
    toast({
      title: "Reconnecting...",
      description: "Attempting to restore call connection",
    });
    
    onReconnect();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReconnect}
      disabled={isReconnecting}
      className={`
        relative overflow-hidden rounded-full px-4 py-2 
        transition-all duration-300 hover:scale-105 
        ${isPressed ? 'scale-95' : ''} 
        ${isReconnecting ? 'animate-pulse' : ''}
        bg-gradient-to-r from-orange-500/20 to-red-500/20 
        border border-orange-500/30 
        hover:border-orange-400/50 
        shadow-lg shadow-orange-500/20
        ${className}
      `}
    >
      <div className="flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${isReconnecting ? 'animate-spin' : ''}`} />
        <span className="text-sm font-medium">
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </span>
        <Wifi className="w-3 h-3 opacity-60" />
      </div>
      
      {/* Animated background for reconnection state */}
      {isReconnecting && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse" />
      )}
    </Button>
  );
};