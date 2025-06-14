
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, DollarSign, Calendar, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BoostPostDialogProps {
  postId: string;
  trigger: React.ReactNode;
}

const BoostPostDialog = ({ postId, trigger }: BoostPostDialogProps) => {
  const { user } = useAuth();
  const { myPages } = useBusinessPages();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessPageId: '',
    budgetAmount: '10',
    budgetCurrency: 'USD',
    durationDays: '7',
    targetAudience: {
      ageRange: '',
      interests: '',
      location: ''
    }
  });

  const handleBoostPost = async () => {
    if (!user || !formData.businessPageId) {
      toast({
        title: "Error",
        description: "Please select a business page",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create sponsored post entry
      const { data: sponsoredPost, error: sponsorError } = await supabase
        .from('sponsored_posts')
        .insert({
          post_id: postId,
          business_page_id: formData.businessPageId,
          sponsor_type: 'boosted_post',
          budget_amount: parseFloat(formData.budgetAmount),
          budget_currency: formData.budgetCurrency,
          duration_days: parseInt(formData.durationDays),
          target_audience: formData.targetAudience,
          status: 'active'
        })
        .select()
        .single();

      if (sponsorError) throw sponsorError;

      // Update the post to link it to the sponsored post
      const { error: postError } = await supabase
        .from('posts')
        .update({ sponsored_post_id: sponsoredPost.id })
        .eq('id', postId);

      if (postError) throw postError;

      toast({
        title: "Post Boosted!",
        description: `Your post is now being promoted with a $${formData.budgetAmount} budget for ${formData.durationDays} days.`
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error boosting post:', error);
      toast({
        title: "Error",
        description: "Failed to boost post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            Boost This Post
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Business Page Selection */}
          <div className="space-y-2">
            <Label htmlFor="businessPage">Select Business Page</Label>
            <Select
              value={formData.businessPageId}
              onValueChange={(value) => setFormData({ ...formData, businessPageId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a business page" />
              </SelectTrigger>
              <SelectContent>
                {myPages
                  .filter(page => !!page.id)
                  .map((page) => (
                    <SelectItem key={page.id} value={page.id}>
                      {page.page_name} ({page.page_type})
                    </SelectItem>
                  ))}
                {/* DO NOT render value="" */}
              </SelectContent>
            </Select>
          </div>

          {/* Budget Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Budget & Duration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Amount</Label>
                  <Input
                    id="budget"
                    type="number"
                    min="1"
                    value={formData.budgetAmount}
                    onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                    placeholder="10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={formData.budgetCurrency}
                    onValueChange={(value) => setFormData({ ...formData, budgetCurrency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Select
                  value={formData.durationDays}
                  onValueChange={(value) => setFormData({ ...formData, durationDays: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Targeting Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Select
                  value={formData.targetAudience.ageRange}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    targetAudience: { ...formData.targetAudience, ageRange: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55+">55+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interests">Interests (comma-separated)</Label>
                <Input
                  id="interests"
                  value={formData.targetAudience.interests}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetAudience: { ...formData.targetAudience, interests: e.target.value }
                  })}
                  placeholder="technology, business, sports"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.targetAudience.location}
                  onChange={(e) => setFormData({
                    ...formData,
                    targetAudience: { ...formData.targetAudience, location: e.target.value }
                  })}
                  placeholder="United States, New York"
                />
              </div>
            </CardContent>
          </Card>

          {/* Estimated Reach */}
          <Card className="bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Estimated Reach</h4>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(parseInt(formData.budgetAmount) * 100)}-{Math.floor(parseInt(formData.budgetAmount) * 200)}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">people per day</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBoostPost}
              disabled={loading || !formData.businessPageId}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? "Boosting..." : `Boost Post - $${formData.budgetAmount}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostPostDialog;
