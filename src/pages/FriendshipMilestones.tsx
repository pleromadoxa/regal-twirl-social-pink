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
    other: Sparkles
  };

  const milestoneColors: Record<FriendshipMilestone['milestone_type'], string> = {
    birthday: '#ec4899',
    anniversary: '#f43f5e',
    achievement: '#f97316',
    memory: '#a855f7',
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
                      className="transition-all hover:shadow-lg duration-fast border-l-4 animate-fade-in"
                      style={{ borderLeftColor: milestoneColors[milestone.milestone_type] }}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${milestoneColors[milestone.milestone_type]}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: milestoneColors[milestone.milestone_type] }} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{milestone.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={milestone.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {milestone.profiles?.display_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {milestone.profiles?.display_name || milestone.profiles?.username}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {milestone.reminder_enabled ? (
                              <Bell className="w-4 h-4 text-primary" />
                            ) : (
                              <BellOff className="w-4 h-4 text-muted-foreground" />
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMilestone(milestone.id)}
                            >
                              <Trash className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      {milestone.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
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
                    <Card key={milestone.id} className="transition-all hover:shadow-lg duration-fast">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: `${milestoneColors[milestone.milestone_type]}20` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: milestoneColors[milestone.milestone_type] }} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-base">{milestone.title}</CardTitle>
                              <div className="flex items-center space-x-2 mt-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={milestone.profiles?.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {milestone.profiles?.display_name?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                  {milestone.profiles?.display_name}
                                </span>
                                <Badge variant={status.variant} className="text-xs">
                                  {format(new Date(milestone.date), 'MMM d, yyyy')}
                                </Badge>
                                {milestone.is_recurring && (
                                  <Badge variant="secondary" className="text-xs">Recurring</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMilestone(milestone.id)}
                          >
                            <Trash className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      {milestone.description && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
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
