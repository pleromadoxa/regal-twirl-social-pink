
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Server, 
  Ticket, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface ITServicesDashboardProps {
  businessPage: any;
}

const ITServicesDashboard = ({ businessPage }: ITServicesDashboardProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [businessPage.id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch services
      const { data: servicesData } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      // Mock tickets data (using business_messages as placeholder)
      const { data: messagesData } = await supabase
        .from('business_messages')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setServices(servicesData || []);
      setTickets(messagesData || []);
      
      // Calculate analytics
      const totalRevenue = servicesData?.reduce((sum, service) => sum + (service.price || 0), 0) || 0;
      const activeServices = servicesData?.filter(s => s.is_active).length || 0;
      const openTickets = messagesData?.filter(m => !m.is_read).length || 0;

      setAnalytics({
        totalRevenue,
        activeServices,
        totalServices: servicesData?.length || 0,
        openTickets
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">From all services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeServices || 0}</div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="w-4 h-4 text-purple-600" />
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.openTickets || 0}</div>
            <p className="text-xs text-muted-foreground">Pending support</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4 text-orange-600" />
              Total Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalServices || 0}</div>
            <p className="text-xs text-muted-foreground">All services</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            IT Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{service.name}</h4>
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-600">${service.price || 0}</span>
                    <span className="text-sm text-muted-foreground">
                      {service.duration_minutes ? `${service.duration_minutes} min` : 'Custom'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Server className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No IT services yet. Add your first service to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Recent Support Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">Support Request #{ticket.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{ticket.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={ticket.is_read ? 'outline' : 'destructive'}>
                      {ticket.is_read ? 'Resolved' : 'Open'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No support requests yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ITServicesDashboard;
