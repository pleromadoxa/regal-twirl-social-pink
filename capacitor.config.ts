import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.853ecfed2e534ac787e4286a0a28203a',
  appName: 'regal-twirl-social-pink',
  webDir: 'dist',
  server: {
    url: "https://853ecfed-2e53-4ac7-87e4-286a0a28203a.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3b82f6",
      showSpinner: false
    }
  }
};

export default config;