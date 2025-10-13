import React, { useState } from 'react';
import { useSocialChallenges, SocialChallenge } from '@/hooks/useSocialChallenges';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Users, TrendingUp, Calendar, PlusCircle } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const Challenges = () => {
  const { challenges, myParticipations, loading, createChallenge, joinChallenge, updateProgress } = useSocialChallenges();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SocialChallenge['category']>('fitness');
  const [goalType, setGoalType] = useState<SocialChallenge['goal_type']>('count');
  const [goalValue, setGoalValue] = useState('');
  const [durationDays, setDurationDays] = useState('7');
  const isMobile = useIsMobile();

  const handleCreate = async () => {
    if (!title.trim()) return;
    
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
    
    setTitle('');
    setDescription('');
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Trophy className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Challenges</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Challenge</DialogTitle>
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
                    <Input type="number" placeholder="Duration (days)" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
                    <Button onClick={handleCreate} disabled={loading} className="w-full">
                      Create Challenge
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
                  <Card key={challenge.id} className="transition-all hover:shadow-lg duration-fast">
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
                          onClick={() => joinChallenge(challenge.id)} 
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
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Challenges;