import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VolumeX, Undo } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format, isPast } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface MutedUser {
  id: string;
  muted_user_id: string;
  mute_duration: string;
  muted_until: string | null;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const MutedUsers = () => {
  const [mutedUsers, setMutedUsers] = useState<MutedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchMutedUsers();
    }
  }, [user]);

  const fetchMutedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('muted_users')
        .select(`
          *,
          profiles!muted_user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMutedUsers(data as any || []);
    } catch (error) {
      console.error('Error fetching muted users:', error);
    }
  };

  const handleUnmute = async (muteId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('muted_users')
        .delete()
        .eq('id', muteId);

      if (error) throw error;

      toast({ title: "User unmuted successfully" });
      await fetchMutedUsers();
    } catch (error: any) {
      console.error('Error unmuting user:', error);
      toast({ title: "Failed to unmute user", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getMuteStatus = (mute: MutedUser) => {
    if (mute.mute_duration === 'permanent') return 'Permanent';
    if (!mute.muted_until) return 'Permanent';
    if (isPast(new Date(mute.muted_until))) return 'Expired';
    return `Until ${format(new Date(mute.muted_until), 'MMM d, yyyy')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center space-x-3">
              <VolumeX className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Muted Users</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage muted users. You won't see their posts in your feed but can still interact if needed.
            </p>
          </div>

          {/* Muted Users List */}
          <div className="p-4 space-y-4">
            {mutedUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <VolumeX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No muted users</h3>
                  <p className="text-muted-foreground">
                    Users you mute will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              mutedUsers.map((muted) => (
                <Card key={muted.id} className="transition-all hover:shadow-lg duration-fast">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={muted.profiles.avatar_url} />
                          <AvatarFallback>
                            {muted.profiles.display_name?.[0] || muted.profiles.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{muted.profiles.display_name || muted.profiles.username}</p>
                          <p className="text-sm text-muted-foreground">@{muted.profiles.username}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {getMuteStatus(muted)}
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                              Muted {format(new Date(muted.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnmute(muted.id)}
                        disabled={loading}
                      >
                        <Undo className="w-4 h-4 mr-2" />
                        Unmute
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

export default MutedUsers;