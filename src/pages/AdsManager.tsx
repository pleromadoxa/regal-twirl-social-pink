
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus,
  Eye,
  MousePointer,
  DollarSign,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';

const AdsManager = () => {
  const [ads] = useState([
    {
      id: '1',
      title: 'Summer Sale Campaign',
      status: 'active',
      budget: 500,
      spent: 234.56,
      impressions: 12543,
      clicks: 324,
      conversions: 12,
      startDate: '2024-06-01',
      endDate: '2024-06-30'
    },
    {
      id: '2',
      title: 'Product Launch Ad',
      status: 'paused',
      budget: 750,
      spent: 412.30,
      impressions: 8765,
      clicks: 187,
      conversions: 8,
      startDate: '2024-05-15',
      endDate: '2024-07-15'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 ml-80 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ads Manager
            </h1>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  Total Impressions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">21,308</div>
                <p className="text-xs text-muted-foreground">+12% from last week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-green-600" />
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">511</div>
                <p className="text-xs text-muted-foreground">2.4% CTR</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-600" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$646.86</div>
                <p className="text-xs text-muted-foreground">of $1,250 budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  Conversions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">20</div>
                <p className="text-xs text-muted-foreground">3.9% conversion rate</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="space-y-4">
            <TabsList>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="audiences">Audiences</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ads.map((ad) => (
                      <div key={ad.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{ad.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {ad.startDate} - {ad.endDate}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={ad.status === 'active' ? 'default' : 'secondary'}>
                              {ad.status}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline">
                                {ad.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Budget</p>
                            <p className="font-semibold">${ad.budget}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Spent</p>
                            <p className="font-semibold">${ad.spent}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Impressions</p>
                            <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Clicks</p>
                            <p className="font-semibold">{ad.clicks}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Conversions</p>
                            <p className="font-semibold">{ad.conversions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Detailed analytics charts will be displayed here</p>
                      <p className="text-sm">Track campaign performance over time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audiences" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Audience targeting and management tools will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdsManager;
