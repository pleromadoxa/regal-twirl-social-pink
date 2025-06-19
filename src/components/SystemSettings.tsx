
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, PlusCircle, RefreshCw, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SystemSetting>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSetting, setNewSetting] = useState<Partial<SystemSetting>>({
    setting_key: '',
    setting_value: '',
    setting_type: 'string',
    description: '',
    is_public: false
  });
  const [activeTab, setActiveTab] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        throw error;
      }

      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error fetching settings",
        description: "Failed to load system settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleEdit = (setting: SystemSetting) => {
    setEditingId(setting.id);
    let formattedValue = setting.setting_value;

    // Make sure we display JSON properly in the editor
    if (setting.setting_type === 'object' || setting.setting_type === 'array') {
      try {
        if (typeof formattedValue === 'string') {
          formattedValue = JSON.parse(formattedValue);
        }
        formattedValue = JSON.stringify(formattedValue, null, 2);
      } catch (e) {
        console.error('Error parsing JSON value:', e);
      }
    }

    setEditForm({
      ...setting,
      setting_value: formattedValue
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async (id: string) => {
    try {
      let valueToSave = editForm.setting_value;

      // Parse JSON if needed
      if (editForm.setting_type === 'object' || editForm.setting_type === 'array') {
        try {
          if (typeof valueToSave === 'string') {
            valueToSave = JSON.parse(valueToSave);
          }
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "The value must be valid JSON for object or array types",
            variant: "destructive"
          });
          return;
        }
      } else if (editForm.setting_type === 'number') {
        const num = Number(valueToSave);
        if (isNaN(num)) {
          toast({
            title: "Invalid number",
            description: "The value must be a valid number",
            variant: "destructive"
          });
          return;
        }
        valueToSave = num;
      } else if (editForm.setting_type === 'boolean') {
        if (valueToSave === 'true') valueToSave = true;
        else if (valueToSave === 'false') valueToSave = false;
        else {
          toast({
            title: "Invalid boolean",
            description: "The value must be true or false",
            variant: "destructive"
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('system_settings')
        .update({ 
          setting_value: valueToSave,
          is_public: editForm.is_public,
          description: editForm.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      toast({
        title: "Setting updated",
        description: "The system setting has been updated successfully"
      });

      setEditingId(null);
      setEditForm({});
      fetchSettings();
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Update failed",
        description: "Failed to update system setting",
        variant: "destructive"
      });
    }
  };

  const handleCreateSetting = async () => {
    try {
      if (!newSetting.setting_key || !newSetting.setting_value || !newSetting.setting_type) {
        toast({
          title: "Missing fields",
          description: "Please fill out all required fields",
          variant: "destructive"
        });
        return;
      }

      let valueToSave = newSetting.setting_value;

      // Parse JSON if needed
      if (newSetting.setting_type === 'object' || newSetting.setting_type === 'array') {
        try {
          if (typeof valueToSave === 'string') {
            valueToSave = JSON.parse(valueToSave);
          }
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "The value must be valid JSON for object or array types",
            variant: "destructive"
          });
          return;
        }
      } else if (newSetting.setting_type === 'number') {
        const num = Number(valueToSave);
        if (isNaN(num)) {
          toast({
            title: "Invalid number",
            description: "The value must be a valid number",
            variant: "destructive"
          });
          return;
        }
        valueToSave = num;
      } else if (newSetting.setting_type === 'boolean') {
        if (valueToSave === 'true') valueToSave = true;
        else if (valueToSave === 'false') valueToSave = false;
        else {
          toast({
            title: "Invalid boolean",
            description: "The value must be true or false",
            variant: "destructive"
          });
          return;
        }
      }

      const { data, error } = await supabase
        .from('system_settings')
        .insert({
          setting_key: newSetting.setting_key,
          setting_value: valueToSave,
          setting_type: newSetting.setting_type,
          description: newSetting.description,
          is_public: newSetting.is_public || false
        })
        .select();

      if (error) throw error;

      toast({
        title: "Setting created",
        description: "New system setting has been added successfully"
      });

      setCreateDialogOpen(false);
      setNewSetting({
        setting_key: '',
        setting_value: '',
        setting_type: 'string',
        description: '',
        is_public: false
      });
      fetchSettings();
    } catch (error) {
      console.error('Error creating setting:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create system setting",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSetting = async (id: string) => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Setting deleted",
        description: "The system setting has been deleted successfully"
      });

      setConfirmDeleteId(null);
      fetchSettings();
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete system setting",
        variant: "destructive"
      });
    }
  };

  const formatValue = (value: any, type: string) => {
    if (value === null || value === undefined) return 'null';
    
    if (type === 'object' || type === 'array') {
      try {
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        return JSON.stringify(value);
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  const getDisplayValue = (setting: SystemSetting) => {
    const value = setting.setting_value;
    
    if (setting.setting_type === 'boolean') {
      return value === true ? 'true' : 'false';
    }
    
    if (setting.setting_type === 'object' || setting.setting_type === 'array') {
      try {
        let jsonValue = value;
        if (typeof value === 'string') {
          jsonValue = JSON.parse(value);
        }
        return JSON.stringify(jsonValue);
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  const filteredSettings = settings.filter(setting => {
    if (activeTab === 'all') return true;
    if (activeTab === 'public') return setting.is_public;
    if (activeTab === 'private') return !setting.is_public;
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>
              Global configuration for the application
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchSettings} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Setting
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New System Setting</DialogTitle>
                  <DialogDescription>
                    Add a new configuration setting to the application
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="key" className="text-right">
                      Key*
                    </Label>
                    <Input
                      id="key"
                      className="col-span-3"
                      value={newSetting.setting_key || ''}
                      onChange={(e) => setNewSetting({...newSetting, setting_key: e.target.value})}
                      placeholder="setting_name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type*
                    </Label>
                    <Select 
                      value={newSetting.setting_type} 
                      onValueChange={(value) => setNewSetting({...newSetting, setting_type: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="object">Object (JSON)</SelectItem>
                        <SelectItem value="array">Array (JSON)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                      Value*
                    </Label>
                    <Textarea
                      id="value"
                      className="col-span-3 min-h-[100px]"
                      value={newSetting.setting_value || ''}
                      onChange={(e) => setNewSetting({...newSetting, setting_value: e.target.value})}
                      placeholder={
                        newSetting.setting_type === 'object' ? '{"key": "value"}' :
                        newSetting.setting_type === 'array' ? '["item1", "item2"]' :
                        newSetting.setting_type === 'boolean' ? 'true or false' :
                        newSetting.setting_type === 'number' ? '123' : 'value'
                      }
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      className="col-span-3"
                      value={newSetting.description || ''}
                      onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                      placeholder="Setting description"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="public" className="text-right">
                      Public
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Switch
                        id="public"
                        checked={newSetting.is_public || false}
                        onCheckedChange={(checked) => setNewSetting({...newSetting, is_public: checked})}
                      />
                      <span className="text-sm text-gray-500">
                        Make this setting accessible to non-admin users
                      </span>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSetting}>
                    Create Setting
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList>
            <TabsTrigger value="all">All Settings</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Key</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Type</TableHead>
                <TableHead className="w-[100px]">Visibility</TableHead>
                <TableHead className="w-[200px]">Description</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading settings...
                  </TableCell>
                </TableRow>
              ) : filteredSettings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No settings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSettings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">
                      {setting.setting_key}
                    </TableCell>
                    <TableCell>
                      {editingId === setting.id ? (
                        <Textarea
                          value={editForm.setting_value || ''}
                          onChange={(e) => setEditForm({...editForm, setting_value: e.target.value})}
                          className="min-h-[100px] font-mono text-sm"
                        />
                      ) : (
                        <div className="max-w-[400px] overflow-hidden text-ellipsis font-mono text-sm">
                          {getDisplayValue(setting)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={editingId === setting.id ? "outline" : "secondary"}>
                        {setting.setting_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === setting.id ? (
                        <div className="flex items-center">
                          <Switch
                            checked={editForm.is_public || false}
                            onCheckedChange={(checked) => setEditForm({...editForm, is_public: checked})}
                          />
                        </div>
                      ) : (
                        <Badge variant={setting.is_public ? "default" : "outline"}>
                          {setting.is_public ? (
                            <><Eye className="w-3 h-3 mr-1" /> Public</>
                          ) : (
                            <><EyeOff className="w-3 h-3 mr-1" /> Private</>
                          )}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === setting.id ? (
                        <Input
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                          placeholder="Description"
                        />
                      ) : (
                        setting.description || <span className="text-gray-400 italic">No description</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === setting.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelEdit()}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSave(setting.id)}
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(setting)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Dialog
                            open={confirmDeleteId === setting.id}
                            onOpenChange={(open) => {
                              if (!open) setConfirmDeleteId(null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => setConfirmDeleteId(setting.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete System Setting</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete the setting "<strong>{setting.setting_key}</strong>"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={() => handleDeleteSetting(setting.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
