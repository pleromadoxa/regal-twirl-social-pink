import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download,
  FileText,
  Database,
  Users,
  MessageSquare,
  Music,
  Image,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExportJob {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

const AdminDataExport = () => {
  const { toast } = useToast();
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);

  const availableTables = [
    { id: 'profiles', name: 'User Profiles', icon: Users, description: 'User account information and profiles' },
    { id: 'posts', name: 'Posts', icon: MessageSquare, description: 'All user posts and content' },
    { id: 'messages', name: 'Messages', icon: MessageSquare, description: 'Private messages between users' },
    { id: 'music_tracks', name: 'Music Tracks', icon: Music, description: 'Uploaded music files and metadata' },
    { id: 'gallery_items', name: 'Gallery Items', icon: Image, description: 'User gallery images and media' },
    { id: 'transactions', name: 'Transactions', icon: Database, description: 'Payment and subscription data' },
    { id: 'post_reports', name: 'Content Reports', icon: AlertCircle, description: 'User-reported content violations' },
    { id: 'business_pages', name: 'Business Pages', icon: Users, description: 'Business account information' }
  ];

  const handleTableSelection = (tableId: string, checked: boolean) => {
    if (checked) {
      setSelectedTables(prev => [...prev, tableId]);
    } else {
      setSelectedTables(prev => prev.filter(id => id !== tableId));
    }
  };

  const handleExport = async () => {
    if (selectedTables.length === 0) {
      toast({
        title: "No tables selected",
        description: "Please select at least one table to export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const newJob: ExportJob = {
        id: `export_${Date.now()}`,
        type: `${selectedTables.join(', ')} (${exportFormat.toUpperCase()})`,
        status: 'processing',
        progress: 0,
        createdAt: new Date()
      };

      setExportJobs(prev => [newJob, ...prev]);

      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportJobs(prev => prev.map(job => {
          if (job.id === newJob.id && job.progress < 100) {
            const newProgress = Math.min(job.progress + Math.random() * 20, 100);
            return { ...job, progress: newProgress };
          }
          return job;
        }));
      }, 500);

      // Mock export process
      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(progressInterval);

      // Complete the job
      setExportJobs(prev => prev.map(job => {
        if (job.id === newJob.id) {
          return {
            ...job,
            status: 'completed',
            progress: 100,
            completedAt: new Date(),
            downloadUrl: '#' // In real implementation, this would be a download URL
          };
        }
        return job;
      }));

      toast({
        title: "Export completed",
        description: "Your data export is ready for download",
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting your data",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="default"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Export Center</h2>
          <p className="text-muted-foreground">Export platform data for backup, analysis, or compliance</p>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Create Export</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select Data to Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTables.map((table) => {
                      const IconComponent = table.icon;
                      return (
                        <div key={table.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            id={table.id}
                            checked={selectedTables.includes(table.id)}
                            onCheckedChange={(checked) => handleTableSelection(table.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <IconComponent className="w-4 h-4 text-gray-500" />
                              <label htmlFor={table.id} className="font-medium cursor-pointer">
                                {table.name}
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground">{table.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Export Format</label>
                      <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                          <SelectItem value="json">JSON (JavaScript Object)</SelectItem>
                          <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date Range</label>
                      <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                          <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                          <SelectItem value="last_year">Last Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Summary */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Selected Tables</span>
                      <Badge variant="outline">{selectedTables.length}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Format</span>
                      <Badge variant="outline">{exportFormat.toUpperCase()}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Date Range</span>
                      <Badge variant="outline">{dateFilter.replace('_', ' ')}</Badge>
                    </div>
                  </div>

                  {selectedTables.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-2">Selected Data:</h4>
                      <div className="space-y-1">
                        {selectedTables.map((tableId) => {
                          const table = availableTables.find(t => t.id === tableId);
                          return (
                            <div key={tableId} className="text-sm text-muted-foreground">
                              • {table?.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={handleExport} 
                    disabled={selectedTables.length === 0 || isExporting}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? 'Exporting...' : 'Start Export'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
            </CardHeader>
            <CardContent>
              {exportJobs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No export history yet</p>
                  <p className="text-sm text-muted-foreground">Your completed exports will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportJobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{job.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {job.createdAt.toLocaleString()}
                          </p>
                        </div>
                        {getStatusBadge(job.status)}
                      </div>

                      {job.status === 'processing' && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm">{Math.round(job.progress)}%</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                      )}

                      {job.status === 'completed' && job.downloadUrl && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}

                      {job.error && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600">
                          {job.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Exports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Scheduled Exports</h3>
                <p className="text-gray-500">Set up automatic data exports for regular backups</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Feature coming soon - schedule daily, weekly, or monthly exports
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDataExport;