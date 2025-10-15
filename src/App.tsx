
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { UserPresenceProvider } from '@/contexts/UserPresenceContext';
import { UserLocationProvider } from '@/contexts/UserLocationContext';
import { Toaster } from '@/components/ui/toaster';
import AuthWrapper from '@/components/AuthWrapper';
import WebRTCCallManager from '@/components/WebRTCCallManager';
import FeatureIntroPopup from '@/components/FeatureIntroPopup';

// Eager load critical routes
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Home from '@/pages/Home';

// Lazy load secondary routes
const Profile = lazy(() => import('@/pages/Profile'));
const Messages = lazy(() => import('@/pages/Messages'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Settings = lazy(() => import('@/pages/Settings'));
const Reels = lazy(() => import('@/pages/Reels'));
const Music = lazy(() => import('@/pages/Music'));
const Games = lazy(() => import('@/pages/Games'));
const Search = lazy(() => import('@/pages/Search'));
const Professional = lazy(() => import('@/pages/Professional'));
const CreateProfessionalAccount = lazy(() => import('@/pages/CreateProfessionalAccount'));
const ProfessionalAccountProfile = lazy(() => import('@/pages/ProfessionalAccountProfile'));
const EditProfessionalAccount = lazy(() => import('@/pages/EditProfessionalAccount'));
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const BusinessAnalytics = lazy(() => import('@/pages/BusinessAnalytics'));
const AdsManager = lazy(() => import('@/pages/AdsManager'));
const CreateAd = lazy(() => import('@/pages/CreateAd'));
const TimeCapsules = lazy(() => import('@/pages/TimeCapsules'));
const MoodBoard = lazy(() => import('@/pages/MoodBoard'));
const CloseFriends = lazy(() => import('@/pages/CloseFriends'));
const BlockedUsers = lazy(() => import('@/pages/BlockedUsers'));
const MutedUsers = lazy(() => import('@/pages/MutedUsers'));
const FriendshipMilestones = lazy(() => import('@/pages/FriendshipMilestones'));
const AIStudio = lazy(() => import('@/pages/AIStudio'));
const Explore = lazy(() => import('@/pages/Explore'));
const Hashtag = lazy(() => import('@/pages/Hashtag'));
const Pinned = lazy(() => import('@/pages/Pinned'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const BusinessManagement = lazy(() => import('@/pages/BusinessManagement'));
const Support = lazy(() => import('@/pages/Support'));
const Events = lazy(() => import('@/pages/Events'));
const Collaboration = lazy(() => import('@/pages/Collaboration'));
const Circles = lazy(() => import('@/pages/Circles'));
const CircleCall = lazy(() => import('@/pages/CircleCall'));
const CircleCallWebRTC = lazy(() => import('@/pages/CircleCallWebRTC'));
const Challenges = lazy(() => import('@/pages/Challenges'));
const BusinessPage = lazy(() => import('@/pages/BusinessPage'));
const RegalAIEnginePage = lazy(() => import('@/pages/RegalAIEngine'));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserPresenceProvider>
            <UserLocationProvider>
              <NotificationsProvider>
                <Router>
                <div className="App min-h-screen w-full overflow-x-hidden">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/home" element={<AuthWrapper><Home /></AuthWrapper>} />
                      <Route path="/explore" element={<AuthWrapper><Explore /></AuthWrapper>} />
                      <Route path="/reels" element={<AuthWrapper><Reels /></AuthWrapper>} />
                      <Route path="/profile/:userId" element={<AuthWrapper><Profile /></AuthWrapper>} />
                      <Route path="/hashtag/:hashtag" element={<AuthWrapper><Hashtag /></AuthWrapper>} />
                      <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
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
                      <Route path="/circles" element={<AuthWrapper><Circles /></AuthWrapper>} />
                      <Route path="/circles/call" element={<AuthWrapper><CircleCall /></AuthWrapper>} />
                      <Route path="/circles/call-webrtc" element={<AuthWrapper><CircleCallWebRTC /></AuthWrapper>} />
                      <Route path="/challenges" element={<AuthWrapper><Challenges /></AuthWrapper>} />
                      <Route path="/time-capsules" element={<AuthWrapper><TimeCapsules /></AuthWrapper>} />
                      <Route path="/mood" element={<AuthWrapper><MoodBoard /></AuthWrapper>} />
                      <Route path="/settings/close-friends" element={<AuthWrapper><CloseFriends /></AuthWrapper>} />
                      <Route path="/settings/blocked-users" element={<AuthWrapper><BlockedUsers /></AuthWrapper>} />
                      <Route path="/settings/muted-users" element={<AuthWrapper><MutedUsers /></AuthWrapper>} />
                      <Route path="/friendship-milestones" element={<AuthWrapper><FriendshipMilestones /></AuthWrapper>} />
                      <Route path="/regal-ai" element={<AuthWrapper><RegalAIEnginePage /></AuthWrapper>} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                  <WebRTCCallManager />
                  <FeatureIntroPopup />
                </div>
                </Router>
              </NotificationsProvider>
            </UserLocationProvider>
          </UserPresenceProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
