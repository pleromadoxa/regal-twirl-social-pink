
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';

interface BusinessProfileUpdateProps {
  businessPage: any;
  onUpdate: () => void;
}

const BusinessProfileUpdate = ({ businessPage, onUpdate }: BusinessProfileUpdateProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    page_name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    avatar_url: '',
    banner_url: '',
    page_type: 'business'
  });

  useEffect(() => {
    if (businessPage) {
      setFormData({
        page_name: businessPage.page_name || '',
        description: businessPage.description || '',
        email: businessPage.email || '',
        phone: businessPage.phone || '',
        website: businessPage.website || '',
        address: businessPage.address || '',
        avatar_url: businessPage.avatar_url || businessPage.page_avatar_url || '',
        banner_url: businessPage.banner_url || businessPage.page_banner_url || '',
        page_type: businessPage.page_type || 'business'
      });
    }
  }, [businessPage]);

  const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!file || !businessPage) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${businessPage.id}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `business-${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(`business-${type}s`)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(`business-${type}s`)
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        [`${type}_url`]: publicUrl
      }));

      toast({
        title: "Success",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`
      });
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${type}`,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessPage) return;

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        page_avatar_url: formData.avatar_url,
        page_banner_url: formData.banner_url,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('business_pages')
        .update(updateData)
        .eq('id', businessPage.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={formData.avatar_url} />
                <AvatarFallback>
                  {formData.page_name?.charAt(0)?.toUpperCase() || 'B'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" disabled={uploading}>
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Avatar'}
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'avatar');
                    }}
                  />
                </Label>
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-4">
            <Label>Banner Image</Label>
            <div className="space-y-2">
              {formData.banner_url && (
                <img 
                  src={formData.banner_url} 
                  alt="Banner" 
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <Label htmlFor="banner-upload" className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" disabled={uploading}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Banner'}
                </Button>
                <input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'banner');
                  }}
                />
              </Label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page_name">Business Name *</Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => setFormData(prev => ({ ...prev, page_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="page_type">Page Type</Label>
              <Select 
                value={formData.page_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessProfileUpdate;
