import React, { useState } from 'react';
import { useFriendshipMilestones, FriendshipMilestone } from '@/hooks/useFriendshipMilestones';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Heart, Sparkles, Trophy, Star, Gift, Trash, Bell, BellOff, PlusCircle } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import CollaboratorSearch from '@/components/CollaboratorSearch';
import { format, isFuture, isPast, isToday } from 'date-fns';

const FriendshipMilestones = () => {
  const { milestones, loading, createMilestone, updateMilestone, deleteMilestone } = useFriendshipMilestones();
  const [open, setOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [milestoneType, setMilestoneType] = useState<FriendshipMilestone['milestone_type']>('birthday');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const isMobile = useIsMobile();

  const milestoneIcons: Record<FriendshipMilestone['milestone_type'], any> = {
    birthday: Gift,
    anniversary: Heart,
    achievement: Trophy,
    memory: Star,
    streak: Trophy,
    custom: Sparkles,
    other: Sparkles
  };

  const milestoneColors: Record<FriendshipMilestone['milestone_type'], string> = {
    birthday: '#ec4899',
    anniversary: '#f43f5e',
    achievement: '#f97316',
    memory: '#a855f7',
    streak: '#10b981',
    custom: '#6366f1',
    other: '#6366f1'
  };

  const handleCreate = async () => {
    if (!selectedFriend || !title.trim() || !date) return;

    await createMilestone({
      friend_id: selectedFriend.id,
      milestone_type: milestoneType,
      title,
      description,
      date,
      is_recurring: isRecurring,
      reminder_enabled: reminderEnabled
    });

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setSelectedFriend(null);
    setTitle('');
    setDescription('');
    setDate('');
    setIsRecurring(false);
    setReminderEnabled(true);
  };

  const getMilestoneStatus = (milestone: FriendshipMilestone) => {
    const milestoneDate = new Date(milestone.date);
    if (isToday(milestoneDate)) return { label: 'Today!', variant: 'default' as const };
    if (isPast(milestoneDate) && !milestone.is_recurring) return { label: 'Past', variant: 'secondary' as const };
    if (isFuture(milestoneDate)) return { label: 'Upcoming', variant: 'outline' as const };
    return { label: 'Active', variant: 'secondary' as const };
  };

  const groupedMilestones = {
    today: milestones.filter(m => isToday(new Date(m.date))),
    upcoming: milestones.filter(m => isFuture(new Date(m.date))),
    past: milestones.filter(m => isPast(new Date(m.date)) && !isToday(new Date(m.date)) && !m.is_recurring)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Friendship Milestones</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Milestone</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Friend</Label>
                      <CollaboratorSearch 
                        onUserSelect={(user) => setSelectedFriend(user)}
                        placeholder="Search for a friend..."
                      />
                      {selectedFriend && (
                        <div className="flex items-center space-x-2 p-2 bg-accent rounded-lg">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={selectedFriend.avatar_url} />
                            <AvatarFallback>{selectedFriend.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{selectedFriend.display_name || selectedFriend.username}</span>
                        </div>
                      )}
                    </div>

                    <Select value={milestoneType} onValueChange={(val: any) => setMilestoneType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="birthday">🎁 Birthday</SelectItem>
                        <SelectItem value="anniversary">❤️ Anniversary</SelectItem>
                        <SelectItem value="achievement">🏆 Achievement</SelectItem>
                        <SelectItem value="memory">⭐ Memory</SelectItem>
                        <SelectItem value="streak">🔥 Streak</SelectItem>
                        <SelectItem value="custom">💫 Custom</SelectItem>
                        <SelectItem value="other">✨ Other</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input 
                      placeholder="Milestone title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                    />

                    <Textarea
                      placeholder="Description (optional)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />

                    <Input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                    />

                    <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <Label htmlFor="recurring">Recurring Annually</Label>
                      <Switch 
                        id="recurring" 
                        checked={isRecurring} 
                        onCheckedChange={setIsRecurring}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <Label htmlFor="reminder">Enable Reminders</Label>
                      <Switch 
                        id="reminder" 
                        checked={reminderEnabled} 
                        onCheckedChange={setReminderEnabled}
                      />
                    </div>

                    <Button onClick={handleCreate} disabled={loading || !selectedFriend} className="w-full">
                      Create Milestone
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Remember and celebrate special moments with your friends. Set reminders for birthdays, anniversaries, and memories.
            </p>
          </div>

          {/* Milestones List */}
          <div className="p-4 space-y-6">
            {/* Today's Milestones */}
            {groupedMilestones.today.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  <span>Today's Milestones</span>
                </h2>
                {groupedMilestones.today.map((milestone) => {
                  const Icon = milestoneIcons[milestone.milestone_type];
                  const status = getMilestoneStatus(milestone);
                  
                  return (
                    <Card 
                      key={milestone.id} 
                      className="group relative overflow-hidden transition-all hover:shadow-2xl hover:scale-[1.02] duration-300 animate-fade-in border-0 bg-gradient-to-br from-white via-white to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-purple-950"
                    >
                      {/* Gradient overlay */}
                      <div 
                        className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                        style={{ 
                          background: `linear-gradient(135deg, ${milestoneColors[milestone.milestone_type]}40 0%, transparent 100%)`
                        }}
                      />
                      
                      {/* Left accent bar */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 group-hover:w-2 transition-all duration-300"
                        style={{ backgroundColor: milestoneColors[milestone.milestone_type] }}
                      />
                      
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Icon with gradient background */}
                            <div className="relative">
                              <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                                style={{ 
                                  background: `linear-gradient(135deg, ${milestoneColors[milestone.milestone_type]}30, ${milestoneColors[milestone.milestone_type]}50)`,
                                  border: `2px solid ${milestoneColors[milestone.milestone_type]}40`
                                }}
                              >
                                <Icon className="w-7 h-7" style={{ color: milestoneColors[milestone.milestone_type] }} />
                              </div>
                              {/* Animated sparkle on today's milestones */}
                              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-pulse shadow-lg" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                {milestone.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-slate-700 shadow-md">
                                  <AvatarImage src={milestone.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs font-semibold">
                                    {milestone.profiles?.display_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-muted-foreground">
                                  {milestone.profiles?.display_name || milestone.profiles?.username}
                                </span>
                                <Badge className="text-xs font-semibold animate-pulse bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                                  🎉 Today!
                                </Badge>
                                {milestone.is_recurring && (
                                  <Badge variant="secondary" className="text-xs">
                                    🔄 Recurring
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {milestone.reminder_enabled ? (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bell className="w-4 h-4 text-primary animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                <BellOff className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMilestone(milestone.id)}
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {milestone.description && (
                        <CardContent className="pt-0 relative">
                          <div className="bg-accent/30 rounded-lg p-3 border border-accent">
                            <p className="text-sm text-foreground/80 leading-relaxed">{milestone.description}</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Upcoming Milestones */}
            {groupedMilestones.upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Upcoming</h2>
                {groupedMilestones.upcoming.map((milestone) => {
                  const Icon = milestoneIcons[milestone.milestone_type];
                  const status = getMilestoneStatus(milestone);
                  
                  return (
                    <Card 
                      key={milestone.id} 
                      className="group relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01] duration-300 border-l-4"
                      style={{ borderLeftColor: milestoneColors[milestone.milestone_type] }}
                    >
                      <CardHeader className="pb-3 relative">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 flex-1">
                            <div 
                              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300"
                              style={{ 
                                background: `linear-gradient(135deg, ${milestoneColors[milestone.milestone_type]}20, ${milestoneColors[milestone.milestone_type]}40)`
                              }}
                            >
                              <Icon className="w-6 h-6" style={{ color: milestoneColors[milestone.milestone_type] }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base font-semibold mb-2 group-hover:text-primary transition-colors">
                                {milestone.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Avatar className="w-6 h-6 ring-2 ring-background shadow-sm">
                                  <AvatarImage src={milestone.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {milestone.profiles?.display_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {milestone.profiles?.display_name}
                                </span>
                                <Badge variant={status.variant} className="text-xs shadow-sm">
                                  📅 {format(new Date(milestone.date), 'MMM d, yyyy')}
                                </Badge>
                                {milestone.is_recurring && (
                                  <Badge variant="secondary" className="text-xs shadow-sm">
                                    🔄 Recurring
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMilestone(milestone.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      {milestone.description && (
                        <CardContent className="pt-0">
                          <div className="bg-accent/20 rounded-lg p-3 border border-accent/50">
                            <p className="text-sm text-muted-foreground leading-relaxed">{milestone.description}</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {milestones.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No milestones yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create milestones to remember special moments with friends
                  </p>
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

export default FriendshipMilestones;
