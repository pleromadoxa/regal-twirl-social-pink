
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const CreateProfessionalAccount = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pageName: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: ''
  });

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!formData.pageName.trim()) {
        toast({
          title: "Page name required",
          description: "Please provide a name for your business page.",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('business_pages')
        .insert({
          owner_id: user.id,
          page_name: formData.pageName,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          address: formData.address,
          page_type: 'business',
          default_currency: 'USD'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Professional account created!",
        description: "Your business page has been set up successfully."
      });
      navigate(`/business-dashboard/${data.id}`);
    } catch (error) {
      console.error('Error creating business page:', error);
      toast({
        title: "Error creating account",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          <div className="p-6">
            <Card className="max-w-2xl mx-auto bg-white/80 dark:bg-slate-800/80">
              <CardHeader>
                <CardTitle>Create Professional Account</CardTitle>
                <CardDescription>
                  Set up your business or professional page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="pageName">Page Name *</Label>
                    <Input
                      id="pageName"
                      value={formData.pageName}
                      onChange={(e) => setFormData({...formData, pageName: e.target.value})}
                      placeholder="Your business name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell people about your business"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="business@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://www.yourwebsite.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="123 Business St, City, State 12345"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Professional Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default CreateProfessionalAccount;
