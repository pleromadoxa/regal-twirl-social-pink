
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building, Users, Globe, Phone, Mail, MapPin, 
  ExternalLink, Star, Crown, Verified, Edit, Eye 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessProfileCardProps {
  page: any;
  isOwner?: boolean;
  showManageButtons?: boolean;
}

const BusinessProfileCard = ({ page, isOwner = false, showManageButtons = true }: BusinessProfileCardProps) => {
  const navigate = useNavigate();

  const getBusinessIcon = (type: string) => {
    const iconMap: { [key: string]: any } = {
      'e-commerce': Building,
      'it-services': Building,
      'consulting': Users,
      'healthcare': Building,
      'education': Building,
      'finance': Building,
      'restaurant': Users,
      'retail': Building,
    };
    const IconComponent = iconMap[type] || Building;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Banner Section */}
      <div className="relative h-32">
        {page.banner_url ? (
          <img 
            src={page.banner_url} 
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
        )}
        <div className="absolute top-4 right-4">
          {page.is_verified && (
            <Badge className="bg-blue-500 text-white">
              <Verified className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-16 h-16 border-4 border-white -mt-12 relative z-10 shadow-lg">
            <AvatarImage src={page.avatar_url || page.page_avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white text-xl font-bold">
              {page.page_name?.[0]?.toUpperCase() || 'B'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold truncate">{page.page_name}</h3>
              {page.is_verified && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                {getBusinessIcon(page.business_type)}
                <span className="capitalize">{page.business_type?.replace('-', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{page.followers_count || 0} followers</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-sm">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                />
              ))}
              <span className="text-gray-600 ml-1">(4.2)</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {page.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {page.description}
          </p>
        )}

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          {page.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{page.email}</span>
            </div>
          )}
          {page.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{page.phone}</span>
            </div>
          )}
          {page.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="w-4 h-4" />
              <a 
                href={page.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-600 truncate flex items-center gap-1"
              >
                Website
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {page.address && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{page.address}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showManageButtons && (
          <div className="flex gap-2">
            {isOwner ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/business/${page.id}`)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/edit-professional/${page.id}`)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => navigate(`/professional/${page.id}`)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-4"
                >
                  Follow
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessProfileCard;
