
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Crown, Building, Briefcase, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  is_verified: boolean;
  verification_level?: string;
  verification_notes?: string;
}

interface UserVerificationDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (userId: string, updates: any) => void;
}

const UserVerificationDialog = ({ user, isOpen, onClose, onUpdate }: UserVerificationDialogProps) => {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [verificationLevel, setVerificationLevel] = useState(user?.verification_level || 'none');
  const [notes, setNotes] = useState(user?.verification_notes || '');
  const [loading, setLoading] = useState(false);

  const verificationOptions = [
    { value: 'none', label: 'No Verification', icon: X, color: 'text-gray-500' },
    { value: 'verified', label: 'Verified', icon: Shield, color: 'text-blue-600' },
    { value: 'professional', label: 'Professional', icon: Briefcase, color: 'text-purple-600' },
    { value: 'business', label: 'Business', icon: Building, color: 'text-green-600' },
    { value: 'vip', label: 'VIP', icon: Crown, color: 'text-yellow-600' }
  ];

  const handleSave = async () => {
    if (!user || !currentUser) return;

    setLoading(true);
    try {
      const isRevoking = verificationLevel === 'none' || verificationLevel === '';
      const updates = {
        verification_level: isRevoking ? null : verificationLevel,
        verification_notes: notes || null,
        is_verified: !isRevoking,
        verified_at: !isRevoking ? new Date().toISOString() : null,
        verified_by: !isRevoking ? currentUser.id : null
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      onUpdate(user.id, { ...user, ...updates });
      onClose();

      toast({
        title: "Verification updated",
        description: `User verification has been ${isRevoking ? 'revoked' : 'updated'} successfully.`
      });
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: "Error",
        description: "Failed to update user verification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Set initial verification level when dialog opens
  React.useEffect(() => {
    if (user && isOpen) {
      setVerificationLevel(user.verification_level || 'none');
      setNotes(user.verification_notes || '');
    }
  }, [user, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Manage Verification
          </DialogTitle>
        </DialogHeader>
        
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                {user.display_name?.[0] || user.username?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold">{user.display_name || user.username}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-level">Verification Level</Label>
              <Select value={verificationLevel} onValueChange={setVerificationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification level" />
                </SelectTrigger>
                <SelectContent>
                  {verificationOptions
                    .filter(option => 
                      option && 
                      option.value && 
                      option.label && 
                      typeof option.value === 'string' && 
                      typeof option.label === 'string' &&
                      option.value.trim() !== '' && 
                      option.label.trim() !== ''
                    )
                    .map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${option.color}`} />
                            <span>{option.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this verification..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserVerificationDialog;
