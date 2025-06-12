
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Explore from "@/pages/Explore";
import Notifications from "@/pages/Notifications";
import Pinned from "@/pages/Pinned";
import Hashtag from "@/pages/Hashtag";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessManagement from "@/pages/BusinessManagement";
import ProfessionalAccounts from "@/pages/ProfessionalAccounts";
import ProfessionalAccountProfile from "@/pages/ProfessionalAccountProfile";
import EditProfessionalAccount from "@/pages/EditProfessionalAccount";
import BusinessAnalytics from "@/pages/BusinessAnalytics";
import AdsManager from "@/pages/AdsManager";
import ProfessionalDirectory from "@/pages/ProfessionalDirectory";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/pinned" element={<Pinned />} />
                <Route path="/hashtag/:tag" element={<Hashtag />} />
                <Route path="/business/:businessId" element={<BusinessDashboard />} />
                <Route path="/business-management" element={<BusinessManagement />} />
                <Route path="/professional" element={<ProfessionalAccounts />} />
                <Route path="/professional/:pageId" element={<ProfessionalAccountProfile />} />
                <Route path="/edit-professional/:pageId" element={<EditProfessionalAccount />} />
                <Route path="/business-analytics" element={<BusinessAnalytics />} />
                <Route path="/ads-manager" element={<AdsManager />} />
                <Route path="/professional-directory" element={<ProfessionalDirectory />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
