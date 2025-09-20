
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { UserPresenceProvider } from '@/contexts/UserPresenceContext';
import { Toaster } from '@/components/ui/toaster';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Messages from '@/pages/Messages'; 
import Notifications from '@/pages/Notifications';
import Gallery from '@/pages/Gallery';
import Settings from '@/pages/Settings';
import Reels from '@/pages/Reels';
import Music from '@/pages/Music';
import Games from '@/pages/Games';
import Search from '@/pages/Search';
import Professional from '@/pages/Professional';
import CreateProfessionalAccount from '@/pages/CreateProfessionalAccount';
import ProfessionalAccountProfile from '@/pages/ProfessionalAccountProfile';
import EditProfessionalAccount from '@/pages/EditProfessionalAccount';
import BusinessDashboard from '@/pages/BusinessDashboard';
import BusinessAnalytics from '@/pages/BusinessAnalytics';
import AdsManager from '@/pages/AdsManager';
import CreateAd from '@/pages/CreateAd';
import AIStudio from '@/pages/AIStudio';
import Explore from '@/pages/Explore';
import Hashtag from '@/pages/Hashtag';
import Pinned from '@/pages/Pinned';
import AdminDashboard from '@/pages/AdminDashboard';
import BusinessManagement from '@/pages/BusinessManagement';
import Support from '@/pages/Support';
import JoinGroup from '@/pages/JoinGroup';
import Events from '@/pages/Events';
import Collaboration from '@/pages/Collaboration';
import AuthWrapper from '@/components/AuthWrapper';
import BusinessPage from '@/pages/BusinessPage';
import WebRTCCallManager from '@/components/WebRTCCallManager';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserPresenceProvider>
            <NotificationsProvider>
              <Router>
                <div className="App min-h-screen w-full overflow-x-hidden">
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/home" element={<AuthWrapper><Home /></AuthWrapper>} />
                    <Route path="/explore" element={<AuthWrapper><Explore /></AuthWrapper>} />
                    <Route path="/reels" element={<AuthWrapper><Reels /></AuthWrapper>} />
                    <Route path="/profile/:userId" element={<AuthWrapper><Profile /></AuthWrapper>} />
                    <Route path="/hashtag/:hashtag" element={<AuthWrapper><Hashtag /></AuthWrapper>} />
                    <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
                    <Route path="/join-group/:inviteCode" element={<AuthWrapper><JoinGroup /></AuthWrapper>} />
                    <Route path="/notifications" element={<AuthWrapper><Notifications /></AuthWrapper>} />
                    <Route path="/gallery" element={<AuthWrapper><Gallery /></AuthWrapper>} />
                    <Route path="/settings" element={<AuthWrapper><Settings /></AuthWrapper>} />
                    <Route path="/music" element={<AuthWrapper><Music /></AuthWrapper>} />
                    <Route path="/games" element={<AuthWrapper><Games /></AuthWrapper>} />
                    <Route path="/search" element={<AuthWrapper><Search /></AuthWrapper>} />
                    <Route path="/pinned" element={<AuthWrapper><Pinned /></AuthWrapper>} />
                    <Route path="/professional" element={<AuthWrapper><Professional /></AuthWrapper>} />
                    <Route path="/create-professional" element={<AuthWrapper><CreateProfessionalAccount /></AuthWrapper>} />
                    <Route path="/create-professional-account" element={<AuthWrapper><CreateProfessionalAccount /></AuthWrapper>} />
                    <Route path="/professional/:pageId" element={<AuthWrapper><ProfessionalAccountProfile /></AuthWrapper>} />
                    <Route path="/edit-professional/:pageId" element={<AuthWrapper><EditProfessionalAccount /></AuthWrapper>} />
                    <Route path="/business-dashboard/:pageId" element={<AuthWrapper><BusinessDashboard /></AuthWrapper>} />
                    <Route path="/business-analytics" element={<AuthWrapper><BusinessAnalytics /></AuthWrapper>} />
                    <Route path="/business-management" element={<AuthWrapper><BusinessManagement /></AuthWrapper>} />
                    <Route path="/business" element={<AuthWrapper><BusinessManagement /></AuthWrapper>} />
                    <Route path="/business/:pageSlug/:pageId" element={<AuthWrapper><BusinessPage /></AuthWrapper>} />
                    <Route path="/business/:pageId" element={<AuthWrapper><BusinessDashboard /></AuthWrapper>} />
                    <Route path="/admin" element={<AuthWrapper><AdminDashboard /></AuthWrapper>} />
                    <Route path="/support" element={<AuthWrapper><Support /></AuthWrapper>} />
                    <Route path="/ads-manager" element={<AuthWrapper><AdsManager /></AuthWrapper>} />
                    <Route path="/create-ad" element={<AuthWrapper><CreateAd /></AuthWrapper>} />
                    <Route path="/ai-studio" element={<AuthWrapper><AIStudio /></AuthWrapper>} />
                    <Route path="/events" element={<AuthWrapper><Events /></AuthWrapper>} />
                    <Route path="/collaboration" element={<AuthWrapper><Collaboration /></AuthWrapper>} />
                  </Routes>
                  <Toaster />
                  <WebRTCCallManager />
                </div>
              </Router>
            </NotificationsProvider>
          </UserPresenceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
