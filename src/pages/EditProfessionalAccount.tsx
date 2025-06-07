
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import { supabase } from '@/integrations/supabase/client';

const EditProfessionalAccount = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [formData, setFormData] = useState({
    page_name: '',
    page_type: 'business',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    avatar_url: '',
    banner_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (pageId && myPages.length > 0) {
      const page = myPages.find(p => p.id === pageId);
      if (page) {
        setFormData({
          page_name: page.page_name || '',
          page_type: page.page_type || 'business',
          description: page.description || '',
          email: page.email || '',
          phone: page.phone || '',
          website: page.website || '',
          address: page.address || '',
          avatar_url: page.avatar_url || '',
          banner_url: page.banner_url || ''
        });
        setLoading(false);
      } else {
        toast({
          title: "Page not found",
          description: "This professional account doesn't exist or you don't have permission to edit it.",
          variant: "destructive"
        });
        navigate('/professional-accounts');
      }
    }
  }, [user, pageId, myPages, navigate, toast]);

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${user?.id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const url = await uploadFile(file, 'avatars', 'business-pages');
      setFormData(prev => ({ ...prev, avatar_url: url }));
      toast({
        title: "Avatar uploaded",
        description: "Profile picture has been updated."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture.",
        variant: "destructive"
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const url = await uploadFile(file, 'banners', 'business-pages');
      setFormData(prev => ({ ...prev, banner_url: url }));
      toast({
        title: "Banner uploaded",
        description: "Cover image has been updated."
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload cover image.",
        variant: "destructive"
      });
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_pages')
        .update({
          page_name: formData.page_name,
          page_type: formData.page_type,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          avatar_url: formData.avatar_url,
          banner_url: formData.banner_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', pageId)
        .eq('owner_id', user?.id);

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Your professional account has been updated successfully."
      });

      navigate('/professional-accounts');
    } catch (error) {
      console.error('Error updating page:', error);
      toast({
        title: "Update failed",
        description: "Failed to update professional account.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/professional-accounts')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Edit Professional Account
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Update your professional account information
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Banner Upload */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg overflow-hidden">
                    {formData.banner_url ? (
                      <img 
                        src={formData.banner_url} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <label htmlFor="banner-upload">
                      <Button
                        type="button"
                        size="sm"
                        disabled={uploadingBanner}
                        className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                        asChild
                      >
                        <span className="cursor-pointer">
                          {uploadingBanner ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Avatar */}
                  <div className="absolute -bottom-16 left-6">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-800">
                        <AvatarImage src={formData.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                          {formData.page_name[0]?.toUpperCase() || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <label htmlFor="avatar-upload">
                        <Button
                          type="button"
                          size="sm"
                          disabled={uploadingAvatar}
                          className="absolute bottom-2 right-2 rounded-full w-8 h-8 p-0"
                          asChild
                        >
                          <span className="cursor-pointer">
                            {uploadingAvatar ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                            ) : (
                              <Upload className="w-3 h-3" />
                            )}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Page Name *</label>
                    <Input
                      value={formData.page_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, page_name: e.target.value }))}
                      placeholder="Enter page name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Page Type *</label>
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
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your professional account..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Business St, City, State 12345"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving || !formData.page_name.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfessionalAccount;
