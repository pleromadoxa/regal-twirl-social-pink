import React, { useState } from 'react';
import { useMoodBoard } from '@/hooks/useMoodBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Smile, Music, Activity, Sparkles, X } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format } from 'date-fns';

const MoodBoard = () => {
  const { myMood, loading, setMood, clearMood } = useMoodBoard();
  const [open, setOpen] = useState(false);
  const [mood, setMoodValue] = useState('');
  const [activity, setActivity] = useState('');
  const [musicTrack, setMusicTrack] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [customMessage, setCustomMessage] = useState('');
  const [colorTheme, setColorTheme] = useState('#6366f1');
  const isMobile = useIsMobile();

  const moods = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😎', label: 'Cool' },
    { emoji: '🤩', label: 'Excited' },
    { emoji: '😌', label: 'Peaceful' },
    { emoji: '🥳', label: 'Celebrating' },
    { emoji: '💪', label: 'Motivated' },
    { emoji: '🧘', label: 'Zen' },
    { emoji: '🎨', label: 'Creative' },
    { emoji: '📚', label: 'Focused' },
    { emoji: '☕', label: 'Chill' },
    { emoji: '🎵', label: 'Vibing' },
    { emoji: '💼', label: 'Working' }
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
    if (!mood.trim()) return;
    
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    await setMood({
      mood,
      activity: activity || null,
      music_track: musicTrack || null,
      emoji: emoji,
      custom_message: customMessage || null,
      color_theme: colorTheme,
      expires_at: expiresAt
    });
    
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Sparkles className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Mood Board</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <Smile className="w-4 h-4 mr-2" />
                    Set Mood
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Your Current Vibe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Choose Your Mood</label>
                      <div className="grid grid-cols-6 gap-2">
                        {moods.map((m) => (
                          <button
                            key={m.label}
                            onClick={() => {
                              setEmoji(m.emoji);
                              setMoodValue(m.label);
                            }}
                            className={`p-3 text-2xl rounded-lg transition-all hover:scale-110 ${
                              emoji === m.emoji ? 'bg-primary/20 ring-2 ring-primary' : 'hover:bg-accent'
                            }`}
                            title={m.label}
                          >
                            {m.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <Input 
                      placeholder="What are you up to?" 
                      value={activity} 
                      onChange={(e) => setActivity(e.target.value)}
                    />
                    
                    <Input 
                      placeholder="Listening to..." 
                      value={musicTrack} 
                      onChange={(e) => setMusicTrack(e.target.value)}
                    />
                    
                    <Textarea
                      placeholder="Add a custom message (optional)"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      rows={3}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Color Theme</label>
                      <div className="grid grid-cols-8 gap-2">
                        {colors.map((c) => (
                          <button
                            key={c.value}
                            onClick={() => setColorTheme(c.value)}
                            className={`p-4 rounded-lg transition-all ${
                              colorTheme === c.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                            }`}
                            style={{ backgroundColor: c.value }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <Button onClick={handleSetMood} disabled={loading || !mood} className="w-full">
                      Set Mood
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Current Mood Display */}
          <div className="p-4">
            {myMood ? (
              <Card 
                className="transition-all hover:shadow-lg duration-fast overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${myMood.color_theme}20, ${myMood.color_theme}10)`,
                  borderColor: myMood.color_theme
                }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-6xl">{myMood.emoji}</span>
                      <div>
                        <CardTitle className="text-2xl">{myMood.mood}</CardTitle>
                        {myMood.custom_message && (
                          <p className="text-muted-foreground mt-2">{myMood.custom_message}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearMood()}
                      disabled={loading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myMood.activity && (
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{myMood.activity}</span>
                    </div>
                  )}
                  {myMood.music_track && (
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">🎵 {myMood.music_track}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Expires {format(new Date(myMood.expires_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No mood set</h3>
                  <p className="text-muted-foreground mb-4">
                    Share your current vibe with your friends
                  </p>
                  <Button onClick={() => setOpen(true)}>
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