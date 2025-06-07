
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, DollarSign, Calendar, Trash2 } from 'lucide-react';

interface BusinessEarningsProps {
  businessPage: any;
}

interface Earning {
  id: string;
  amount: number;
  currency: string;
  source: string;
  description: string;
  date: string;
  created_at: string;
}

const BusinessEarnings = ({ businessPage }: BusinessEarningsProps) => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchEarnings();
  }, [businessPage.id]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_earnings')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEarnings(data || []);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch earnings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.source) return;

    try {
      const { error } = await supabase
        .from('business_earnings')
        .insert([{
          business_page_id: businessPage.id,
          amount: parseFloat(formData.amount),
          currency: businessPage.default_currency,
          source: formData.source,
          description: formData.description,
          date: formData.date
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Earning record added successfully"
      });

      setFormData({
        amount: '',
        source: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setDialogOpen(false);
      fetchEarnings();
    } catch (error) {
      console.error('Error adding earning:', error);
      toast({
        title: "Error",
        description: "Failed to add earning record",
        variant: "destructive"
      });
    }
  };

  const deleteEarning = async (id: string) => {
    try {
      const { error } = await supabase
        .from('business_earnings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Earning record deleted"
      });
      fetchEarnings();
    } catch (error) {
      console.error('Error deleting earning:', error);
      toast({
        title: "Error",
        description: "Failed to delete earning record",
        variant: "destructive"
      });
    }
  };

  const getCurrencySymbol = () => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BTC': '₿', 'ETH': 'Ξ'
    };
    return symbols[businessPage.default_currency] || businessPage.default_currency;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const totalEarnings = earnings.reduce((sum, earning) => sum + Number(earning.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Earnings Management</h2>
          <p className="text-muted-foreground">Track your business income in {businessPage.default_currency}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Earning
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Earning</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount ({businessPage.default_currency})</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="source">Source</Label>
                <Select value={formData.source} onValueChange={(value) => setFormData(prev => ({ ...prev, source: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select earning source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice">Invoice Payment</SelectItem>
                    <SelectItem value="order">Product Sale</SelectItem>
                    <SelectItem value="service">Service Payment</SelectItem>
                    <SelectItem value="consulting">Consulting Fee</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the earning..."
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">Add Earning</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Total Earnings Card */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <DollarSign className="w-5 h-5" />
            Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalEarnings)}
          </div>
          <p className="text-sm text-green-600/80">All time earnings</p>
        </CardContent>
      </Card>

      {/* Earnings List */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading earnings...</div>
          ) : earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No earnings recorded yet. Add your first earning above.
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-lg text-green-600">
                        {formatCurrency(earning.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(earning.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                        {earning.source}
                      </div>
                    </div>
                    {earning.description && (
                      <p className="text-sm text-muted-foreground mt-1">{earning.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEarning(earning.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessEarnings;
