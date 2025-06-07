import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WavyBackground } from '@/components/ui/wavy-background';
import { AppleHelloEnglishEffect } from '@/components/ui/apple-hello-effect';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
          navigate('/home');
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

  return (
    <div className="relative min-h-screen">
      <WavyBackground
        colors={["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"]}
        waveWidth={50}
        backgroundFill="rgb(15, 23, 42)"
        blur={10}
        speed="fast"
        waveOpacity={0.5}
        className="flex items-center justify-center"
      >
        <div className="w-full max-w-6xl flex items-center justify-center gap-12">
          {/* Left Side - Apple Hello Effect */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-1">
            <AppleHelloEnglishEffect 
              className="h-32 w-auto text-white stroke-white" 
              speed={1.2}
            />
            <p className="text-white/80 text-lg mt-4 text-center">
              Welcome to the Network
            </p>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-2xl">
            {/* Centered Logo */}
            <div className="flex justify-center mb-8">
              <img 
                src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png"
                alt="Network Logo" 
                className="h-20 w-auto"
              />
            </div>

            {/* Centered Auth Form */}
            <Card className="w-full bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                  {isLogin ? 'Welcome Back' : 'Join Network'}
                </CardTitle>
                <CardDescription className="text-slate-300">
                  {isLogin ? 'Sign in to your account' : 'Create your account'}
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
      </WavyBackground>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <div className="text-center py-4 px-6">
          <p className="text-sm text-white/70">
            © {new Date().getFullYear()} Regal Network Technologies. All rights reserved. Powered by Lovetap Technologies. Built with ♥️ for the Kingdom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
