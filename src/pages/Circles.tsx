import React, { useState } from 'react';
import { useCircles, Circle, CircleMember } from '@/hooks/useCircles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Users, Edit, Trash, UserPlus } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import CollaboratorSearch from '@/components/CollaboratorSearch';

const Circles = () => {
  const { circles, loading, createCircle, updateCircle, deleteCircle, addMemberToCircle, getCircleMembers } = useCircles();
  const [open, setOpen] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [circleMembers, setCircleMembers] = useState<CircleMember[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const isMobile = useIsMobile();

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

  const handleCreate = async () => {
    if (!name.trim()) return;
    const result = await createCircle(name, description, color);
    if (result) {
      setName('');
      setDescription('');
      setColor('#6366f1');
      setOpen(false);
    }
  };

  const handleViewMembers = async (circle: Circle) => {
    const members = await getCircleMembers(circle.id);
    setCircleMembers(members);
    setSelectedCircle(circle);
  };

  const handleAddMember = async (user: any) => {
    if (!selectedCircle) return;
    await addMemberToCircle(selectedCircle.id, user.id);
    const members = await getCircleMembers(selectedCircle.id);
    setCircleMembers(members);
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
                <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Circles</h1>
              </div>
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
            <p className="text-sm text-muted-foreground">
              Organize friends into custom circles and share content selectively with specific groups.
            </p>
          </div>

          {/* Circles List */}
          <div className="p-4 space-y-4">
            {circles.length === 0 ? (
              <Card>
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
                <Card key={circle.id} className="transition-all hover:shadow-lg duration-fast">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: circle.color }}
                        >
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle>{circle.name}</CardTitle>
                          {circle.description && (
                            <p className="text-sm text-muted-foreground mt-1">{circle.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewMembers(circle)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCircle(circle.id)}
                        >
                          <Trash className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {circle.member_count} member{circle.member_count !== 1 ? 's' : ''}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMembers(circle)}
                      >
                        View Members
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Circle Members Dialog */}
      <Dialog open={!!selectedCircle} onOpenChange={() => setSelectedCircle(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCircle?.name} Members
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <CollaboratorSearch 
              onUserSelect={handleAddMember}
              placeholder="Add member to circle..."
            />
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {circleMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
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
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Circles;