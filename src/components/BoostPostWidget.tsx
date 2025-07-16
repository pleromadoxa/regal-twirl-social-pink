
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Megaphone, Target, Calendar, DollarSign, BarChart3, Users, Globe, MapPin, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoostPostWidgetProps {
  postId?: string;
  businessPageId?: string;
}

const BoostPostWidget = ({ postId, businessPageId }: BoostPostWidgetProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('boost');
  const [boostData, setBoostData] = useState({
    budget: '',
    duration: '7',
    audience: 'auto',
    countries: [] as string[],
    ageRange: '18-65',
    interests: [] as string[]
  });
  const [adData, setAdData] = useState({
    title: '',
    description: '',
    budget: '',
    duration: '7',
    adType: 'promote_page',
    targetCountries: [] as string[],
    targetRegions: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBoostPost = async () => {
    if (!postId || !businessPageId) {
      toast({
        title: "Error",
        description: "Missing post or business page information",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('sponsored_posts')
        .insert({
          post_id: postId,
          business_page_id: businessPageId,
          budget_amount: parseFloat(boostData.budget),
          target_audience: boostData.audience,
          target_countries: boostData.countries,
          duration_days: parseInt(boostData.duration),
          status: 'pending',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + parseInt(boostData.duration) * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post boost campaign created successfully!"
      });
      setOpen(false);
    } catch (error) {
      console.error('Error boosting post:', error);
      toast({
        title: "Error",
        description: "Failed to create boost campaign",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAd = async () => {
    if (!businessPageId) {
      toast({
        title: "Error",
        description: "Business page information required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('business_ads')
        .insert({
          business_page_id: businessPageId,
          title: adData.title,
          description: adData.description,
          budget_amount: parseFloat(adData.budget),
          duration_days: parseInt(adData.duration),
          ad_type: adData.adType,
          target_countries: adData.targetCountries,
          target_regions: adData.targetRegions,
          status: 'pending',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + parseInt(adData.duration) * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Advertisement created successfully!"
      });
      setOpen(false);
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({
        title: "Error",
        description: "Failed to create advertisement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
          <Megaphone className="w-4 h-4 mr-2" />
          Promote
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Promote Your Content
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="boost" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Boost Post
            </TabsTrigger>
            <TabsTrigger value="ad" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Create Ad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="boost" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Boost Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    Boost Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="boost-budget">Budget (USD)</Label>
                    <Input
                      id="boost-budget"
                      type="number"
                      placeholder="50"
                      value={boostData.budget}
                      onChange={(e) => setBoostData({...boostData, budget: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="boost-duration">Duration</Label>
                    <Select value={boostData.duration} onValueChange={(value) => setBoostData({...boostData, duration: value})}>
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

                  <div>
                    <Label htmlFor="boost-audience">Target Audience</Label>
                    <Select value={boostData.audience} onValueChange={(value) => setBoostData({...boostData, audience: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Automatic</SelectItem>
                        <SelectItem value="followers">Followers</SelectItem>
                        <SelectItem value="interests">Interest-based</SelectItem>
                        <SelectItem value="location">Location-based</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="boost-age">Age Range</Label>
                    <Select value={boostData.ageRange} onValueChange={(value) => setBoostData({...boostData, ageRange: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="13-17">13-17</SelectItem>
                        <SelectItem value="18-24">18-24</SelectItem>
                        <SelectItem value="25-34">25-34</SelectItem>
                        <SelectItem value="35-44">35-44</SelectItem>
                        <SelectItem value="45-54">45-54</SelectItem>
                        <SelectItem value="55-64">55-64</SelectItem>
                        <SelectItem value="18-65">All Adults (18-65)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Boost Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Estimated Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-lg font-bold">2.5K - 6.8K</p>
                      <p className="text-sm text-gray-600">Estimated Reach</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Target className="w-6 h-6 mx-auto mb-2 text-green-500" />
                      <p className="text-lg font-bold">125 - 350</p>
                      <p className="text-sm text-gray-600">Estimated Engagement</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per result:</span>
                      <span className="text-sm font-medium">$0.15 - $0.40</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Daily budget:</span>
                      <span className="text-sm font-medium">
                        ${boostData.budget ? (parseFloat(boostData.budget) / parseInt(boostData.duration)).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleBoostPost} 
                    disabled={loading || !boostData.budget}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? 'Creating Boost...' : 'Boost Post'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="ad" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ad Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-500" />
                    Ad Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ad-title">Ad Title</Label>
                    <Input
                      id="ad-title"
                      placeholder="Enter compelling ad title"
                      value={adData.title}
                      onChange={(e) => setAdData({...adData, title: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad-description">Description</Label>
                    <Textarea
                      id="ad-description"
                      placeholder="Describe your offer or message"
                      value={adData.description}
                      onChange={(e) => setAdData({...adData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad-type">Ad Type</Label>
                    <Select value={adData.adType} onValueChange={(value) => setAdData({...adData, adType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promote_page">Promote Page</SelectItem>
                        <SelectItem value="promote_post">Promote Post</SelectItem>
                        <SelectItem value="website_traffic">Drive Website Traffic</SelectItem>
                        <SelectItem value="lead_generation">Lead Generation</SelectItem>
                        <SelectItem value="brand_awareness">Brand Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ad-budget">Budget (USD)</Label>
                    <Input
                      id="ad-budget"
                      type="number"
                      placeholder="100"
                      value={adData.budget}
                      onChange={(e) => setAdData({...adData, budget: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad-duration">Duration</Label>
                    <Select value={adData.duration} onValueChange={(value) => setAdData({...adData, duration: value})}>
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
                </CardContent>
              </Card>

              {/* Targeting Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-500" />
                    Targeting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Globe className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-lg font-bold">Global</p>
                      <p className="text-sm text-gray-600">Worldwide Reach</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <MapPin className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-lg font-bold">Local</p>
                      <p className="text-sm text-gray-600">Region Specific</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interests</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Christianity', 'Faith', 'Community', 'Music', 'Ministry', 'Bible Study'].map((interest) => (
                        <Badge key={interest} variant="outline" className="cursor-pointer hover:bg-purple-100">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Estimated daily reach:</span>
                      <span className="text-sm font-medium">5K - 15K people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cost per click:</span>
                      <span className="text-sm font-medium">$0.25 - $0.75</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleCreateAd} 
                    disabled={loading || !adData.title || !adData.budget}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {loading ? 'Creating Ad...' : 'Create Advertisement'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BoostPostWidget;
