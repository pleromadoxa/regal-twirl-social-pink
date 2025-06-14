
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LocationMessageProps {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

const LocationMessage = ({ location }: LocationMessageProps) => {
  const openInMaps = () => {
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="max-w-sm">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Shared Location
            </p>
            <p className="text-xs text-slate-500 truncate">{location.address}</p>
            <p className="text-xs text-slate-400 mt-1">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
            <Button
              onClick={openInMaps}
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in Maps
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMessage;
