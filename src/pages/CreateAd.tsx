import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Megaphone, 
  Target, 
  DollarSign, 
  Calendar, 
  Globe,
  Users,
  Eye,
  MousePointer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateAd = () => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    business_page_id: '',
    title: '',
    description: '',
    ad_type: 'page_boost',
    budget_amount: '',
    duration_days: '7',
    target_countries: [] as string[],
    target_regions: [] as string[],
    target_product_id: ''
  });

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 
    'Australia', 'Japan', 'Brazil', 'India', 'China', 'Nigeria', 'South Africa'
  ];

  const regions = [
    'North America', 'Europe', 'Asia Pacific', 'Latin America', 
    'Middle East', 'Africa', 'Worldwide'
  ];

  useEffect(() => {
    if (formData.business_page_id) {
      fetchProducts();
    }
  }, [formData.business_page_id]);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', formData.business_page_id)
        .eq('is_active', true);
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.budget_amount || !formData.business_page_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const selectedPage = myPages.find(p => p.id === formData.business_page_id);
      
      const adData = {
        business_page_id: formData.business_page_id,
        title: formData.title,
        description: formData.description,
        ad_type: formData.ad_type,
        budget_amount: parseFloat(formData.budget_amount),
        budget_currency: selectedPage?.default_currency || 'USD',
        duration_days: parseInt(formData.duration_days),
        target_countries: formData.target_countries,
        target_regions: formData.target_regions,
        target_product_id: formData.target_product_id || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('business_ads')
        .insert([adData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Advertisement created successfully! It will be reviewed and activated soon."
      });

      navigate('/ads-manager');
    } catch (error: any) {
      console.error('Error creating ad:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create advertisement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (country: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        target_countries: [...prev.target_countries, country]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        target_countries: prev.target_countries.filter(c => c !== country)
      }));
    }
  };

  const handleRegionChange = (region: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        target_regions: [...prev.target_regions, region]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        target_regions: prev.target_regions.filter(r => r !== region)
      }));
    }
  };

  const estimatedReach = formData.budget_amount ? 
    Math.floor(parseFloat(formData.budget_amount) * 25) + ' - ' + Math.floor(parseFloat(formData.budget_amount) * 75) : '0 - 0';

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 mr-96 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ads-manager')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Ads Manager
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-purple-600" />
                Create Advertisement
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create a targeted ad campaign for your business
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Ad Configuration */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Megaphone className="w-5 h-5" />
                      Ad Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="business_page_id">Business Page *</Label>
                      <Select
                        value={formData.business_page_id}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, business_page_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a business page" />
                        </SelectTrigger>
                        <SelectContent>
                          {myPages.map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.page_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Ad Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter a compelling ad title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your ad campaign"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="ad_type">Ad Type</Label>
                      <Select
                        value={formData.ad_type}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, ad_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page_boost">Page Boost</SelectItem>
                          <SelectItem value="product_promotion">Product Promotion</SelectItem>
                          <SelectItem value="service_highlight">Service Highlight</SelectItem>
                          <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                          <SelectItem value="website_traffic">Website Traffic</SelectItem>
                          <SelectItem value="lead_generation">Lead Generation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.ad_type === 'product_promotion' && products.length > 0 && (
                      <div>
                        <Label htmlFor="target_product_id">Target Product</Label>
                        <Select
                          value={formData.target_product_id}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, target_product_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - ${product.price}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Budget & Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="budget_amount">Budget Amount (USD) *</Label>
                        <Input
                          id="budget_amount"
                          type="number"
                          step="0.01"
                          min="1"
                          value={formData.budget_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
                          placeholder="100.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="duration_days">Duration (Days)</Label>
                        <Select
                          value={formData.duration_days}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, duration_days: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Day</SelectItem>
                            <SelectItem value="3">3 Days</SelectItem>
                            <SelectItem value="7">1 Week</SelectItem>
                            <SelectItem value="14">2 Weeks</SelectItem>
                            <SelectItem value="30">1 Month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Targeting Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">Target Countries</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {countries.map((country) => (
                          <div key={country} className="flex items-center space-x-2">
                            <Checkbox
                              id={`country-${country}`}
                              checked={formData.target_countries.includes(country)}
                              onCheckedChange={(checked) => handleCountryChange(country, checked as boolean)}
                            />
                            <Label 
                              htmlFor={`country-${country}`} 
                              className="text-sm font-normal cursor-pointer"
                            >
                              {country}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Target Regions</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {regions.map((region) => (
                          <div key={region} className="flex items-center space-x-2">
                            <Checkbox
                              id={`region-${region}`}
                              checked={formData.target_regions.includes(region)}
                              onCheckedChange={(checked) => handleRegionChange(region, checked as boolean)}
                            />
                            <Label 
                              htmlFor={`region-${region}`} 
                              className="text-sm font-normal cursor-pointer"
                            >
                              {region}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview & Estimates */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Campaign Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                      <h3 className="font-semibold mb-2">
                        {formData.title || 'Your Ad Title'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {formData.description || 'Your ad description will appear here...'}
                      </p>
                      <div className="flex justify-between text-xs">
                        <span>Ad Type: {formData.ad_type.replace('_', ' ')}</span>
                        <span>Sponsored</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Estimated Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Estimated Reach:</span>
                        <span className="text-sm font-medium">{estimatedReach}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Daily Budget:</span>
                        <span className="text-sm font-medium">
                          ${formData.budget_amount ? 
                            (parseFloat(formData.budget_amount) / parseInt(formData.duration_days)).toFixed(2) : 
                            '0.00'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Est. Clicks:</span>
                        <span className="text-sm font-medium">
                          {formData.budget_amount ? Math.floor(parseFloat(formData.budget_amount) * 5) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cost per Click:</span>
                        <span className="text-sm font-medium">$0.15 - $0.50</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? 'Creating Ad...' : 'Create Advertisement'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/ads-manager')}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default CreateAd;