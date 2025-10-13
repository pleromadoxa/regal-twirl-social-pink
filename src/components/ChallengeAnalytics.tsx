import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallengeAnalytics } from '@/hooks/useChallengeAnalytics';
import { Eye, Users, Trophy, TrendingUp, Target, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChallengeAnalyticsProps {
  challengeId: string;
  isCreator: boolean;
}

export const ChallengeAnalytics: React.FC<ChallengeAnalyticsProps> = ({ challengeId, isCreator }) => {
  const { analytics, isAdmin, loading, getTotalMetrics } = useChallengeAnalytics(challengeId);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading analytics...</div>;
  }

  if (!isCreator && !isAdmin) {
    return null;
  }

  const metrics = getTotalMetrics();
  if (!metrics) return null;

  const showDetailedMetrics = isAdmin;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics</h3>
        {isAdmin && <Badge variant="destructive">Admin View</Badge>}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <Eye className="w-3 h-3" />
              Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalViews}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-success/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <Users className="w-3 h-3" />
              Joins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalJoins}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-warning/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalCompletions}</p>
          </CardContent>
        </Card>

        {showDetailedMetrics && (
          <>
            <Card className="glass-card border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <TrendingUp className="w-3 h-3" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-info/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Target className="w-3 h-3" />
                  Avg Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{metrics.averageProgress.toFixed(0)}%</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-2">
                  <Activity className="w-3 h-3" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{metrics.averageEngagement.toFixed(1)}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Trend Chart - Admin Only */}
      {showDetailedMetrics && analytics.length > 1 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm">Activity Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.slice(0, 14).reverse()}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  fontSize={10}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="joins_count" stroke="hsl(var(--primary))" strokeWidth={2} name="Joins" />
                <Line type="monotone" dataKey="completions_count" stroke="hsl(var(--success))" strokeWidth={2} name="Completions" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};