
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Megaphone, 
  Plus, 
  BarChart3, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Target,
  Edit,
  Trash2,
  Pause,
  Play
} from 'lucide-react';

interface BusinessAdsManagerProps {
  businessPage: any;
}

const BusinessAdsManager = ({ businessPage }: BusinessAdsManagerProps) => {
  const [ads, setAds] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ad_type: 'page_boost',
    budget_amount: '',
    duration_days: '',
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
    fetchData();
  }, [businessPage.id]);

  useEffect(() => {
    if (editingAd) {
      setFormData({
        title: editingAd.title || '',
        description: editingAd.description || '',
        ad_type: editingAd.ad_type || 'page_boost',
        budget_amount: editingAd.budget_amount?.toString() || '',
        duration_days: editingAd.duration_days?.toString() || '',
        target_countries: editingAd.target_countries || [],
        target_regions: editingAd.target_regions || [],
        target_product_id: editingAd.target_product_id || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        ad_type: 'page_boost',
        budget_amount: '',
        duration_days: '',
        target_countries: [],
        target_regions: [],
        target_product_id: ''
      });
    }
  }, [editingAd]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch ads
      const { data: adsData } = await supabase
        .from('business_ads')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      // Fetch products for targeting
      const { data: productsData } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .eq('is_active', true);

      setAds(adsData || []);
      setProducts(productsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.budget_amount || !formData.duration_days) return;

    try {
      const adData = {
        business_page_id: businessPage.id,
        title: formData.title,
        description: formData.description,
        ad_type: formData.ad_type,
        budget_amount: parseFloat(formData.budget_amount),
        budget_currency: businessPage.default_currency || 'USD',
        duration_days: parseInt(formData.duration_days),
        target_countries: formData.target_countries,
        target_regions: formData.target_regions,
        target_product_id: formData.target_product_id || null,
        status: 'pending'
      };

      if (editingAd) {
        const { error } = await supabase
          .from('business_ads')
          .update(adData)
          .eq('id', editingAd.id);

        if (error) throw error;
        toast({ title: "Success", description: "Ad updated successfully" });
      } else {
        const { error } = await supabase
          .from('business_ads')
          .insert([adData]);

        if (error) throw error;
        toast({ title: "Success", description: "Ad created successfully" });
      }

      setDialogOpen(false);
      setEditingAd(null);
      fetchData();
    } catch (error) {
      console.error('Error saving ad:', error);
      toast({
        title: "Error",
        description: "Failed to save ad",
        variant: "destructive"
      });
    }
  };

  const toggleAdStatus = async (ad: any) => {
    try {
      const newStatus = ad.status === 'active' ? 'paused' : 'active';
      const { error } = await supabase
        .from('business_ads')
        .update({ status: newStatus })
        .eq('id', ad.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating ad status:', error);
      toast({
        title: "Error",
        description: "Failed to update ad status",
        variant: "destructive"
      });
    }
  };

  const deleteAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('business_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Ad deleted" });
      fetchData();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: "Error",
        description: "Failed to delete ad",
        variant: "destructive"
      });
    }
  };

  const openDialog = (ad?: any) => {
    setEditingAd(ad || null);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'pending': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const totalSpent = ads.reduce((sum, ad) => sum + (ad.spent_amount || 0), 0);
  const activeAds = ads.filter(ad => ad.status === 'active').length;
  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Ads Manager</h2>
          <p className="text-muted-foreground">Boost your business with targeted advertising</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => openDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Advertisement' : 'Create New Advertisement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Ad Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ad_type">Ad Type *</Label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_amount">Budget Amount ({businessPage.default_currency || 'USD'}) *</Label>
                  <Input
                    id="budget_amount"
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.budget_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_amount: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration_days">Duration (Days) *</Label>
                  <Input
                    id="duration_days"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.duration_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                    required
                  />
                </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Target Countries</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {countries.map((country) => (
                      <label key={country} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.target_countries.includes(country)}
                          onChange={(e) => {
                            if (e.target.checked) {
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
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Target Regions</Label>
                  <div className="mt-2 space-y-2">
                    {regions.map((region) => (
                      <label key={region} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.target_regions.includes(region)}
                          onChange={(e) => {
                            if (e.target.checked) {
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
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingAd ? 'Update Ad' : 'Create Ad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Active Ads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAds}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-600" />
              Total Impressions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImpressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Ad views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-orange-600" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClicks}</div>
            <p className="text-xs text-muted-foreground">Click-throughs</p>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Your Advertisements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ads.length > 0 ? (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{ad.title}</h4>
                      <Badge className={getStatusColor(ad.status)}>
                        {ad.status}
                      </Badge>
                      <Badge variant="outline">{ad.ad_type.replace('_', ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAdStatus(ad)}
                      >
                        {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(ad)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAd(ad.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{ad.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Budget:</span>
                      <p>${ad.budget_amount} {ad.budget_currency}</p>
                    </div>
                    <div>
                      <span className="font-medium">Spent:</span>
                      <p>${ad.spent_amount || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium">Impressions:</span>
                      <p>{ad.impressions || 0}</p>
                    </div>
                    <div>
                      <span className="font-medium">Clicks:</span>
                      <p>{ad.clicks || 0}</p>
                    </div>
                  </div>
                  
                  {ad.target_countries && ad.target_countries.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Target Countries: </span>
                      <span className="text-sm text-muted-foreground">
                        {ad.target_countries.slice(0, 3).join(', ')}
                        {ad.target_countries.length > 3 && ` +${ad.target_countries.length - 3} more`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Megaphone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No advertisements yet. Create your first ad to boost your business!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessAdsManager;
