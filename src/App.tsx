
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Messages from "./pages/Messages";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import Hashtag from "./pages/Hashtag";
import Pinned from "./pages/Pinned";
import ProfessionalAccounts from "./pages/ProfessionalAccounts";
import EditProfessionalAccount from "./pages/EditProfessionalAccount";
import ProfessionalAccountProfile from "./pages/ProfessionalAccountProfile";
import BusinessManagement from "./pages/BusinessManagement";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessAnalytics from "./pages/BusinessAnalytics";
import AdsManager from "./pages/AdsManager";
import ProfessionalDirectory from "./pages/ProfessionalDirectory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="w-full">
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<Index />} />
                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/hashtag/:hashtag" element={<Hashtag />} />
                  <Route path="/pinned" element={<Pinned />} />
                  <Route path="/professional" element={<ProfessionalAccounts />} />
                  <Route path="/professional-accounts" element={<ProfessionalDirectory />} />
                  <Route path="/professional/:id/edit" element={<EditProfessionalAccount />} />
                  <Route path="/professional/:id" element={<ProfessionalAccountProfile />} />
                  <Route path="/business" element={<BusinessManagement />} />
                  <Route path="/business/:id" element={<BusinessDashboard />} />
                  <Route path="/business-analytics" element={<BusinessAnalytics />} />
                  <Route path="/ads-manager" element={<AdsManager />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
