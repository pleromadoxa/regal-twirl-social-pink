
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, 
  Trash2, 
  Pause, 
  Play, 
  Shield, 
  AlertTriangle,
  UserX,
  Clock
} from 'lucide-react';

interface BusinessAccountManagementProps {
  businessPage: any;
  onUpdate?: (updates: any) => void;
}

const BusinessAccountManagement = ({ businessPage, onUpdate }: BusinessAccountManagementProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState('7');
  const [loading, setLoading] = useState(false);

  const handleSuspendAccount = async () => {
    if (!suspensionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for suspension",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const suspendUntil = new Date();
      suspendUntil.setDate(suspendUntil.getDate() + parseInt(suspensionDuration));

      const updates = {
        is_active: false,
        suspension_reason: suspensionReason,
        suspended_until: suspendUntil.toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_pages')
        .update(updates)
        .eq('id', businessPage.id);

      if (error) throw error;

      toast({
        title: "Account suspended",
        description: `Business account suspended for ${suspensionDuration} days`,
      });

      setSuspendDialogOpen(false);
      setSuspensionReason('');
      onUpdate?.(updates);
    } catch (error) {
      console.error('Error suspending account:', error);
      toast({
        title: "Error",
        description: "Failed to suspend account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAccount = async () => {
    setLoading(true);
    try {
      const updates = {
        is_active: true,
        suspension_reason: null,
        suspended_until: null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_pages')
        .update(updates)
        .eq('id', businessPage.id);

      if (error) throw error;

      toast({
        title: "Account activated",
        description: "Business account has been reactivated",
      });

      onUpdate?.(updates);
    } catch (error) {
      console.error('Error activating account:', error);
      toast({
        title: "Error",
        description: "Failed to activate account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // Delete related data first
      await Promise.all([
        supabase.from('business_products').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_orders').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_messages').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_services').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_bookings').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_invoices').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_earnings').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_ads').delete().eq('business_page_id', businessPage.id),
        supabase.from('business_page_follows').delete().eq('page_id', businessPage.id)
      ]);

      // Delete the business page
      const { error } = await supabase
        .from('business_pages')
        .delete()
        .eq('id', businessPage.id);

      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Business account and all associated data have been permanently deleted",
      });

      navigate('/business-management');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccountStatus = () => {
    if (!businessPage.is_active) {
      if (businessPage.suspended_until) {
        const suspendedUntil = new Date(businessPage.suspended_until);
        const now = new Date();
        if (suspendedUntil > now) {
          return {
            status: 'suspended',
            label: 'Suspended',
            color: 'destructive' as const,
            icon: <UserX className="w-4 h-4" />,
            description: `Suspended until ${suspendedUntil.toLocaleDateString()}`
          };
        }
      }
      return {
        status: 'inactive',
        label: 'Inactive',
        color: 'secondary' as const,
        icon: <Pause className="w-4 h-4" />,
        description: 'Account is inactive'
      };
    }
    return {
      status: 'active',
      label: 'Active',
      color: 'default' as const,
      icon: <Play className="w-4 h-4" />,
      description: 'Account is active and operational'
    };
  };

  const accountStatus = getAccountStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Account Management</h2>
        <p className="text-muted-foreground">Manage your business account settings and status</p>
      </div>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Account Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant={accountStatus.color} className="flex items-center gap-1">
                {accountStatus.icon}
                {accountStatus.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {accountStatus.description}
              </span>
            </div>
            {accountStatus.status === 'suspended' || accountStatus.status === 'inactive' ? (
              <Button 
                onClick={handleActivateAccount}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Activate Account
              </Button>
            ) : (
              <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Pause className="w-4 h-4 mr-2" />
                    Suspend Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Suspend Business Account</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Suspension Duration</label>
                      <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Day</SelectItem>
                          <SelectItem value="7">7 Days</SelectItem>
                          <SelectItem value="30">30 Days</SelectItem>
                          <SelectItem value="90">90 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reason for Suspension</label>
                      <Textarea
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder="Enter reason for suspension..."
                        className="mt-1"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSuspendAccount}
                        disabled={loading || !suspensionReason.trim()}
                        variant="destructive"
                      >
                        Suspend Account
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          {businessPage.suspension_reason && (
            <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Suspension Reason
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {businessPage.suspension_reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Account Type:</span>
              <span className="ml-2 capitalize">{businessPage.page_type}</span>
            </div>
            <div>
              <span className="font-medium">Business Type:</span>
              <span className="ml-2">{businessPage.business_type || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <span className="ml-2">{new Date(businessPage.created_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <span className="ml-2">{new Date(businessPage.updated_at).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Followers:</span>
              <span className="ml-2">{businessPage.followers_count || 0}</span>
            </div>
            <div>
              <span className="font-medium">Verification:</span>
              <span className="ml-2">
                {businessPage.is_verified ? (
                  <Badge variant="default">Verified</Badge>
                ) : (
                  <Badge variant="secondary">Unverified</Badge>
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                Permanently delete this business account and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the business account
                      "{businessPage.page_name}" and remove all associated data including products, orders, 
                      messages, and analytics.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={loading}
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessAccountManagement;
