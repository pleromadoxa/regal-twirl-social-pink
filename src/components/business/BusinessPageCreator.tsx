import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBusinessPages } from '@/hooks/useBusinessPages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Building2, Store, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BusinessType, BusinessPageData } from '@/types/business';

interface BusinessPageData {
  page_name: string;
  description: string;
  business_type: BusinessType;
  email: string;
  phone: string;
  website: string;
  address: string;
}

interface BusinessPageCreatorProps {
  onComplete?: (page: any) => void;
  onCancel?: () => void;
}

const BusinessPageCreator = ({ onComplete, onCancel }: BusinessPageCreatorProps) => {
  const { user } = useAuth();
  const { createPage } = useBusinessPages();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessPageData>({
    page_name: '',
    description: '',
    business_type: 'other',
    email: '',
    phone: '',
    website: '',
    address: ''
  });

  const businessTypes: { value: BusinessType; label: string; icon: any }[] = [
    { value: 'e-commerce', label: 'E-commerce', icon: Store },
    { value: 'it-services', label: 'IT Services', icon: Briefcase },
    { value: 'consulting', label: 'Consulting', icon: Users },
    { value: 'retail', label: 'Retail', icon: Building2 },
    { value: 'restaurant', label: 'Restaurant', icon: Store },
    { value: 'healthcare', label: 'Healthcare', icon: Building2 },
    { value: 'education', label: 'Education', icon: Users },
    { value: 'finance', label: 'Finance', icon: Briefcase },
    { value: 'other', label: 'Other', icon: Building2 }
  ];

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: keyof BusinessPageData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBusinessTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      business_type: value as BusinessType
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.page_name.trim() !== '' && formData.business_type !== 'other' || formData.business_type === 'other';
      case 2:
        return formData.description.trim() !== '';
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a business page.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createPage({
        ...formData,
        page_type: 'business'
      });

      if (result) {
        toast({
          title: "Success!",
          description: "Your business page has been created successfully.",
        });
        onComplete?.(result);
      }
    } catch (error) {
      console.error('Error creating business page:', error);
      toast({
        title: "Error",
        description: "Failed to create business page. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="page_name" className="text-base font-medium">Business Name *</Label>
              <Input
                id="page_name"
                value={formData.page_name}
                onChange={(e) => handleInputChange('page_name', e.target.value)}
                placeholder="Enter your business name"
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-base font-medium">Business Type *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {businessTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        formData.business_type === type.value
                          ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleBusinessTypeChange(type.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <IconComponent className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                        <p className="text-sm font-medium">{type.label}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description" className="text-base font-medium">Business Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your business, services, and what makes you unique..."
                rows={6}
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">
                This will help customers understand what you offer.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-base font-medium">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="business@example.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-base font-medium">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.yourbusiness.com"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-base font-medium">Business Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Business St, City, State, ZIP"
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Business Basics';
      case 2:
        return 'Business Description';
      case 3:
        return 'Contact Information';
      default:
        return '';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Create Business Page</CardTitle>
            <p className="text-gray-600 mt-1">Step {currentStep} of {totalSteps}: {getStepTitle()}</p>
          </div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>

      <CardContent className="space-y-8">
        {renderStep()}

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? 'Creating...' : 'Create Business Page'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessPageCreator;
