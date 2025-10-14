import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShieldOff, Undo } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BlockedUser {
  id: string;
  blocked_user_id: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

const BlockedUsers = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
    }
  }, [user]);

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          *,
          profiles!blocked_user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlockedUsers(data as any || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const handleUnblock = async (blockId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      toast({ title: "User unblocked successfully" });
      await fetchBlockedUsers();
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      toast({ title: "Failed to unblock user", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center space-x-3">
              <ShieldOff className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Blocked Users</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Manage users you've blocked. They won't be able to see your content or interact with you.
            </p>
          </div>

          {/* Blocked Users List */}
          <div className="p-4 space-y-4">
            {blockedUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShieldOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No blocked users</h3>
                  <p className="text-muted-foreground">
                    Users you block will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              blockedUsers.map((blocked) => (
                <Card key={blocked.id} className="transition-all hover:shadow-lg duration-fast">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={blocked.profiles.avatar_url} />
                          <AvatarFallback>
                            {blocked.profiles.display_name?.[0] || blocked.profiles.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{blocked.profiles.display_name || blocked.profiles.username}</p>
                          <p className="text-sm text-muted-foreground">@{blocked.profiles.username}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Blocked {format(new Date(blocked.created_at), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnblock(blocked.id)}
                        disabled={loading}
                      >
                        <Undo className="w-4 h-4 mr-2" />
                        Unblock
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

export default BlockedUsers;