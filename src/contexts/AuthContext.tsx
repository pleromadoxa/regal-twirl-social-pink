
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  // Add other profile fields as necessary
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, username: string, displayName: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Defer profile fetching to avoid blocking auth state changes
        setTimeout(() => {
          if (mounted) {
            fetchProfile(session.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
      }
      
      if (mounted) {
        setLoading(false);
      }
    });

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          setTimeout(() => {
            if (mounted) {
              fetchProfile(session.user.id);
            }
          }, 0);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, that's okay for now
        if (error.code !== 'PGRST116') {
          console.error('Unexpected profile fetch error:', error);
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Add a small delay to ensure UI state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log('Sign in successful:', data.user?.id);
      return { error: null, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: new Error('Failed to sign in. Please check your internet connection and try again.') };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username,
            display_name: displayName,
          },
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      if (data.user?.id && !data.user.email_confirmed_at) {
        // User needs to confirm email
        return { error: null, needsConfirmation: true };
      }

      if (data.user?.id) {
        await createProfile(data.user.id, username, displayName);
      }

      return { error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: new Error('Failed to sign up') };
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string, username: string, displayName: string) => {
    try {
      const { error } = await supabase.from('profiles').insert([
        {
          id: userId,
          username: username,
          display_name: displayName,
          avatar_url: '',
        },
      ]);

      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) {
      console.error('No user signed in.');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
      } else {
        setProfile((prevProfile) => ({
          ...prevProfile!,
          ...profileData,
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
