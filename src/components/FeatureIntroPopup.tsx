import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Trophy, 
  Calendar, 
  Heart, 
  Sparkles, 
  Clock, 
  Palette,
  Music,
  Camera,
  MessageSquare,
  X
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  benefits: string[];
  color: string;
}

const features: Feature[] = [
  {
    id: 'circles',
    title: 'Circles',
    description: 'Create private groups to share posts, calls, and moments with specific people. Perfect for family, close friends, or work teams.',
    icon: <Users className="w-8 h-8" />,
    route: '/circles',
    benefits: ['Private group sharing', 'Group video calls', 'Exclusive content'],
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'challenges',
    title: 'Social Challenges',
    description: 'Join exciting challenges or create your own! Compete with friends, track progress, and celebrate achievements together.',
    icon: <Trophy className="w-8 h-8" />,
    route: '/challenges',
    benefits: ['Fun competitions', 'Track your progress', 'Earn achievements'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'time-capsules',
    title: 'Time Capsules',
    description: 'Create posts that unlock in the future! Send messages to your future self or schedule surprises for friends.',
    icon: <Clock className="w-8 h-8" />,
    route: '/time-capsules',
    benefits: ['Future messages', 'Scheduled reveals', 'Memory preservation'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'mood-board',
    title: 'Mood Boards',
    description: 'Express yourself through visual inspiration! Create beautiful mood boards and share your vibe with friends.',
    icon: <Palette className="w-8 h-8" />,
    route: '/mood-board',
    benefits: ['Visual expression', 'Track your mood', 'Collaborative boards'],
    color: 'from-emerald-500 to-teal-500'
  },
  {
    id: 'milestones',
    title: 'Friendship Milestones',
    description: 'Celebrate special moments with friends! Track anniversaries, birthdays, and memorable events together.',
    icon: <Heart className="w-8 h-8" />,
    route: '/friendship-milestones',
    benefits: ['Never forget special dates', 'Celebrate together', 'Build memories'],
    color: 'from-rose-500 to-pink-500'
  },
  {
    id: 'events',
    title: 'Events',
    description: 'Plan and discover events! Create gatherings, track RSVPs, and never miss out on exciting happenings.',
    icon: <Calendar className="w-8 h-8" />,
    route: '/events',
    benefits: ['Easy event planning', 'RSVP tracking', 'Event discovery'],
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'reels',
    title: 'Reels',
    description: 'Share short, engaging videos! Showcase your creativity and discover entertaining content from others.',
    icon: <Camera className="w-8 h-8" />,
    route: '/reels',
    benefits: ['Short video format', 'Creative expression', 'Viral potential'],
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'music',
    title: 'Music Sharing',
    description: 'Discover and share music with your community! Upload tracks, create playlists, and vibe with friends.',
    icon: <Music className="w-8 h-8" />,
    route: '/music',
    benefits: ['Share your taste', 'Discover new music', 'Community playlists'],
    color: 'from-indigo-500 to-blue-500'
  }
];

const FeatureIntroPopup = () => {
  const [open, setOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState<Feature | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Only show popup if user is logged in
    if (user) {
      checkAndShowFeature();
    }
  }, [user]);

  const checkAndShowFeature = () => {
    const lastShownDate = localStorage.getItem('feature_intro_last_shown');
    const shownFeatures = JSON.parse(localStorage.getItem('feature_intro_shown') || '[]');
    const dismissed = localStorage.getItem('feature_intro_dismissed_today');
    
    const today = new Date().toDateString();
    
    // Don't show if already dismissed today
    if (dismissed === today) return;
    
    // Show if never shown or if it's a new day
    if (!lastShownDate || lastShownDate !== today) {
      // Get features that haven't been shown recently
      const availableFeatures = features.filter(f => !shownFeatures.includes(f.id));
      
      // If all features have been shown, reset the list
      const featuresToShow = availableFeatures.length > 0 ? availableFeatures : features;
      
      // Pick a random feature
      const randomFeature = featuresToShow[Math.floor(Math.random() * featuresToShow.length)];
      
      setCurrentFeature(randomFeature);
      setOpen(true);
      
      // Update storage
      localStorage.setItem('feature_intro_last_shown', today);
      const updatedShown = availableFeatures.length > 0 
        ? [...shownFeatures, randomFeature.id]
        : [randomFeature.id];
      localStorage.setItem('feature_intro_shown', JSON.stringify(updatedShown));
    }
  };

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem('feature_intro_dismissed_today', today);
    setOpen(false);
  };

  const handleTryNow = () => {
    if (currentFeature) {
      navigate(currentFeature.route);
      setOpen(false);
    }
  };

  if (!currentFeature) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${currentFeature.color} text-white`}>
              {currentFeature.icon}
            </div>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Feature Spotlight
            </Badge>
          </div>
          <DialogTitle className="text-2xl">{currentFeature.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {currentFeature.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">What you can do:</h4>
            <ul className="space-y-2">
              {currentFeature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${currentFeature.color}`} />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex space-x-2 pt-2">
            <Button
              onClick={handleTryNow}
              className={`flex-1 bg-gradient-to-r ${currentFeature.color} text-white hover:opacity-90`}
            >
              Try It Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureIntroPopup;
