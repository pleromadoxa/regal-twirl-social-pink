import React, { useState } from 'react';
import { useMoodBoard } from '@/hooks/useMoodBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Smile, Music, Activity, Sparkles, X, Heart, Brain, Zap, Sun, Moon, Coffee, Headphones, Cross, Users } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

const MoodBoard = () => {
  const { myMood, loading, setMood, clearMood } = useMoodBoard();
  const [open, setOpen] = useState(false);
  const [mood, setMoodValue] = useState('Happy');
  const [activity, setActivity] = useState('');
  const [musicTrack, setMusicTrack] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [customMessage, setCustomMessage] = useState('');
  const [colorTheme, setColorTheme] = useState('#6366f1');
  const isMobile = useIsMobile();

  const moods = [
    { emoji: '😊', label: 'Happy', icon: Heart },
    { emoji: '😎', label: 'Cool', icon: Sun },
    { emoji: '🤩', label: 'Excited', icon: Zap },
    { emoji: '😌', label: 'Peaceful', icon: Moon },
    { emoji: '🥳', label: 'Celebrating', icon: Sparkles },
    { emoji: '💪', label: 'Motivated', icon: Zap },
    { emoji: '🧘', label: 'Zen', icon: Brain },
    { emoji: '🎨', label: 'Creative', icon: Sparkles },
    { emoji: '📚', label: 'Focused', icon: Brain },
    { emoji: '☕', label: 'Chill', icon: Coffee },
    { emoji: '🎵', label: 'Vibing', icon: Headphones },
    { emoji: '💼', label: 'Working', icon: Activity },
    { emoji: '✝️', label: 'Soul Winning', icon: Cross },
    { emoji: '🙏', label: 'Worship', icon: Users }
  ];

  const colors = [
    { value: '#6366f1', name: 'Indigo' },
    { value: '#a855f7', name: 'Purple' },
    { value: '#ec4899', name: 'Pink' },
    { value: '#f43f5e', name: 'Rose' },
    { value: '#f97316', name: 'Orange' },
    { value: '#10b981', name: 'Emerald' },
    { value: '#3b82f6', name: 'Blue' },
    { value: '#14b8a6', name: 'Teal' }
  ];

  const handleSetMood = async () => {
    if (!mood.trim()) {
      return;
    }
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await setMood({
      mood: mood.trim(),
      activity: activity.trim() || null,
      music_track: musicTrack.trim() || null,
      emoji: emoji,
      custom_message: customMessage.trim() || null,
      color_theme: colorTheme,
      expires_at: expiresAt
    });
    
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary animate-pulse`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Mood Board</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <Smile className="w-4 h-4 mr-2" />
                    Set Mood
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-lg">Set Your Current Vibe</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="max-h-[60vh] pr-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Choose Your Mood</label>
                      <div className="grid grid-cols-4 gap-2">
                        {moods.map((m) => {
                          const IconComponent = m.icon;
                          return (
                            <button
                              key={m.label}
                              onClick={() => {
                                setEmoji(m.emoji);
                                setMoodValue(m.label);
                              }}
                              className={`group relative p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                                emoji === m.emoji 
                                  ? 'bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary shadow-lg' 
                                  : 'bg-gradient-to-br from-muted/50 to-muted/30 hover:from-accent/50 hover:to-accent/30'
                              }`}
                              title={m.label}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className="relative">
                                  <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-lg transition-opacity ${
                                    emoji === m.emoji ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                  }`} />
                                  <IconComponent className={`relative w-4 h-4 transition-colors ${
                                    emoji === m.emoji ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                                  }`} />
                                </div>
                                <span className="text-lg">{m.emoji}</span>
                                <span className="text-[10px] font-medium leading-tight text-center">{m.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        What are you up to?
                      </label>
                      <Input 
                        placeholder="e.g., Working out, Coding, Reading..." 
                        value={activity} 
                        onChange={(e) => setActivity(e.target.value)}
                        className="bg-gradient-to-r from-background to-muted/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        Listening to...
                      </label>
                      <Input 
                        placeholder="e.g., Chill Vibes, Lo-fi Hip Hop..." 
                        value={musicTrack} 
                        onChange={(e) => setMusicTrack(e.target.value)}
                        className="bg-gradient-to-r from-background to-muted/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Custom Message
                      </label>
                      <Textarea
                        placeholder="Share what's on your mind..."
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={3}
                        className="bg-gradient-to-r from-background to-muted/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Color Theme</label>
                      <div className="grid grid-cols-8 gap-1.5">
                        {colors.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setColorTheme(c.value)}
                            className={`relative p-3 rounded-md transition-all hover:scale-110 ${
                              colorTheme === c.value ? 'ring-2 ring-offset-1 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: c.value }}
                          >
                            {colorTheme === c.value && (
                              <div className="absolute inset-0 bg-white/20 rounded-md animate-pulse" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleSetMood} 
                      disabled={loading} 
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Setting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Set Mood
                        </>
                      )}
                    </Button>
                  </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your current vibe, activity, and music with friends. Moods expire after 24 hours.
            </p>
          </div>

          {/* Current Mood Display */}
          <div className="p-4">
            {myMood ? (
              <Card 
                className="relative transition-all hover:shadow-2xl duration-300 overflow-hidden border-2"
                style={{ 
                  background: `linear-gradient(135deg, ${myMood.color_theme}25, ${myMood.color_theme}10)`,
                  borderColor: myMood.color_theme
                }}
              >
                {/* Animated gradient orbs */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-30 animate-float"
                     style={{ background: myMood.color_theme }} />
                <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-20 animate-float"
                     style={{ background: myMood.color_theme, animationDelay: '1s' }} />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 blur-2xl animate-pulse" />
                        <span className="relative text-6xl drop-shadow-lg">{myMood.emoji}</span>
                      </div>
                      <div>
                        <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                          {myMood.mood}
                        </CardTitle>
                        {myMood.custom_message && (
                          <p className="text-muted-foreground mt-2 max-w-md">{myMood.custom_message}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearMood()}
                      disabled={loading}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  {myMood.activity && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                      <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <Activity className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{myMood.activity}</span>
                    </div>
                  )}
                  {myMood.music_track && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                      <div className="p-2 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20">
                        <Music className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">🎵 {myMood.music_track}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      Expires {format(new Date(myMood.expires_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl animate-pulse" />
                    <Sparkles className="relative w-12 h-12 text-primary mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No mood set</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your current vibe with your friends
                  </p>
                  <Button 
                    onClick={() => setOpen(true)}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                  >
                    <Smile className="w-4 h-4 mr-2" />
                    Set Your Mood
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default MoodBoard;