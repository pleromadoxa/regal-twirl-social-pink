
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Explore from "./pages/Explore";
import Hashtag from "./pages/Hashtag";
import Pinned from "./pages/Pinned";
import ProfessionalAccounts from "./pages/ProfessionalAccounts";
import ProfessionalAccountProfile from "./pages/ProfessionalAccountProfile";
import EditProfessionalAccount from "./pages/EditProfessionalAccount";
import NotFound from "./pages/NotFound";
import WebRTCCallManager from "./components/WebRTCCallManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={<Index />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/hashtag/:hashtag" element={<Hashtag />} />
              <Route path="/pinned" element={<Pinned />} />
              <Route path="/professional" element={<ProfessionalAccounts />} />
              <Route path="/professional/:pageId" element={<ProfessionalAccountProfile />} />
              <Route path="/professional/:pageId/edit" element={<EditProfessionalAccount />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <WebRTCCallManager />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
