import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Explore from "@/pages/Explore";
import Hashtag from "@/pages/Hashtag";
import Games from "@/pages/Games";
import Pinned from "@/pages/Pinned";
import BusinessManagement from "@/pages/BusinessManagement";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessAnalytics from "@/pages/BusinessAnalytics";
import AdsManager from "@/pages/AdsManager";
import ProfessionalAccounts from "@/pages/ProfessionalAccounts";
import ProfessionalDirectory from "@/pages/ProfessionalDirectory";
import ProfessionalAccountProfile from "@/pages/ProfessionalAccountProfile";
import EditProfessionalAccount from "@/pages/EditProfessionalAccount";
import Music from "@/pages/Music";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <NotificationsProvider>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Index />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/hashtag/:hashtag" element={<Hashtag />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/pinned" element={<Pinned />} />
                  <Route path="/business-management" element={<BusinessManagement />} />
                  <Route path="/business/:pageId" element={<BusinessDashboard />} />
                  <Route path="/business-analytics" element={<BusinessAnalytics />} />
                  <Route path="/ads-manager" element={<AdsManager />} />
                  <Route path="/professional" element={<ProfessionalAccounts />} />
                  <Route path="/professional-directory" element={<ProfessionalDirectory />} />
                  <Route path="/professional/:pageId" element={<ProfessionalAccountProfile />} />
                  <Route path="/edit-professional/:pageId" element={<EditProfessionalAccount />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </NotificationsProvider>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
