
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
import RegalAIEngine from '@/pages/RegalAIEngine';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationsProvider>
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/music" element={<Music />} />
                  <Route path="/games" element={<Games />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/professional" element={<Professional />} />
                  <Route path="/create-professional" element={<CreateProfessionalAccount />} />
                  <Route path="/professional/:pageId" element={<ProfessionalAccountProfile />} />
                  <Route path="/edit-professional/:pageId" element={<EditProfessionalAccount />} />
                  <Route path="/business-dashboard/:pageId" element={<BusinessDashboard />} />
                  <Route path="/ai-engine" element={<RegalAIEngine />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
