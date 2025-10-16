import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Lock, MessageSquare, Phone, Image as ImageIcon, Calendar, Shield, BarChart3, FileText, Megaphone } from 'lucide-react';
import Feature3DVisual from '@/components/Feature3DVisual';
import { motion } from 'framer-motion';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

interface CircleFeaturePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCircle: () => void;
}

const CircleFeaturePopup = ({ open, onOpenChange, onCreateCircle }: CircleFeaturePopupProps) => {
  const features: Feature[] = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Private & Secure',
      description: 'Create invite-only circles with end-to-end privacy',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Circle Feed',
      description: 'Share posts, updates, and moments exclusively with members',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Group Calls',
      description: 'Start video or audio calls with your entire circle',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Events Calendar',
      description: 'Create and manage events with RSVP tracking',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Polls & Voting',
      description: 'Make group decisions with interactive polls',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'File Sharing',
      description: 'Share documents, images, and files securely',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: 'Announcements',
      description: 'Pin important updates for all members to see',
      color: 'from-cyan-500 to-blue-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Admin Controls',
      description: 'Manage permissions and member roles with ease',
      color: 'from-indigo-500 to-violet-500'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 bg-gradient-to-br from-card via-card/98 to-card/95">
        <DialogHeader>
          <DialogTitle className="text-3xl flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to Circles
            </span>
          </DialogTitle>
          <p className="text-muted-foreground text-lg">
            Create meaningful connections with your closest friends and family
          </p>
        </DialogHeader>

        {/* 3D Hero Section with Feature3DVisual */}
        <motion.div 
          className="relative h-64 rounded-xl overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Feature3DVisual 
            featureId="circles" 
            color="from-primary via-secondary to-accent"
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-background/80 via-background/20 to-transparent">
            <motion.div 
              className="text-center space-y-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Private Community
              </h3>
              <p className="text-muted-foreground">Connect, share, and grow together</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group p-4 rounded-lg border-2 border-border hover:border-primary/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.03, y: -5 }}
            >
              {/* Hover Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="flex items-start gap-3 relative z-10">
                <motion.div 
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-md`}
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-lg bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to get started?</h3>
            <p className="text-sm text-muted-foreground">
              Create your first circle and start connecting with your loved ones
            </p>
          </div>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl hover:shadow-2xl transition-all"
            onClick={() => {
              onOpenChange(false);
              onCreateCircle();
            }}
          >
            <Users className="w-5 h-5 mr-2" />
            Create Circle
          </Button>
        </div>

        {/* Benefits Badges */}
        <div className="flex flex-wrap gap-2 justify-center mt-6">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Lock className="w-3 h-3 mr-1" />
            100% Private
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Shield className="w-3 h-3 mr-1" />
            Secure
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Users className="w-3 h-3 mr-1" />
            Unlimited Members
          </Badge>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            Free Forever
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CircleFeaturePopup;
