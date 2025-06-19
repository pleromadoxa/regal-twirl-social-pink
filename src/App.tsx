
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import AuthWrapper from "./components/AuthWrapper";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Games from "./pages/Games";
import Music from "./pages/Music";
import Pinned from "./pages/Pinned";
import ProfessionalAccounts from "./pages/ProfessionalAccounts";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import AdsManager from "./pages/AdsManager";
import AIStudio from "./pages/AIStudio";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-20 animate-pulse"></div>
        <img 
          src="/lovable-uploads/793ed9cd-aba3-48c4-b69c-6e09bf34f5fa.png" 
          alt="Regal Network Logo" 
          className="h-16 w-auto mx-auto relative z-10" 
        />
      </div>
      <h1 className="font-bold text-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-pink-400 mb-2">
        Regal Network
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-4">Loading...</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
    </div>
  </div>
);

// AuthenticatedRoutes component that wraps authenticated routes with NotificationsProvider
const AuthenticatedRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <NotificationsProvider>
      <Routes>
        <Route path="/home" element={<AuthWrapper><Index /></AuthWrapper>} />
        <Route path="/profile/:userId" element={<AuthWrapper><Profile /></AuthWrapper>} />
        <Route path="/settings" element={<AuthWrapper><Settings /></AuthWrapper>} />
        <Route path="/explore" element={<AuthWrapper><Explore /></AuthWrapper>} />
        <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
        <Route path="/notifications" element={<AuthWrapper><Notifications /></AuthWrapper>} />
        <Route path="/games" element={<AuthWrapper><Games /></AuthWrapper>} />
        <Route path="/music" element={<AuthWrapper><Music /></AuthWrapper>} />
        <Route path="/pinned" element={<AuthWrapper><Pinned /></AuthWrapper>} />
        <Route path="/professional" element={<AuthWrapper><ProfessionalAccounts /></AuthWrapper>} />
        <Route path="/business/:pageId" element={<AuthWrapper><BusinessDashboard /></AuthWrapper>} />
        <Route path="/business-analytics" element={<AuthWrapper><BusinessAnalytics /></AuthWrapper>} />
        <Route path="/ads-manager" element={<AuthWrapper><AdsManager /></AuthWrapper>} />
        <Route path="/ai-studio" element={<AuthWrapper><AIStudio /></AuthWrapper>} />
        <Route path="/admin" element={<AuthWrapper><AdminDashboard /></AuthWrapper>} />
      </Routes>
    </NotificationsProvider>
  );
};

// App Routes component that uses auth
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />
        <Route path="/*" element={<AuthenticatedRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
