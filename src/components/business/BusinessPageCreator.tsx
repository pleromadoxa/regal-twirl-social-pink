
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import ImageUpload from '@/components/ImageUpload';
import { Building, User, Users, Store, Code, Globe, TrendingUp, Stethoscope, GraduationCap, DollarSign, Crown } from 'lucide-react';

const businessTypes = [
  { value: 'e-commerce', label: 'E-Commerce', icon: Store, description: 'Online retail and marketplace' },
  { value: 'it-services', label: 'IT Services', icon: Code, description: 'Technology and software services' },
  { value: 'import-export', label: 'Import & Export', icon: Globe, description: 'International trade business' },
  { value: 'p2p-trading', label: 'P2P Trading', icon: TrendingUp, description: 'Peer-to-peer trading platform' },
  { value: 'consulting', label: 'Consulting', icon: Building, description: 'Professional consulting services' },
  { value: 'healthcare', label: 'Healthcare', icon: Stethoscope, description: 'Medical and health services' },
  { value: 'education', label: 'Education', icon: GraduationCap, description: 'Educational services and training' },
  { value: 'finance', label: 'Finance', icon: DollarSign, description: 'Financial services and banking' },
  { value: 'restaurant', label: 'Restaurant', icon: Users, description: 'Food and beverage services' },
  { value: 'retail', label: 'Retail', icon: Store, description: 'Physical retail stores' },
];

const BusinessPageCreator = () => {
  const { createPage } = useBusinessPages();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    page_name: '',
    page_type: 'business' as 'business' | 'professional' | 'organization',
    business_type: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    avatar_url: '',
    banner_url: '',
    default_currency: 'USD',
    shop_active: false,
    business_hours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    social_media: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      youtube: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.page_name.trim() || !formData.page_type) return;

    setIsSubmitting(true);
    try {
      const result = await createPage({
        ...formData,
        business_hours: JSON.stringify(formData.business_hours),
        social_media: JSON.stringify(formData.social_media),
      });

      if (result) {
        toast({
          title: "Business page created successfully!",
          description: "Your professional account is now live.",
        });
        navigate(`/business/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating business page:', error);
      toast({
        title: "Error creating business page",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Choose Your Account Type</h2>
        <p className="text-gray-600">Select what best describes your professional presence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'business', icon: Building, title: 'Business Account', desc: 'For companies and organizations' },
          { type: 'professional', icon: User, title: 'Professional Account', desc: 'For individual professionals' },
          { type: 'organization', icon: Users, title: 'Organization Account', desc: 'For non-profits and institutions' }
        ].map((option) => {
          const IconComponent = option.icon;
          return (
            <Card 
              key={option.type}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                formData.page_type === option.type ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleInputChange('page_type', option.type)}
            >
              <CardContent className="p-6 text-center">
                <IconComponent className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">{option.title}</h3>
                <p className="text-sm text-gray-600">{option.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setStep(2)} 
          disabled={!formData.page_type}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Business Information</h2>
        <p className="text-gray-600">Tell us about your {formData.page_type}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="page_name">Business Name *</Label>
          <Input
            id="page_name"
            value={formData.page_name}
            onChange={(e) => handleInputChange('page_name', e.target.value)}
            placeholder="Enter your business name"
            required
          />
        </div>

        <div>
          <Label htmlFor="business_type">Business Type *</Label>
          <Select
            value={formData.business_type}
            onValueChange={(value) => handleInputChange('business_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe your business and what you offer"
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          onClick={() => setStep(3)}
          disabled={!formData.page_name.trim() || !formData.business_type}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Continue
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Contact & Media</h2>
        <p className="text-gray-600">Add your contact information and branding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>Profile Picture</Label>
            <ImageUpload
              currentImageUrl={formData.avatar_url}
              onImageUpload={(url) => handleInputChange('avatar_url', url)}
              bucketName="business-avatars"
              folder="avatars"
              isAvatar={true}
            />
          </div>

          <div>
            <Label>Banner Image</Label>
            <ImageUpload
              currentImageUrl={formData.banner_url}
              onImageUpload={(url) => handleInputChange('banner_url', url)}
              bucketName="business-banners"
              folder="banners"
              isAvatar={false}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="business@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Business St, City, State 12345"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          {isSubmitting ? 'Creating...' : 'Create Business Page'}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              Create Professional Account
            </CardTitle>
            <CardDescription>
              Set up your professional presence with advanced business tools
            </CardDescription>
          </div>
          <Badge variant="outline">Step {step} of 3</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </CardContent>
    </Card>
  );
};

export default BusinessPageCreator;
