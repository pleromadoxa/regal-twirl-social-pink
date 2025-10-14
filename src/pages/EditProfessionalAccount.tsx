
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
import ImageUpload from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';

const EditProfessionalAccount = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        navigate('/professional');
      }
    }
  }, [user, pageId, myPages, navigate, toast]);

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

      navigate(`/professional/${pageId}`);
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

  const handleAvatarUpload = (url: string) => {
    setFormData(prev => ({ ...prev, avatar_url: url }));
  };

  const handleBannerUpload = (url: string) => {
    setFormData(prev => ({ ...prev, banner_url: url }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className={`flex-1 ${isMobile ? 'px-2' : 'ml-80'} flex items-center justify-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        {!isMobile && <RightSidebar />}
        {isMobile && <MobileBottomNav />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : ''}`} style={isMobile ? {} : { marginLeft: '320px' }}>
        <main className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Header */}
          <div className={`sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 ${isMobile ? 'p-3' : 'p-6'} z-10`}>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/professional/${pageId}`)}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent`}>
                  Edit Professional Account
                </h1>
                <p className={`text-slate-600 dark:text-slate-400 ${isMobile ? 'text-xs mt-0.5' : 'mt-1'}`}>
                  Update your professional account information
                </p>
              </div>
            </div>
          </div>

          <div className={`${isMobile ? 'p-3' : 'p-6'} max-w-4xl mx-auto`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Banner Upload */}
              <Card>
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="space-y-4">
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Banner Image</h3>
                    <ImageUpload
                      currentImageUrl={formData.banner_url}
                      onImageUpload={handleBannerUpload}
                      bucketName="business-banners"
                      folder="banners"
                      className="w-full"
                      isAvatar={false}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Avatar Upload */}
              <Card>
                <CardContent className={isMobile ? 'p-4' : 'p-6'}>
                  <div className="space-y-4">
                    <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Profile Picture</h3>
                    <ImageUpload
                      currentImageUrl={formData.avatar_url}
                      onImageUpload={handleAvatarUpload}
                      bucketName="business-avatars"
                      folder="avatars"
                      className="flex justify-center"
                      isAvatar={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Basic Information</h3>
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
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold`}>Contact Information</h3>
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
        </main>
      </div>

      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default EditProfessionalAccount;
