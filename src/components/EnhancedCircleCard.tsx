import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Lock, Globe, MessageSquare, SettingsIcon, Trash, Sparkles } from 'lucide-react';
import { Circle, CircleMember } from '@/hooks/useCircles';
import { motion } from 'framer-motion';

interface EnhancedCircleCardProps {
  circle: Circle;
  members: CircleMember[];
  onView: () => void;
  onSettings: () => void;
  onDelete: () => void;
  CircleCallButton: React.ComponentType<{ circleId: string; circleName: string }>;
}

const EnhancedCircleCard = ({ 
  circle, 
  members, 
  onView, 
  onSettings, 
  onDelete,
  CircleCallButton 
}: EnhancedCircleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <Card 
        className="group relative transition-all hover:shadow-2xl duration-300 cursor-pointer bg-gradient-to-br from-card via-card/98 to-card/95 border-2 hover:border-primary/50 shadow-lg overflow-hidden" 
        onClick={onView}
      >
      {/* Animated Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 3D Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div 
          className="absolute top-4 left-4 w-20 h-20 rounded-full blur-2xl animate-float" 
          style={{ 
            backgroundColor: circle.color,
            animationDelay: '0s',
            animationDuration: '6s'
          }} 
        />
        <div 
          className="absolute bottom-4 right-4 w-16 h-16 rounded-full blur-xl animate-float" 
          style={{ 
            backgroundColor: circle.color,
            animationDelay: '2s',
            animationDuration: '8s'
          }} 
        />
      </div>
      
      <CardHeader className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Glow Effect */}
              <div 
                className="absolute inset-0 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity animate-pulse" 
                style={{ backgroundColor: circle.color }} 
              />
              <Avatar className="w-14 h-14 relative border-2 border-background shadow-lg ring-2 ring-offset-2 ring-transparent group-hover:ring-primary/30 transition-all">
                <AvatarImage src={circle.avatar_url} />
                <AvatarFallback 
                  className="text-white font-bold relative"
                  style={{ backgroundColor: circle.color }}
                >
                  <Users className="w-7 h-7" />
                  {circle.is_private && (
                    <div className="absolute -top-1 -right-1 bg-slate-900 rounded-full p-1 shadow-lg">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {circle.name}
                </CardTitle>
                {circle.is_private ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Globe className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              {circle.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {circle.description}
                </p>
              )}
              <Badge 
                variant="outline" 
                className="font-medium" 
                style={{ borderColor: circle.color, color: circle.color }}
              >
                {circle.category}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              onClick={onSettings}
            >
              <SettingsIcon className="w-4 h-4" />
            </Button>
            {circle.member_count > 0 && (
              <CircleCallButton 
                circleId={circle.id} 
                circleName={circle.name}
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={onDelete}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-center justify-between">
          {/* Enhanced Member Avatars */}
          <div className="flex items-center">
            {members.length > 0 && (
              <div className="flex -space-x-3 mr-3">
                {members.slice(0, 4).map((member, index) => (
                  <Avatar 
                    key={member.id} 
                    className="w-9 h-9 border-2 border-background shadow-md hover:scale-110 hover:z-10 transition-transform"
                    style={{ zIndex: 5 - index }}
                  >
                    <AvatarImage src={member.profiles.avatar_url} />
                    <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary/20 to-secondary/20">
                      {member.profiles.display_name?.[0]?.toUpperCase() || 
                       member.profiles.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {members.length > 4 && (
                  <div className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium shadow-md">
                    +{members.length - 4}
                  </div>
                )}
              </div>
            )}
            
            <Badge variant="secondary" className="font-medium shadow-sm">
              <Users className="w-3 h-3 mr-1" />
              {circle.member_count} {circle.member_count !== 1 ? 'members' : 'member'}
            </Badge>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <MessageSquare className="w-3 h-3" />
            <span>Active</span>
          </div>
        </div>
      </CardContent>
      
      {/* Bottom Border Animation */}
      <div 
        className="absolute bottom-0 left-0 h-1 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ 
          background: `linear-gradient(90deg, transparent, ${circle.color}, transparent)`
        }}
      />
      
      {/* Sparkle Effect on Hover */}
      <motion.div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
        initial={{ scale: 0, rotate: 0 }}
        whileHover={{ scale: 1, rotate: 180 }}
        transition={{ duration: 0.4 }}
      >
        <Sparkles className="w-5 h-5 text-primary" />
      </motion.div>
    </Card>
    </motion.div>
  );
};

export default EnhancedCircleCard;
