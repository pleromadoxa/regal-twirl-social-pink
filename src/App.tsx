
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import RegalAIBot from "@/components/RegalAIBot";
import AuthWrapper from "@/components/AuthWrapper";

// Lazy load components
const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Settings = lazy(() => import("./pages/Settings"));
const Music = lazy(() => import("./pages/Music"));
const Games = lazy(() => import("./pages/Games"));
const Explore = lazy(() => import("./pages/Explore"));
const ProfessionalAccounts = lazy(() => import("./pages/ProfessionalAccounts"));
const ProfessionalDirectory = lazy(() => import("./pages/ProfessionalDirectory"));
const ProfessionalAccountProfile = lazy(() => import("./pages/ProfessionalAccountProfile"));
const EditProfessionalAccount = lazy(() => import("./pages/EditProfessionalAccount"));
const BusinessDashboard = lazy(() => import("./pages/BusinessDashboard"));
const BusinessManagement = lazy(() => import("./pages/BusinessManagement"));
const BusinessAnalytics = lazy(() => import("./pages/BusinessAnalytics"));
const AdsManager = lazy(() => import("./pages/AdsManager"));
const AIStudio = lazy(() => import("./pages/AIStudio"));
const Hashtag = lazy(() => import("./pages/Hashtag"));
const Pinned = lazy(() => import("./pages/Pinned"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationsProvider>
          <BrowserRouter>
            <AuthWrapper>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/home" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/music" element={<Music />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/professional" element={<ProfessionalAccounts />} />
                    <Route path="/professional/directory" element={<ProfessionalDirectory />} />
                    <Route path="/professional/:id" element={<ProfessionalAccountProfile />} />
                    <Route path="/professional/edit/:id" element={<EditProfessionalAccount />} />
                    <Route path="/business" element={<BusinessDashboard />} />
                    <Route path="/business/management" element={<BusinessManagement />} />
                    <Route path="/business/analytics" element={<BusinessAnalytics />} />
                    <Route path="/ads" element={<AdsManager />} />
                    <Route path="/ai-studio" element={<AIStudio />} />
                    <Route path="/hashtag/:tag" element={<Hashtag />} />
                    <Route path="/pinned" element={<Pinned />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <RegalAIBot />
              </div>
            </AuthWrapper>
            <Toaster />
            <Sonner />
          </BrowserRouter>
        </NotificationsProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
