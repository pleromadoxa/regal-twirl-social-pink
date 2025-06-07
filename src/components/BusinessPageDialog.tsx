
import { useState, useEffect } from 'react';
import { Plus, Building, User, Briefcase, Users, Store, Code, Globe, TrendingUp, Stethoscope, GraduationCap, DollarSign, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { supabase } from '@/integrations/supabase/client';

interface BusinessPageDialogProps {
  trigger?: React.ReactNode;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const businessTypes = [
  { value: 'e-commerce', label: 'E-Commerce', icon: Store },
  { value: 'it-services', label: 'IT Services', icon: Code },
  { value: 'import-export', label: 'Import & Export', icon: Globe },
  { value: 'p2p-trading', label: 'P2P Trading', icon: TrendingUp },
  { value: 'consulting', label: 'Consulting', icon: Briefcase },
  { value: 'manufacturing', label: 'Manufacturing', icon: Building },
  { value: 'retail', label: 'Retail', icon: Store },
  { value: 'restaurant', label: 'Restaurant', icon: Users },
  { value: 'real-estate', label: 'Real Estate', icon: Building },
  { value: 'healthcare', label: 'Healthcare', icon: Stethoscope },
  { value: 'education', label: 'Education', icon: GraduationCap },
  { value: 'finance', label: 'Finance', icon: DollarSign },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
];

const BusinessPageDialog = ({ trigger }: BusinessPageDialogProps) => {
  const { createPage } = useBusinessPages();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState({
    page_name: '',
    page_type: '' as 'business' | 'professional' | 'organization' | '',
    business_type: '',
    default_currency: 'USD',
    description: '',
    website: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const fetchCurrencies = async () => {
    const { data } = await supabase
      .from('currencies')
      .select('*')
      .order('code');
    
    if (data) {
      setCurrencies(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.page_name.trim() || !formData.page_type || !formData.business_type) return;

    setIsSubmitting(true);
    await createPage({
      page_name: formData.page_name,
      page_type: formData.page_type,
      business_type: formData.business_type,
      default_currency: formData.default_currency,
      description: formData.description || undefined,
      website: formData.website || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
    });
    
    setFormData({
      page_name: '',
      page_type: '',
      business_type: '',
      default_currency: 'USD',
      description: '',
      website: '',
      email: '',
      phone: '',
      address: '',
    });
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getBusinessTypeIcon = (type: string) => {
    const businessType = businessTypes.find(bt => bt.value === type);
    const IconComponent = businessType?.icon || MoreHorizontal;
    return <IconComponent className="w-4 h-4 mr-2 text-purple-600" />;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Create Professional Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-purple-200 dark:border-purple-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Create Professional Account
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Create a professional account to showcase your business with comprehensive management tools.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="page_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Account Name *
              </Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => handleInputChange('page_name', e.target.value)}
                placeholder="Enter your professional account name"
                className="rounded-xl border-purple-200 focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page_type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Account Type *
              </Label>
              <Select value={formData.page_type} onValueChange={(value) => handleInputChange('page_type', value)}>
                <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-purple-600" />
                      Business Account
                    </div>
                  </SelectItem>
                  <SelectItem value="professional">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      Professional Account
                    </div>
                  </SelectItem>
                  <SelectItem value="organization">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-600" />
                      Organization Account
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Business Type *
              </Label>
              <Select value={formData.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        {getBusinessTypeIcon(type.value)}
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default_currency" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Default Currency *
              </Label>
              <Select value={formData.default_currency} onValueChange={(value) => handleInputChange('default_currency', value)}>
                <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-500">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <span>{currency.symbol}</span>
                        <span>{currency.code}</span>
                        <span className="text-slate-500">- {currency.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business or professional services"
              className="min-h-[80px] rounded-xl border-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Website
              </Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className="rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contact@example.com"
                className="rounded-xl border-purple-200 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="rounded-xl border-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="rounded-xl border-purple-200 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-xl border-purple-200 hover:bg-purple-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.page_name.trim() || !formData.page_type || !formData.business_type || isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessPageDialog;
