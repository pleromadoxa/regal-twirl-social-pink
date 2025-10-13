import React, { useState } from 'react';
import { useCloseFriends } from '@/hooks/useCloseFriends';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, UserPlus, Trash } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import CollaboratorSearch from '@/components/CollaboratorSearch';
import { format } from 'date-fns';

const CloseFriends = () => {
  const { closeFriends, loading, addCloseFriend, removeCloseFriend } = useCloseFriends();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleAddFriend = async (user: any) => {
    await addCloseFriend(user.id);
    setOpen(false);
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
                <Heart className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary fill-primary animate-pulse`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Close Friends</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Close Friend</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Close friends will see exclusive content you share with them
                    </p>
                    <CollaboratorSearch 
                      onUserSelect={handleAddFriend}
                      placeholder="Search for friends..."
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Share exclusive stories, posts, and content only with your closest friends list.
            </p>
          </div>

          {/* Close Friends List */}
          <div className="p-4 space-y-4">
            {closeFriends.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No close friends yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add close friends to share exclusive content with them
                  </p>
                </CardContent>
              </Card>
            ) : (
              closeFriends.map((friend) => (
                <Card key={friend.id} className="transition-all hover:shadow-lg duration-fast">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={friend.profiles.avatar_url} />
                          <AvatarFallback>
                            {friend.profiles.display_name?.[0] || friend.profiles.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{friend.profiles.display_name || friend.profiles.username}</p>
                          <p className="text-sm text-muted-foreground">@{friend.profiles.username}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Added {format(new Date(friend.added_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCloseFriend(friend.id)}
                        disabled={loading}
                      >
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default CloseFriends;