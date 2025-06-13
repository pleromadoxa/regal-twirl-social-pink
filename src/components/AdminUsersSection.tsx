
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import VerificationBadge from './VerificationBadge';
import UserVerificationDialog from './UserVerificationDialog';
import { useVerifiedStatus } from '@/hooks/useVerifiedStatus';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_verified: boolean;
  verification_level?: string;
  verification_notes?: string;
  premium_tier: string;
  created_at: string;
  updated_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
  ip_address?: string;
}

const AdminUsersSection = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchActivityLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      // Mock activity logs for now - you can implement this table later
      const mockLogs: ActivityLog[] = [
        {
          id: '1',
          user_id: 'user1',
          action: 'LOGIN',
          details: 'User logged in from Chrome browser',
          created_at: new Date().toISOString(),
          ip_address: '192.168.1.1'
        },
        {
          id: '2',
          user_id: 'user2',
          action: 'POST_CREATED',
          details: 'Created a new post with image',
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
      setActivityLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const handleUserUpdate = (userId: string, updates: any) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    ));
  };

  const openVerificationDialog = (user: User) => {
    setSelectedUser(user);
    setVerificationDialogOpen(true);
  };

  const UserVerificationBadge = ({ user }: { user: User }) => {
    // Use the user's verification_level from the database if available
    const verificationLevel = user.verification_level as 'verified' | 'vip' | 'business' | 'professional' | null;
    
    if (!verificationLevel) return null;
    
    return <VerificationBadge level={verificationLevel} />;
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.is_verified || u.verification_level).length;
  const premiumUsers = users.filter(u => u.premium_tier !== 'free').length;
  const newUsersToday = users.filter(u => 
    new Date(u.created_at).toDateString() === new Date().toDateString()
  ).length;

  return (
    <>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{verifiedUsers}</p>
                  <p className="text-sm text-muted-foreground">Verified Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{premiumUsers}</p>
                  <p className="text-sm text-muted-foreground">Premium Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newUsersToday}</p>
                  <p className="text-sm text-muted-foreground">New Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {loading ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {user.display_name?.[0] || user.username?.[0] || '?'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{user.display_name || user.username}</h4>
                              <UserVerificationBadge user={user} />
                              <Badge variant={user.premium_tier === 'free' ? 'secondary' : 'default'}>
                                {user.premium_tier}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{user.followers_count} followers</span>
                              <span>{user.following_count} following</span>
                              <span>{user.posts_count} posts</span>
                              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            {user.verification_notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                Admin note: {user.verification_notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openVerificationDialog(user)}
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Manage Verification
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Activity className="w-4 h-4 mr-1" />
                              View Activity
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  User Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{log.details}</p>
                          {log.ip_address && (
                            <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <UserVerificationDialog
        user={selectedUser}
        isOpen={verificationDialogOpen}
        onClose={() => {
          setVerificationDialogOpen(false);
          setSelectedUser(null);
        }}
        onUpdate={handleUserUpdate}
      />
    </>
  );
};

export default AdminUsersSection;
