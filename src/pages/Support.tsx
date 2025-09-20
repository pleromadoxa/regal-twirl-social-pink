
import { useState } from 'react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, MessageSquare, Mail, Phone, Clock } from 'lucide-react';
import SupportTicketDialog from '@/components/SupportTicketDialog';

const Support = () => {
  const isMobile = useIsMobile();
  const [showTicketDialog, setShowTicketDialog] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />

      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 max-w-6xl mx-auto">
          {/* Enhanced Header */}
          <div className="mb-6 p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
                <HelpCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Support Center
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Get help with your account and issues</p>
              </div>
            </div>
          </div>

          {/* Support Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setShowTicketDialog(true)}>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-purple-600" />
                <h3 className="font-semibold mb-2">Submit a Ticket</h3>
                <p className="text-sm text-gray-600">Report issues or request help</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-gray-600">support@regalnetwork.com</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-gray-600">Usually within 24 hours</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">How do I upgrade my account?</h4>
                <p className="text-gray-600">You can upgrade your account by going to Settings → Subscription and choosing a plan that fits your needs.</p>
              </div>
              <div className="border-b pb-4">
                <h4 className="font-semibold mb-2">How do I create a business page?</h4>
                <p className="text-gray-600">Navigate to the Professional section in the sidebar and click "Create Business Page" to get started.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How do I reset my password?</h4>
                <p className="text-gray-600">Use the "Forgot Password" link on the login page to reset your password via email.</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
      
      <SupportTicketDialog 
        ticket={null}
        isOpen={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        onUpdate={() => {}}
      />
    </div>
  );
};

export default Support;
