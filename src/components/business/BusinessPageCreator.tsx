
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Building2, Store, Users, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BusinessTypeOption, BusinessPageData } from '@/types/business';

interface BusinessPageCreatorProps {
  onBusinessPageDataChange: (data: BusinessPageData) => void;
  onNext: () => void;
  onPrev: () => void;
  businessPageData: BusinessPageData;
}

const BusinessPageCreator: React.FC<BusinessPageCreatorProps> = ({ onBusinessPageDataChange, onNext, onPrev, businessPageData }) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(20);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onBusinessPageDataChange({ ...businessPageData, [name]: value });
  };

  const handleSelectChange = (value: string, name: string) => {
    onBusinessPageDataChange({ ...businessPageData, [name]: value });
  };

  const businessTypes: BusinessTypeOption[] = [
    { value: 'restaurant', label: 'Restaurant', icon: <Store className="mr-2 h-4 w-4" /> },
    { value: 'e-commerce', label: 'Company', icon: <Building2 className="mr-2 h-4 w-4" /> },
    { value: 'other', label: 'Community', icon: <Users className="mr-2 h-4 w-4" /> },
    { value: 'consulting', label: 'Organization', icon: <Briefcase className="mr-2 h-4 w-4" /> },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Your Business Page</CardTitle>
        <CardDescription>
          Tell us about your business so we can create a stunning page for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            type="text"
            id="businessName"
            name="businessName"
            placeholder="Enter your business name"
            value={businessPageData.businessName}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Select onValueChange={(value) => handleSelectChange(value, "business_type")}>
            <SelectTrigger id="businessType">
              <SelectValue placeholder="Select a business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.icon}
                  <span>{type.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Write a short description about your business"
            value={businessPageData.description}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            type="text"
            id="location"
            name="location"
            placeholder="Enter your business location"
            value={businessPageData.location}
            onChange={handleInputChange}
          />
        </div>
        <Progress value={progress} className="h-2 w-full" />
        <div className="flex justify-between">
          <Button variant="secondary" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessPageCreator;
