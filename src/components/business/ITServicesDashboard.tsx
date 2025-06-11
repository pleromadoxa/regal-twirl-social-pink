
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Shield, 
  Wrench, 
  Users, 
  Clock,
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
  const [projects, setProjects] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const { toast } = useToast();

  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client_name: '',
    client_email: '',
    status: 'planning',
    priority: 'medium',
    estimated_hours: '',
    hourly_rate: '',
    start_date: '',
    deadline: ''
  });

  useEffect(() => {
    fetchData();
  }, [businessPage.id]);

  const fetchData = async () => {
    try {
      // Fetch IT projects
      const { data: projectsData } = await supabase
        .from('business_projects')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      // Fetch support tickets
      const { data: ticketsData } = await supabase
        .from('business_tickets')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      // Fetch IT services
      const { data: servicesData } = await supabase
        .from('business_services')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('category', 'it-services');

      setProjects(projectsData || []);
      setTickets(ticketsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching IT data:', error);
    }
  };

  const createProject = async () => {
    try {
      const { error } = await supabase
        .from('business_projects')
        .insert({
          business_page_id: businessPage.id,
          ...projectForm,
          estimated_hours: parseInt(projectForm.estimated_hours) || 0,
          hourly_rate: parseFloat(projectForm.hourly_rate) || 0
        });

      if (error) throw error;

      toast({
        title: "Project Created",
        description: "New IT project has been created successfully."
      });

      setShowProjectDialog(false);
      setProjectForm({
        name: '',
        description: '',
        client_name: '',
        client_email: '',
        status: 'planning',
        priority: 'medium',
        estimated_hours: '',
        hourly_rate: '',
        start_date: '',
        deadline: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'on-hold': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'in-progress').length}
            </div>
            <p className="text-xs text-muted-foreground">Currently working on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="w-4 h-4 text-orange-600" />
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tickets.filter(t => t.status !== 'resolved').length}
            </div>
            <p className="text-xs text-muted-foreground">Support requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(projects.map(p => p.client_email)).size}
            </div>
            <p className="text-xs text-muted-foreground">Unique clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              IT Projects
            </CardTitle>
            <Dialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New IT Project</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-name">Project Name</Label>
                    <Input
                      id="project-name"
                      value={projectForm.name}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={projectForm.client_name}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, client_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Client Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={projectForm.client_email}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, client_email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={projectForm.status} onValueChange={(value) => setProjectForm(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={projectForm.priority} onValueChange={(value) => setProjectForm(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimated-hours">Estimated Hours</Label>
                    <Input
                      id="estimated-hours"
                      type="number"
                      value={projectForm.estimated_hours}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, estimated_hours: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                    <Input
                      id="hourly-rate"
                      type="number"
                      step="0.01"
                      value={projectForm.hourly_rate}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={projectForm.start_date}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={projectForm.deadline}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={createProject} className="flex-1">
                    Create Project
                  </Button>
                  <Button variant="outline" onClick={() => setShowProjectDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {getStatusIcon(project.status)}
                        {project.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Client: {project.client_name} • {project.client_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                      <Badge variant="outline">{project.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Est. {project.estimated_hours}h @ ${project.hourly_rate}/h</span>
                    <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No IT projects yet. Create your first project to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            IT Services Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Code, name: 'Web Development', description: 'Custom websites and web applications' },
              { icon: Server, name: 'Server Management', description: 'Cloud and on-premise server setup' },
              { icon: Shield, name: 'Cybersecurity', description: 'Security audits and implementation' },
              { icon: Wrench, name: 'IT Support', description: '24/7 technical support services' }
            ].map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <service.icon className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold">{service.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ITServicesDashboard;
