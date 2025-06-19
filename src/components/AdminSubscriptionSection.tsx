
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  RefreshCw,
  DollarSign,
  FileText
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
  stripe_customer_id?: string;
  profiles?: {
    username?: string;
    display_name?: string;
  } | null;
}

interface Transaction {
  id: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: string;
  subscription_tier: string;
  transaction_id: string;
  created_at: string;
  user_id?: string;
}

interface SubscriptionStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  free: number;
  pro: number;
  business: number;
  revenue: number;
  monthlyRevenue: number;
  averageRevenue: number;
  transactionCount: number;
}

const AdminSubscriptionSection = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    expired: 0,
    expiringSoon: 0,
    free: 0,
    pro: 0,
    business: 0,
    revenue: 0,
    monthlyRevenue: 0,
    averageRevenue: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      
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

  const fetchTransactions = async () => {
    // Mock transaction data since we don't have a transactions table yet
    // In a real implementation, you would fetch from your transactions table
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        customer_email: 'user1@example.com',
        amount: 9.99,
        currency: 'USD',
        status: 'completed',
        subscription_tier: 'Pro',
        transaction_id: 'txn_1234567890',
        created_at: new Date().toISOString(),
        user_id: 'user1'
      },
      {
        id: '2',
        customer_email: 'user2@example.com',
        amount: 19.99,
        currency: 'USD',
        status: 'completed',
        subscription_tier: 'Business',
        transaction_id: 'txn_0987654321',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        user_id: 'user2'
      }
    ];
    
    setTransactions(mockTransactions);
  };

  const calculateStats = (data: Subscriber[]) => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const newStats: SubscriptionStats = {
      total: data.length,
      active: 0,
      expired: 0,
      expiringSoon: 0,
      free: 0,
      pro: 0,
      business: 0,
      revenue: 0,
      monthlyRevenue: 0,
      averageRevenue: 0,
      transactionCount: 0
    };

    data.forEach(subscriber => {
      // Count by tier
      if (subscriber.subscription_tier === 'Pro') {
        newStats.pro++;
        newStats.revenue += 9.99;
      } else if (subscriber.subscription_tier === 'Business') {
        newStats.business++;
        newStats.revenue += 19.99;
      } else {
        newStats.free++;
      }

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
      } else {
        newStats.expired++;
      }
    });

    newStats.monthlyRevenue = newStats.revenue;
    newStats.averageRevenue = newStats.active > 0 ? newStats.revenue / newStats.active : 0;
    newStats.transactionCount = transactions.length;

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

  const getTransactionStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge variant="default">Completed</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    } else if (status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const refreshData = () => {
    fetchSubscribers();
    fetchTransactions();
    toast({
      title: "Refreshed",
      description: "Subscription data has been updated",
    });
  };

  useEffect(() => {
    fetchSubscribers();
    fetchTransactions();
  }, []);

  useEffect(() => {
    calculateStats(subscribers);
  }, [subscribers, transactions]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active} active subscriptions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${stats.averageRevenue.toFixed(2)} per user
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pro Subscribers</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pro}</div>
                <p className="text-xs text-muted-foreground">
                  ${(stats.pro * 9.99).toFixed(2)} revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Subscribers</CardTitle>
                <CreditCard className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.business}</div>
                <p className="text-xs text-muted-foreground">
                  ${(stats.business * 19.99).toFixed(2)} revenue
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Free Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.free}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.free / stats.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.expiringSoon}</div>
                <p className="text-xs text-muted-foreground">
                  Next 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.transactionCount}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subscriber Management</CardTitle>
                <Button onClick={refreshData} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
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
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="Pro">Pro</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Free">Free</SelectItem>
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

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading subscriptions...
                        </TableCell>
                      </TableRow>
                    ) : filteredSubscribers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
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
                            <span className="text-xs font-mono">
                              {subscriber.stripe_customer_id || 'N/A'}
                            </span>
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
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
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
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <span className="text-xs font-mono">
                              {transaction.transaction_id}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.customer_email}</TableCell>
                          <TableCell>{getTierBadge(transaction.subscription_tier)}</TableCell>
                          <TableCell>
                            ${transaction.amount.toFixed(2)} {transaction.currency}
                          </TableCell>
                          <TableCell>{getTransactionStatusBadge(transaction.status)}</TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubscriptionSection;
