export interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  latitude?: number;
  longitude?: number;
  flag?: string;
}

export interface UserLocationState {
  userId: string;
  location: LocationData;
  timestamp: string;
}

// Get location from IP address using ipapi.co
export const getLocationFromIP = async (): Promise<LocationData> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
      flag: data.country_code ? `https://flagcdn.com/24x18/${data.country_code.toLowerCase()}.png` : undefined
    };
  } catch (error) {
    console.error('Error getting location from IP:', error);
    return {
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
};

// Get location from browser geolocation API
export const getLocationFromGeolocation = (): Promise<{latitude: number; longitude: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Reverse geocode coordinates to get location details
export const reverseGeocode = async (latitude: number, longitude: number): Promise<LocationData> => {
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    
    return {
      country: data.countryName || 'Unknown',
      countryCode: data.countryCode || 'XX',
      city: data.city || data.locality || 'Unknown',
      region: data.principalSubdivision || 'Unknown',
      latitude,
      longitude,
      flag: data.countryCode ? `https://flagcdn.com/24x18/${data.countryCode.toLowerCase()}.png` : undefined
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    // Fallback to IP-based location
    return getLocationFromIP();
  }
};

// Get user's current location with fallback options
export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    // Try to get precise location first
    const coords = await getLocationFromGeolocation();
    return await reverseGeocode(coords.latitude, coords.longitude);
  } catch (error) {
    // Fallback to IP-based location
    console.log('Geolocation failed, falling back to IP location');
    return await getLocationFromIP();
  }
};

// Get country flag emoji
export const getCountryFlag = (countryCode: string): string => {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  
  return countryCode
    .toUpperCase()
    .split('')
    .map(char => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join('');
};

// Format location for display
export const formatLocation = (location: LocationData): string => {
  const flag = getCountryFlag(location.countryCode);
  if (location.city && location.city !== 'Unknown') {
    return `${flag} ${location.city}, ${location.country}`;
  }
  return `${flag} ${location.country}`;
};