import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Megaphone, TrendingUp, Target, DollarSign, Calendar, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface BoostPostWidgetProps {
  postId: string;
  postContent: string;
}

const BoostPostWidget = ({ postId, postContent }: BoostPostWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [boostData, setBoostData] = useState({
    budget: '',
    duration: '7',
    objective: 'engagement',
    targetAudience: {
      countries: ['US'],
      ageRange: '18-65',
      interests: []
    }
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBoostPost = async () => {
    if (!user || !boostData.budget) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
          budget_amount: parseFloat(boostData.budget),
          duration_days: parseInt(boostData.duration),
          sponsor_type: boostData.objective,
          target_audience: boostData.targetAudience,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Post Boosted!",
        description: "Your post is now being promoted to a wider audience"
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

  const objectives = [
    { value: 'engagement', label: 'Increase Engagement', icon: TrendingUp },
    { value: 'reach', label: 'Expand Reach', icon: Users },
    { value: 'traffic', label: 'Drive Traffic', icon: Target }
  ];

  const estimatedReach = Math.floor(parseFloat(boostData.budget || '0') * 100 * parseInt(boostData.duration));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 border-blue-200">
          <Megaphone className="w-4 h-4 mr-2" />
          Boost Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Megaphone className="w-6 h-6 text-blue-600" />
            Boost Your Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Post Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-sm line-clamp-3">{postContent}</p>
                <Badge className="mt-2 bg-blue-500 text-white">Sponsored</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Budget & Duration */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="budget" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Budget (USD)
                </Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="50"
                  value={boostData.budget}
                  onChange={(e) => setBoostData({ ...boostData, budget: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Duration
                </Label>
                <Select 
                  value={boostData.duration} 
                  onValueChange={(value) => setBoostData({ ...boostData, duration: value })}
                >
                  <SelectTrigger className="mt-1">
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

            {/* Objective */}
            <div className="space-y-4">
              <div>
                <Label className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Campaign Objective
                </Label>
                <div className="mt-2 space-y-2">
                  {objectives.map((objective) => (
                    <div
                      key={objective.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        boostData.objective === objective.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setBoostData({ ...boostData, objective: objective.value })}
                    >
                      <div className="flex items-center gap-2">
                        <objective.icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{objective.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Audience Targeting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Countries</Label>
                <Select defaultValue="US">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="worldwide">Worldwide</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Age Range</Label>
                <Select defaultValue="18-65">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45-54">45-54</SelectItem>
                    <SelectItem value="55-65">55-65</SelectItem>
                    <SelectItem value="18-65">All Adults (18-65)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Estimated Results */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-sm text-green-700 dark:text-green-400">
                Estimated Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{estimatedReach.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">People Reached</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{Math.floor(estimatedReach * 0.05).toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Engagements</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">${(parseFloat(boostData.budget || '0') / estimatedReach * 1000).toFixed(3)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cost per 1K Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleBoostPost}
              disabled={loading || !boostData.budget}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Boosting...
                </div>
              ) : (
                `Boost for $${boostData.budget}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostPostWidget;