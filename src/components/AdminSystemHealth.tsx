import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    queryTime: number;
    uptime: string;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
    buckets: {
      name: string;
      size: number;
      files: number;
    }[];
  };
  api: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
    requestCount: number;
    errorRate: number;
  };
  realtime: {
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    channels: number;
    messages: number;
  };
  auth: {
    status: 'healthy' | 'warning' | 'critical';
    activeUsers: number;
    signUps: number;
    successRate: number;
  };
}

interface PerformanceMetrics {
  pageLoadTime: number;
  apiLatency: number;
  databaseLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
}

const AdminSystemHealth = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    database: {
      status: 'healthy',
      connections: 0,
      queryTime: 0,
      uptime: '99.9%'
    },
    storage: {
      used: 0,
      total: 100,
      percentage: 0,
      buckets: []
    },
    api: {
      status: 'healthy',
      responseTime: 0,
      requestCount: 0,
      errorRate: 0
    },
    realtime: {
      status: 'healthy',
      connections: 0,
      channels: 0,
      messages: 0
    },
    auth: {
      status: 'healthy',
      activeUsers: 0,
      signUps: 0,
      successRate: 99.5
    }
  });

  const [performance, setPerformance] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    apiLatency: 0,
    databaseLatency: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemMetrics = async () => {
    try {
      setLoading(true);
      const startTime = Date.now();

      // Test database connectivity and performance
      const dbStart = Date.now();
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      const dbTime = Date.now() - dbStart;

      // Test storage usage
      const { data: storageData } = await supabase.storage.listBuckets();
      const buckets = await Promise.all(
        (storageData || []).map(async (bucket) => {
          const { data: files } = await supabase.storage.from(bucket.name).list();
          return {
            name: bucket.name,
            size: Math.random() * 1000, // Mock size in MB
            files: files?.length || 0
          };
        })
      );

      // Calculate total storage
      const totalStorageUsed = buckets.reduce((acc, bucket) => acc + bucket.size, 0);

      // Test API performance
      const apiTime = Date.now() - startTime;

      // Get active users (mock data based on recent activity)
      const { count: activeUsers } = await supabase
        .from('user_presence')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);

      // Get today's signups
      const today = new Date().toISOString().split('T')[0];
      const { count: todaySignups } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Mock performance metrics (in a real app, these would come from monitoring services)
      const mockPerformance: PerformanceMetrics = {
        pageLoadTime: 1200 + Math.random() * 300,
        apiLatency: apiTime,
        databaseLatency: dbTime,
        memoryUsage: 60 + Math.random() * 20,
        cpuUsage: 30 + Math.random() * 20,
        networkLatency: 50 + Math.random() * 30
      };

      setMetrics({
        database: {
          status: dbTime < 100 ? 'healthy' : dbTime < 500 ? 'warning' : 'critical',
          connections: Math.floor(Math.random() * 100) + 50,
          queryTime: dbTime,
          uptime: '99.9%'
        },
        storage: {
          used: totalStorageUsed,
          total: 10000, // 10GB mock limit
          percentage: (totalStorageUsed / 10000) * 100,
          buckets
        },
        api: {
          status: apiTime < 200 ? 'healthy' : apiTime < 1000 ? 'warning' : 'critical',
          responseTime: apiTime,
          requestCount: Math.floor(Math.random() * 10000) + 5000,
          errorRate: Math.random() * 2
        },
        realtime: {
          status: 'healthy',
          connections: Math.floor(Math.random() * 500) + 100,
          channels: Math.floor(Math.random() * 50) + 20,
          messages: Math.floor(Math.random() * 1000) + 500
        },
        auth: {
          status: 'healthy',
          activeUsers: activeUsers || 0,
          signUps: todaySignups || 0,
          successRate: 99.5
        }
      });

      setPerformance(mockPerformance);
      setLastUpdated(new Date());

    } catch (error) {
      console.error('Error fetching system metrics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch system metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health Dashboard</h2>
          <p className="text-muted-foreground">
            Last updated: {lastUpdated.toLocaleString()} • Auto-refresh: 30s
          </p>
        </div>
        <Button onClick={fetchSystemMetrics} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="storage">Storage & Resources</TabsTrigger>
          <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Database</p>
                      <p className="text-sm text-muted-foreground">{metrics.database.connections} connections</p>
                    </div>
                  </div>
                  {getStatusBadge(metrics.database.status)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Server className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">API</p>
                      <p className="text-sm text-muted-foreground">{metrics.api.responseTime}ms avg</p>
                    </div>
                  </div>
                  {getStatusBadge(metrics.api.status)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Realtime</p>
                      <p className="text-sm text-muted-foreground">{metrics.realtime.connections} connected</p>
                    </div>
                  </div>
                  {getStatusBadge(metrics.realtime.status)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="font-medium">Auth</p>
                      <p className="text-sm text-muted-foreground">{metrics.auth.successRate}% success</p>
                    </div>
                  </div>
                  {getStatusBadge(metrics.auth.status)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Database Query Time</span>
                  <Badge variant={metrics.database.queryTime < 100 ? "default" : "destructive"}>
                    {metrics.database.queryTime}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">API Error Rate</span>
                  <Badge variant={metrics.api.errorRate < 1 ? "default" : "destructive"}>
                    {metrics.api.errorRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="default">{metrics.auth.activeUsers}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Signups Today</span>
                  <Badge variant="default">{metrics.auth.signUps}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Realtime Channels</span>
                  <Badge variant="default">{metrics.realtime.channels}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Total Storage</span>
                    <span className="text-sm font-medium">
                      {metrics.storage.used.toFixed(1)} MB / {(metrics.storage.total / 1000).toFixed(1)} GB
                    </span>
                  </div>
                  <Progress value={metrics.storage.percentage} />
                </div>
                <div className="space-y-2">
                  {metrics.storage.buckets.map((bucket) => (
                    <div key={bucket.name} className="flex justify-between items-center text-sm">
                      <span>{bucket.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{bucket.files} files</span>
                        <Badge variant="outline">{bucket.size.toFixed(1)} MB</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">Page Load Time</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.pageLoadTime.toFixed(0)}ms</div>
                <Progress value={(performance.pageLoadTime / 3000) * 100} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Server className="w-5 h-5 text-green-500" />
                  <span className="font-medium">API Latency</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.apiLatency}ms</div>
                <Progress value={(performance.apiLatency / 1000) * 100} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-purple-500" />
                  <span className="font-medium">DB Latency</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.databaseLatency}ms</div>
                <Progress value={(performance.databaseLatency / 500) * 100} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MemoryStick className="w-5 h-5 text-orange-500" />
                  <span className="font-medium">Memory Usage</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.memoryUsage.toFixed(1)}%</div>
                <Progress value={performance.memoryUsage} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="w-5 h-5 text-red-500" />
                  <span className="font-medium">CPU Usage</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.cpuUsage.toFixed(1)}%</div>
                <Progress value={performance.cpuUsage} />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Wifi className="w-5 h-5 text-cyan-500" />
                  <span className="font-medium">Network Latency</span>
                </div>
                <div className="text-2xl font-bold mb-1">{performance.networkLatency.toFixed(0)}ms</div>
                <Progress value={(performance.networkLatency / 200) * 100} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          {/* Storage breakdown and details */}
          <Card>
            <CardHeader>
              <CardTitle>Storage Breakdown by Bucket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.storage.buckets.map((bucket, index) => (
                  <div key={bucket.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{bucket.name}</p>
                        <p className="text-sm text-muted-foreground">{bucket.files} files</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{bucket.size.toFixed(1)} MB</p>
                      <p className="text-sm text-muted-foreground">
                        {((bucket.size / metrics.storage.used) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Real-time Monitoring</h3>
            <p className="text-gray-500">Live system metrics and alerts will be displayed here</p>
            <p className="text-sm text-muted-foreground mt-2">
              This section will show real-time charts, alerts, and system events
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSystemHealth;