import React, { useState, useEffect } from 'react';
import { useCircles, Circle, CircleMember } from '@/hooks/useCircles';
import { useCircleInvitations } from '@/hooks/useCircleInvitations';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PlusCircle, Users, Trash, UserPlus, Lock, Globe, MessageSquare, Bell, Settings as SettingsIcon, History } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import CollaboratorSearch from '@/components/CollaboratorSearch';
import CircleCallButton from '@/components/CircleCallButton';
import CircleFeed from '@/components/CircleFeed';
import CircleInvitationsDialog from '@/components/CircleInvitationsDialog';
import CircleSettingsDialog from '@/components/CircleSettingsDialog';
import CircleCallHistoryDialog from '@/components/CircleCallHistoryDialog';
import { CircleEventsTab } from '@/components/CircleEventsTab';
import { CirclePollsTab } from '@/components/CirclePollsTab';
import { CircleMessagesTab } from '@/components/CircleMessagesTab';

const Circles = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    circles, 
    loading, 
    createCircle, 
    updateCircle, 
    deleteCircle, 
    addMemberToCircle, 
    getCircleMembers,
    updateMemberPermissions,
    checkCanAddMembers 
  } = useCircles();
  const { invitations } = useCircleInvitations();
  const [open, setOpen] = useState(false);
  const [invitationsOpen, setInvitationsOpen] = useState(false);
  const [callHistoryOpen, setCallHistoryOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [settingsCircle, setSettingsCircle] = useState<Circle | null>(null);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [circleToDelete, setCircleToDelete] = useState<Circle | null>(null);
  const [canAddMembers, setCanAddMembers] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [category, setCategory] = useState('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [circleMembersPreview, setCircleMembersPreview] = useState<Record<string, CircleMember[]>>({});
  const isMobile = useIsMobile();

  // Fetch member previews for all circles
  useEffect(() => {
    const fetchMemberPreviews = async () => {
      if (circles.length === 0) return;
      
      const previews: Record<string, CircleMember[]> = {};
      
      for (const circle of circles) {
        const members = await getCircleMembers(circle.id);
        previews[circle.id] = members.slice(0, 5);
      }
      
      setCircleMembersPreview(previews);
    };
    
    fetchMemberPreviews();
  }, [circles]);

  const colors = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'family', label: 'Family' },
    { value: 'friends', label: 'Friends' },
    { value: 'work', label: 'Work' },
    { value: 'hobby', label: 'Hobby' },
    { value: 'study', label: 'Study' },
  ];

  const handleCreate = async () => {
    if (!name.trim()) return;
    const result = await createCircle(name, description, color);
    if (result) {
      setName('');
      setDescription('');
      setColor('#6366f1');
      setCategory('general');
      setIsPrivate(false);
      setOpen(false);
    }
  };

  const handleViewCircle = async (circle: Circle) => {
    const members = await getCircleMembers(circle.id);
    setCircleMembers(members);
    setSelectedCircle(circle);
    setActiveTab('overview');
    
    // Check if current user can add members
    const canAdd = await checkCanAddMembers(circle.id);
    setCanAddMembers(canAdd);
    
    // Get current user's role
    const currentMember = members.find(m => m.user_id === user?.id);
    setCurrentUserRole(currentMember?.role || 'member');
  };

  const handleAddMember = async (user: any) => {
    if (!selectedCircle) return;
    
    // Check permission first
    if (!canAddMembers) {
      toast({
        title: "Permission denied",
        description: "Only admins or authorized members can add new members",
        variant: "destructive"
      });
      return;
    }
    
    await addMemberToCircle(selectedCircle.id, user.id);
    const members = await getCircleMembers(selectedCircle.id);
    setCircleMembers(members);
  };

  const handleToggleMemberPermission = async (memberId: string, currentPermission: boolean) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: "Permission denied",
        description: "Only admins can manage member permissions",
        variant: "destructive"
      });
      return;
    }
    
    const success = await updateMemberPermissions(memberId, !currentPermission);
    if (success && selectedCircle) {
      const members = await getCircleMembers(selectedCircle.id);
      setCircleMembers(members);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-border'} bg-background mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-muted/30 dark:bg-muted/20 ${isMobile ? '' : 'border-b border-border'} p-4 z-10 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Circles</h1>
                {invitations.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {invitations.length}
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                {invitations.length > 0 && (
                  <Button
                    size={isMobile ? "sm" : "default"}
                    variant="outline"
                    onClick={() => setInvitationsOpen(true)}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Invites
                  </Button>
                )}
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size={isMobile ? "sm" : "default"}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Circle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Circle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Circle name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="private-circle">Private Circle</Label>
                        <Switch
                          id="private-circle"
                          checked={isPrivate}
                          onCheckedChange={setIsPrivate}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Choose Color</label>
                        <div className="grid grid-cols-4 gap-2">
                          {colors.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => setColor(c.value)}
                              className={`p-4 rounded-lg transition-all ${
                                color === c.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                              }`}
                              style={{ backgroundColor: c.value }}
                            />
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleCreate} disabled={loading} className="w-full">
                        Create Circle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Create private groups to share posts, calls, and moments with specific people.
            </p>
          </div>

          {/* Circles List */}
          <div className="p-4 space-y-4">
            {circles.length === 0 ? (
              <Card className="border-2 border-dashed border-border bg-muted/30">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No circles yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create circles to organize your friends and share content selectively
                  </p>
                </CardContent>
              </Card>
            ) : (
              circles.map((circle) => (
                <Card key={circle.id} className="transition-all hover:shadow-lg duration-fast cursor-pointer bg-card border hover:border-muted-foreground/30 shadow-sm hover:scale-[1.01]" onClick={() => handleViewCircle(circle)} style={{ borderLeftColor: circle.color, borderLeftWidth: '4px' }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={circle.avatar_url} />
                          <AvatarFallback 
                            className="text-white relative"
                            style={{ backgroundColor: circle.color }}
                          >
                            <Users className="w-6 h-6" />
                            {circle.is_private && (
                              <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-slate-800 rounded-full p-0.5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <CardTitle>{circle.name}</CardTitle>
                            {circle.is_private ? (
                              <Lock className="w-3 h-3 text-muted-foreground" />
                            ) : (
                              <Globe className="w-3 h-3 text-muted-foreground" />
                            )}
                          </div>
                          {circle.description && (
                            <p className="text-sm text-muted-foreground mt-1">{circle.description}</p>
                          )}
                          <Badge variant="outline" className="mt-1">
                            {circle.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSettingsCircle(circle);
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setCircleToDelete(circle);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      {/* Stacked Member Avatars */}
                      {circleMembersPreview[circle.id] && circleMembersPreview[circle.id].length > 0 && (
                        <div className="flex -space-x-2">
                          {circleMembersPreview[circle.id].map((member, index) => (
                            <Avatar 
                              key={member.id} 
                              className="w-8 h-8 border-2 border-background"
                              style={{ zIndex: 5 - index }}
                            >
                              <AvatarImage src={member.profiles.avatar_url} />
                              <AvatarFallback className="text-xs">
                                {member.profiles.display_name?.[0]?.toUpperCase() || 
                                 member.profiles.username?.[0]?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                      
                      <Badge variant="secondary">
                        {circle.member_count} member{circle.member_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Circle Detail Dialog */}
      <Dialog open={!!selectedCircle} onOpenChange={() => setSelectedCircle(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-background border" style={{ borderLeftColor: selectedCircle?.color || '#6366f1', borderLeftWidth: '4px' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: selectedCircle?.color }}
              >
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span>{selectedCircle?.name}</span>
                  {selectedCircle?.is_private ? (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                {selectedCircle?.description && (
                  <p className="text-sm font-normal text-muted-foreground">
                    {selectedCircle.description}
                  </p>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="feed">Feed</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="polls">Polls</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-muted/30 border">
                  <CardHeader>
                    <CardTitle className="text-sm">Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedCircle?.member_count}</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/30 border">
                  <CardHeader>
                    <CardTitle className="text-sm">Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">{selectedCircle?.category}</Badge>
                  </CardContent>
                </Card>
              </div>
              {selectedCircle && selectedCircle.member_count > 0 && (
                <Card className="bg-muted/30 border">
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex space-x-2">
                    <CircleCallButton 
                      circleId={selectedCircle.id} 
                      circleName={selectedCircle.name}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCallHistoryOpen(true)}
                    >
                      <History className="w-4 h-4 mr-2" />
                      Call History
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('feed')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Feed
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messages">
              {selectedCircle && (
                <CircleMessagesTab circleId={selectedCircle.id} />
              )}
            </TabsContent>

            <TabsContent value="feed">
              {selectedCircle && (
                <CircleFeed circleId={selectedCircle.id} circleName={selectedCircle.name} />
              )}
            </TabsContent>

            <TabsContent value="events">
              {selectedCircle && (
                <CircleEventsTab circleId={selectedCircle.id} />
              )}
            </TabsContent>

            <TabsContent value="polls">
              {selectedCircle && (
                <CirclePollsTab circleId={selectedCircle.id} />
              )}
            </TabsContent>

            <TabsContent value="members" className="space-y-4">
              {canAddMembers && (
                <div className="bg-muted/30 border p-4 rounded-lg">
                  <CollaboratorSearch 
                    onUserSelect={handleAddMember}
                    placeholder="Add member to circle..."
                  />
                </div>
              )}
              {!canAddMembers && (
                <div className="p-3 bg-muted/50 border rounded-lg text-sm text-muted-foreground">
                  Only admins and authorized members can add new members to this circle.
                </div>
              )}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {circleMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg border bg-card transition-all hover:shadow-md">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.profiles.avatar_url} />
                          <AvatarFallback>
                            {member.profiles.display_name?.[0] || member.profiles.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{member.profiles.display_name || member.profiles.username}</p>
                          <p className="text-xs text-muted-foreground">@{member.profiles.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'admin' ? 'default' : 'outline'}>
                          {member.role}
                        </Badge>
                        {currentUserRole === 'admin' && member.role !== 'admin' && member.user_id !== user?.id && (
                          <div className="flex items-center gap-2 ml-2">
                            <Label htmlFor={`can-add-${member.id}`} className="text-xs cursor-pointer">
                              Can add members
                            </Label>
                            <Switch
                              id={`can-add-${member.id}`}
                              checked={member.can_add_members || false}
                              onCheckedChange={() => handleToggleMemberPermission(member.id, member.can_add_members || false)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <CircleInvitationsDialog 
        open={invitationsOpen} 
        onOpenChange={setInvitationsOpen}
      />

      {settingsCircle && (
        <CircleSettingsDialog
          circle={settingsCircle as any}
          isOpen={!!settingsCircle}
          onClose={() => setSettingsCircle(null)}
          onUpdate={() => {
            // Refresh circles list
            window.location.reload();
          }}
        />
      )}

      {selectedCircle && (
        <CircleCallHistoryDialog
          open={callHistoryOpen}
          onOpenChange={setCallHistoryOpen}
          circleId={selectedCircle.id}
          circleName={selectedCircle.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Circle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{circleToDelete?.name}"? This action cannot be undone. 
              All posts and data within this circle will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (circleToDelete) {
                  await deleteCircle(circleToDelete.id);
                  setCircleToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Circle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Circles;