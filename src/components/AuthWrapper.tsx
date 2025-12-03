
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Ban, Clock, UserX } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('account_status, status_reason, status_until')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ account_status: 'active' }); // Default to active if error
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setUserProfile({ account_status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Check if user account is restricted
  if (user && userProfile) {
    const { account_status, status_reason, status_until } = userProfile;
    
    if (account_status === 'blocked') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Ban className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-600">Account Blocked</CardTitle>
              <CardDescription>
                Your account has been permanently blocked and you cannot access Regal Network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>Reason:</strong> {status_reason}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center">
                If you believe this is an error, please contact our support team at support@myregal.online
              </p>
              <Button onClick={handleSignOut} className="w-full" variant="outline">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (account_status === 'suspended') {
      const suspensionEnd = status_until ? new Date(status_until) : null;
      const isTemporary = suspensionEnd && suspensionEnd > new Date();
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserX className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-600">Account Suspended</CardTitle>
              <CardDescription>
                Your account has been suspended and you cannot access Regal Network.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status_reason && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-orange-700 dark:text-orange-400">
                    <strong>Reason:</strong> {status_reason}
                  </p>
                </div>
              )}
              {isTemporary && suspensionEnd && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Suspension ends:</strong> {suspensionEnd.toLocaleDateString()} at {suspensionEnd.toLocaleTimeString()}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center">
                If you believe this is an error, please contact our support team at support@myregal.online
              </p>
              <Button onClick={handleSignOut} className="w-full" variant="outline">
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (account_status === 'limited') {
      // For limited accounts, show a banner but allow access with restrictions
      const limitedFeatures = ['posting', 'commenting', 'messaging', 'calling'];
      
      return (
        <div className="min-h-screen">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Account Limited
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Some features are restricted: {limitedFeatures.join(', ')}.
                  {status_reason && ` Reason: ${status_reason}`}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => window.open('mailto:support@myregal.online')}>
                Contact Support
              </Button>
            </div>
          </div>
          {children}
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default AuthWrapper;
