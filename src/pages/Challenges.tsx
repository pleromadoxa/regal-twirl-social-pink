import React, { useState } from 'react';
import { useSocialChallenges, SocialChallenge } from '@/hooks/useSocialChallenges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Users, TrendingUp, Calendar, PlusCircle, MoreVertical, Edit, Trash2, BarChart3 } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { ChallengeAnalytics } from '@/components/ChallengeAnalytics';

const Challenges = () => {
  const { challenges, myParticipations, loading, createChallenge, updateChallenge, deleteChallenge, joinChallenge, updateProgress } = useSocialChallenges();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<SocialChallenge | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SocialChallenge['category']>('fitness');
  const [goalType, setGoalType] = useState<SocialChallenge['goal_type']>('count');
  const [goalValue, setGoalValue] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const [viewingAnalytics, setViewingAnalytics] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('fitness');
    setGoalType('count');
    setGoalValue('');
    setDurationDays('7');
    setEditingChallenge(null);
  };

  const handleEdit = (challenge: SocialChallenge) => {
    setEditingChallenge(challenge);
    setTitle(challenge.title);
    setDescription(challenge.description || '');
    setCategory(challenge.category);
    setGoalType(challenge.goal_type);
    setGoalValue(challenge.goal_value?.toString() || '');
    setDurationDays(challenge.duration_days.toString());
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!challengeToDelete) return;
    await deleteChallenge(challengeToDelete);
    setDeleteDialogOpen(false);
    setChallengeToDelete(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    if (editingChallenge) {
      await updateChallenge(editingChallenge.id, {
        title,
        description,
        category,
        goal_type: goalType,
        goal_value: goalValue ? parseInt(goalValue) : null,
        duration_days: parseInt(durationDays),
      });
    } else {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + parseInt(durationDays) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      await createChallenge({
        title,
        description,
        category,
        goal_type: goalType,
        goal_value: goalValue ? parseInt(goalValue) : null,
        duration_days: parseInt(durationDays),
        start_date: startDate,
        end_date: endDate,
        cover_image_url: null,
        is_public: true
      });
    }
    
    resetForm();
    setOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'fitness': return '💪';
      case 'creativity': return '🎨';
      case 'learning': return '📚';
      case 'wellness': return '🧘';
      case 'social': return '👥';
      default: return '🎯';
    }
  };

  const isParticipating = (challengeId: string) => {
    return myParticipations.some(p => p.challenge_id === challengeId && p.status === 'active');
  };

  const getParticipation = (challengeId: string) => {
    return myParticipations.find(p => p.challenge_id === challengeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/40 via-pink-50/40 to-blue-50/40 dark:from-slate-900 dark:via-purple-900/30 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-primary/10 dark:border-primary/20'} bg-background/40 dark:bg-background/40 backdrop-blur-2xl mx-auto shadow-2xl`}>
          {/* Header */}
          <div className={`sticky top-0 bg-background/80 dark:bg-background/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-primary/10 dark:border-primary/20'} p-4 z-10 space-y-3 shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Challenges</h1>
              </div>
              <Dialog open={open} onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingChallenge ? 'Edit Challenge' : 'Create Challenge'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Challenge title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fitness">💪 Fitness</SelectItem>
                        <SelectItem value="creativity">🎨 Creativity</SelectItem>
                        <SelectItem value="learning">📚 Learning</SelectItem>
                        <SelectItem value="wellness">🧘 Wellness</SelectItem>
                        <SelectItem value="social">👥 Social</SelectItem>
                        <SelectItem value="other">🎯 Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={goalType} onValueChange={(val: any) => setGoalType(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="count">Count Goal</SelectItem>
                        <SelectItem value="duration">Duration Goal</SelectItem>
                        <SelectItem value="completion">Completion</SelectItem>
                      </SelectContent>
                    </Select>
                    {goalType !== 'completion' && (
                      <Input type="number" placeholder="Goal value" value={goalValue} onChange={(e) => setGoalValue(e.target.value)} />
                    )}
                    {!editingChallenge && (
                      <Input type="number" placeholder="Duration (days)" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
                    )}
                    <Button onClick={handleCreate} disabled={loading} className="w-full">
                      {editingChallenge ? 'Update Challenge' : 'Create Challenge'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Join or create fitness, wellness, and social challenges. Track progress and compete with friends!
            </p>
          </div>

          {/* Challenges List */}
          <div className="p-4 space-y-4">
            {challenges.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No challenges yet</h3>
                  <p className="text-muted-foreground">Create or join challenges to compete with friends!</p>
                </CardContent>
              </Card>
            ) : (
              challenges.map((challenge) => {
                const participation = getParticipation(challenge.id);
                const progressPercent = participation && challenge.goal_value 
                  ? (participation.progress / challenge.goal_value) * 100 
                  : 0;
                
                return (
                  <Card 
                    key={challenge.id} 
                    className="transition-all hover:shadow-2xl duration-fast bg-card/60 backdrop-blur-xl border-primary/10 hover:border-primary/30 shadow-xl hover:scale-[1.02] cursor-pointer"
                    onClick={() => setViewingAnalytics(challenge.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                            <Badge variant="secondary">{challenge.category}</Badge>
                          </div>
                          <CardTitle>{challenge.title}</CardTitle>
                          {challenge.description && (
                            <p className="text-sm text-muted-foreground mt-2">{challenge.description}</p>
                          )}
                        </div>
                        {challenge.creator_id === user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="glass"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-dark backdrop-blur-xl">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setViewingAnalytics(challenge.id);
                              }}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(challenge);
                              }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setChallengeToDelete(challenge.id);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>{challenge.goal_type} {challenge.goal_value ? `- ${challenge.goal_value}` : ''}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{challenge.participants_count} participants</span>
                        </div>
                        <div className="flex items-center space-x-2 col-span-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>

                      {participation && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Your Progress</span>
                            <span className="font-medium">{participation.progress} / {challenge.goal_value}</span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}

                      {isParticipating(challenge.id) ? (
                        <Badge variant="default" className="w-full justify-center py-2">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Participating
                        </Badge>
                      ) : challenge.creator_id === user?.id ? (
                        <Badge variant="secondary" className="w-full justify-center py-2">
                          Your Challenge
                        </Badge>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            joinChallenge(challenge.id);
                          }} 
                          disabled={loading}
                          className="w-full"
                        >
                          Join Challenge
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this challenge? This action cannot be undone and all participant data will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Analytics Dialog */}
          <Dialog open={!!viewingAnalytics} onOpenChange={() => setViewingAnalytics(null)}>
            <DialogContent className="max-w-3xl glass-dark backdrop-blur-2xl border-primary/20">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Challenge Analytics
                </DialogTitle>
              </DialogHeader>
              {viewingAnalytics && (
                <ChallengeAnalytics 
                  challengeId={viewingAnalytics} 
                  isCreator={challenges.find(c => c.id === viewingAnalytics)?.creator_id === user?.id}
                />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Challenges;