
// Business-related type definitions
export type BusinessType = 
  | 'e-commerce'
  | 'it-services' 
  | 'import-export'
  | 'p2p-trading'
  | 'consulting'
  | 'manufacturing'
  | 'retail'
  | 'restaurant'
  | 'real-estate'
  | 'healthcare'
  | 'education'
  | 'finance'
  | 'other';

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
  icon: React.ReactNode;
}

export interface BusinessPageData {
  businessName: string;
  page_name: string;
  description: string;
  business_type: BusinessType;
  email: string;
  phone: string;
  website: string;
  address: string;
  location: string;
}
