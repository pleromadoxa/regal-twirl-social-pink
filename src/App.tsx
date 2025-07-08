
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
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
import AuthWrapper from '@/components/AuthWrapper';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App min-h-screen w-full overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/home" element={<AuthWrapper><Home /></AuthWrapper>} />
                <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
                <Route path="/messages" element={<AuthWrapper><Messages /></AuthWrapper>} />
                <Route path="/notifications" element={<AuthWrapper><Notifications /></AuthWrapper>} />
                <Route path="/gallery" element={<AuthWrapper><Gallery /></AuthWrapper>} />
                <Route path="/settings" element={<AuthWrapper><Settings /></AuthWrapper>} />
                <Route path="/reels" element={<AuthWrapper><Reels /></AuthWrapper>} />
                <Route path="/music" element={<AuthWrapper><Music /></AuthWrapper>} />
                <Route path="/games" element={<AuthWrapper><Games /></AuthWrapper>} />
                <Route path="/search" element={<AuthWrapper><Search /></AuthWrapper>} />
                <Route path="/professional" element={<AuthWrapper><Professional /></AuthWrapper>} />
                <Route path="/create-professional" element={<AuthWrapper><CreateProfessionalAccount /></AuthWrapper>} />
                <Route path="/professional/:pageId" element={<AuthWrapper><ProfessionalAccountProfile /></AuthWrapper>} />
                <Route path="/edit-professional/:pageId" element={<AuthWrapper><EditProfessionalAccount /></AuthWrapper>} />
                <Route path="/business-dashboard/:pageId" element={<AuthWrapper><BusinessDashboard /></AuthWrapper>} />
                <Route path="/ai-engine" element={<AuthWrapper><RegalAIEngine /></AuthWrapper>} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
