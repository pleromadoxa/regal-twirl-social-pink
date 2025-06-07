
import { useState } from 'react';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

const LocationPicker = ({ onLocationSelect, isVisible, onClose }: LocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { toast } = useToast();

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use a reverse geocoding service to get location name
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            
            if (response.ok) {
              const data = await response.json();
              const locationName = data.results[0]?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              onLocationSelect(locationName);
            } else {
              // Fallback to coordinates
              onLocationSelect(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            // Fallback to coordinates
            onLocationSelect(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
          onClose();
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enter your location manually",
            variant: "destructive"
          });
        }
      );
    }
  };

  const handleManualLocation = () => {
    if (searchQuery.trim()) {
      onLocationSelect(searchQuery.trim());
      setSearchQuery('');
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 p-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-sm">Add Location</span>
        </div>
        
        <Button
          onClick={getCurrentLocation}
          variant="outline"
          size="sm"
          className="w-full justify-start"
        >
          <MapPin className="w-4 h-4 mr-2" />
          Use Current Location
        </Button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleManualLocation} disabled={!searchQuery.trim()}>
            Add Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
