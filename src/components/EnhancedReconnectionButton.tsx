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
        relative overflow-hidden rounded-full px-5 py-2.5 
        transition-all duration-300 hover:scale-105 active:scale-95
        ${isPressed ? 'scale-95' : ''} 
        ${isReconnecting ? 'animate-pulse' : ''}
        bg-gradient-to-r from-warning/20 to-call-poor/20 
        border-2 border-warning/40
        hover:border-warning/60 hover:shadow-warning/30
        shadow-xl shadow-warning/20
        backdrop-blur-md
        ${className}
      `}
    >
      <div className="flex items-center gap-2 relative z-10">
        <RefreshCw className={`w-4 h-4 text-warning ${isReconnecting ? 'animate-spin' : ''}`} />
        <span className="text-sm font-semibold text-warning-foreground">
          {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
        </span>
        <Wifi className={`w-4 h-4 ${isReconnecting ? 'text-warning animate-pulse' : 'text-warning/60'}`} />
      </div>
      
      {/* Animated background for reconnection state */}
      {isReconnecting && (
        <div className="absolute inset-0 bg-gradient-to-r from-warning/20 to-call-poor/20 animate-pulse" />
      )}
    </Button>
  );
};