
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in."
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, username, displayName);
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a confirmation link."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Get logo URL from Supabase storage
  const getLogoUrl = () => {
    const { data } = supabase.storage
      .from('logos')
      .getPublicUrl('regal-network-light.png');
    return data.publicUrl;
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Animated Globe Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="relative">
          <Globe className="w-96 h-96 text-white animate-spin" style={{ animationDuration: '30s' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent rounded-full" />
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          {/* Centered Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={getLogoUrl()}
              alt="Regal Network Logo" 
              className="h-20 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'h-20 flex items-center justify-center text-white text-2xl font-bold';
                fallback.textContent = 'Regal Network';
                target.parentNode?.appendChild(fallback);
              }}
            />
          </div>

          {/* Centered Auth Form */}
          <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">
                {isLogin ? 'Welcome Back' : 'Join Regal Network'}
              </CardTitle>
              <CardDescription className="text-slate-300">
                {isLogin ? 'Sign in to your account' : 'Create your royal account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400"
                    placeholder="Enter your password"
                  />
                </div>

                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400"
                        placeholder="Choose a username"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-400"
                        placeholder="Your display name"
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-purple-300 hover:text-purple-200"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
