import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle,
  Flag,
  Search,
  Eye,
  Check,
  X,
  Clock,
  MessageSquare,
  User,
  Shield,
  Calendar,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Report {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
  post?: {
    content: string;
    user_id: string;
    created_at: string;
  };
  reporter?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  post_author?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface ReportStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  dismissed: number;
}

const AdminReportsManagement = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const { data: reportsData, error } = await supabase
        .from('post_reports')
        .select(`
          *,
          posts!inner(content, user_id, created_at)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch reporter and post author profiles
      const reportsWithProfiles = await Promise.all(
        (reportsData || []).map(async (report) => {
          const [reporterProfile, authorProfile] = await Promise.all([
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', report.reporter_id)
              .single(),
            supabase
              .from('profiles')
              .select('username, display_name, avatar_url')
              .eq('id', report.posts.user_id)
              .single()
          ]);

          return {
            ...report,
            post: {
              content: report.posts.content,
              user_id: report.posts.user_id,
              created_at: report.posts.created_at
            },
            reporter: reporterProfile.data,
            post_author: authorProfile.data
          };
        })
      );

      setReports(reportsWithProfiles);
      calculateStats(reportsWithProfiles);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: Report[]) => {
    const newStats: ReportStats = {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      reviewed: data.filter(r => r.status === 'reviewed').length,
      resolved: data.filter(r => r.status === 'resolved').length,
      dismissed: data.filter(r => r.status === 'dismissed').length
    };
    setStats(newStats);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: 'reviewed' | 'resolved' | 'dismissed') => {
    try {
      const updates = {
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null
      };

      const { error } = await supabase
        .from('post_reports')
        .update(updates)
        .eq('id', reportId);

      if (error) throw error;

      setReports(prev => prev.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      ));

      calculateStats(reports.map(report => 
        report.id === reportId ? { ...report, ...updates } : report
      ));

      setSelectedReport(null);
      setAdminNotes('');
      
      toast({
        title: "Report updated",
        description: `Report status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="default"><Eye className="w-3 h-3 mr-1" />Reviewed</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-600"><Check className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="outline"><X className="w-3 h-3 mr-1" />Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      'spam': 'bg-orange-500',
      'harassment': 'bg-red-500',
      'hate_speech': 'bg-red-600',
      'inappropriate_content': 'bg-yellow-500',
      'misinformation': 'bg-purple-500',
      'copyright': 'bg-blue-500',
      'other': 'bg-gray-500'
    };
    
    return (
      <Badge className={colors[reason] || 'bg-gray-500'}>
        {reason.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.reporter?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.post_author?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.details?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesReason = reasonFilter === 'all' || report.reason === reasonFilter;
    
    return matchesSearch && matchesStatus && matchesReason;
  });

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.reviewed}</p>
                <p className="text-sm text-muted-foreground">Reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.dismissed}</p>
                <p className="text-sm text-muted-foreground">Dismissed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Content Reports Management
          </CardTitle>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={reasonFilter} onValueChange={setReasonFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="inappropriate_content">Inappropriate</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="copyright">Copyright</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {loading ? (
              <div className="text-center py-12">
                <Flag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Loading reports...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={report.reporter?.avatar_url || ''} />
                        <AvatarFallback>
                          {report.reporter?.display_name?.[0] || report.reporter?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {report.reporter?.display_name || report.reporter?.username || 'Unknown User'}
                          </span>
                          <span className="text-muted-foreground">reported</span>
                          <span className="font-medium">
                            {report.post_author?.display_name || report.post_author?.username || 'Unknown User'}
                          </span>
                          {getReasonBadge(report.reason)}
                          {getStatusBadge(report.status)}
                        </div>
                        
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 mb-2">
                          <p className="text-sm font-medium mb-1">Reported Content:</p>
                          <p className="text-sm">{report.post?.content || 'Content not available'}</p>
                        </div>
                        
                        {report.details && (
                          <div className="mb-2">
                            <p className="text-sm font-medium">Report Details:</p>
                            <p className="text-sm text-muted-foreground">{report.details}</p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Reported: {new Date(report.created_at).toLocaleString()}</span>
                          {report.reviewed_at && (
                            <span>Reviewed: {new Date(report.reviewed_at).toLocaleString()}</span>
                          )}
                        </div>
                        
                        {report.admin_notes && (
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <p className="text-sm font-medium">Admin Notes:</p>
                            <p className="text-sm">{report.admin_notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {report.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl m-4">
            <CardHeader>
              <CardTitle>Review Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium mb-2">Reported Content:</p>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-3">
                  {selectedReport.post?.content}
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Report Reason:</p>
                {getReasonBadge(selectedReport.reason)}
              </div>
              
              {selectedReport.details && (
                <div>
                  <p className="font-medium mb-2">Additional Details:</p>
                  <p className="text-sm">{selectedReport.details}</p>
                </div>
              )}
              
              <div>
                <p className="font-medium mb-2">Admin Notes:</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedReport.id, 'dismissed')}
                >
                  <X className="w-4 h-4 mr-1" />
                  Dismiss
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedReport.id, 'resolved')}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminReportsManagement;