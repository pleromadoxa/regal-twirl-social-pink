
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import LogoUpload from './LogoUpload';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';

const LogoSettings = () => {
  const { theme } = useTheme();

  const getLightLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-light.png');
    return data.publicUrl;
  };

  const getDarkLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-dark.png');
    return data.publicUrl;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Current Logos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg">
              <p className="text-white text-sm mb-2">Light Logo (on dark background)</p>
              <img 
                src={getLightLogoUrl()}
                alt="Light Logo"
                className="h-16 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
            
            <div className="p-4 bg-white border rounded-lg">
              <p className="text-slate-900 text-sm mb-2">Dark Logo (on light background)</p>
              <img 
                src={getDarkLogoUrl()}
                alt="Dark Logo"
                className="h-16 w-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmMWYxZjEiLz48dGV4dCB4PSI1MCIgeT0iMjQiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <LogoUpload />
    </div>
  );
};

export default LogoSettings;
