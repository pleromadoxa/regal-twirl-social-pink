import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subscriber {
  id: string;
  email: string;
  user_id: string;
  subscribed: boolean;
  subscription_tier: string;
  subscription_end: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username?: string;
    display_name?: string;
  } | null;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  pro: number;
  business: number;
  revenue: number;
}

const AdminSubscriptionSection = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
    pro: 0,
    business: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      
      // Fetch subscribers and try to get profile data
      const { data: subscribersData, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscribers:', error);
        toast({
          title: "Error",
          description: "Failed to fetch subscription data",
          variant: "destructive"
        });
        return;
      }

      // Get profile data separately due to potential relation issues
      const subscribersWithProfiles = await Promise.all(
        (subscribersData || []).map(async (subscriber) => {
          if (subscriber.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, display_name')
              .eq('id', subscriber.user_id)
              .single();
            
            return {
              ...subscriber,
              profiles: profileData || null
            };
          }
          return {
            ...subscriber,
            profiles: null
          };
        })
      );

      setSubscribers(subscribersWithProfiles);
      calculateStats(subscribersWithProfiles);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Subscriber[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const newStats: SubscriptionStats = {
      total: data.length,
      active: 0,
      expired: 0,
      expiringSoon: 0,
      pro: 0,
      business: 0,
      revenue: 0
    };

    data.forEach(subscriber => {
      if (subscriber.subscribed) {
        newStats.active++;
        
        if (subscriber.subscription_end) {
          const endDate = new Date(subscriber.subscription_end);
          if (endDate < now) {
            newStats.expired++;
          } else if (endDate <= thirtyDaysFromNow) {
            newStats.expiringSoon++;
          }
        }

        if (subscriber.subscription_tier === 'Pro') {
          newStats.pro++;
          newStats.revenue += 10;
        } else if (subscriber.subscription_tier === 'Business') {
          newStats.business++;
          newStats.revenue += 20;
        }
      } else {
        newStats.expired++;
      }
    });

    setStats(newStats);
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = 
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTier = filterTier === 'all' || subscriber.subscription_tier === filterTier;
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && subscriber.subscribed) ||
      (filterStatus === 'expired' && !subscriber.subscribed);

    return matchesSearch && matchesTier && matchesStatus;
  });

  const getStatusBadge = (subscriber: Subscriber) => {
    if (!subscriber.subscribed) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    if (subscriber.subscription_end) {
      const endDate = new Date(subscriber.subscription_end);
      const now = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7) {
        return <Badge variant="destructive">Expires Soon</Badge>;
      } else if (daysUntilExpiry <= 30) {
        return <Badge variant="secondary">Expires in {daysUntilExpiry} days</Badge>;
      }
    }

    return <Badge variant="default">Active</Badge>;
  };

  const getTierBadge = (tier: string) => {
    if (tier === 'Business') {
      return <Badge className="bg-amber-500">Business</Badge>;
    } else if (tier === 'Pro') {
      return <Badge className="bg-purple-500">Pro</Badge>;
    }
    return <Badge variant="outline">Free</Badge>;
  };

  const refreshData = () => {
    fetchSubscribers();
    toast({
      title: "Refreshed",
      description: "Subscription data has been updated",
    });
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              {stats.expiringSoon} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue}</div>
            <p className="text-xs text-muted-foreground">
              Pro: {stats.pro} | Business: {stats.business}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Management</CardTitle>
            <div className="flex items-center gap-2">
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by email or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {subscriber.profiles?.display_name || subscriber.profiles?.username || 'Unknown'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            @{subscriber.profiles?.username || 'unknown'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{subscriber.email}</TableCell>
                      <TableCell>{getTierBadge(subscriber.subscription_tier || 'Free')}</TableCell>
                      <TableCell>{getStatusBadge(subscriber)}</TableCell>
                      <TableCell>
                        {subscriber.subscription_end ? 
                          new Date(subscriber.subscription_end).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptionSection;
