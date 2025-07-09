
import { useAuth } from "@/contexts/AuthContext";
import SidebarNav from "@/components/SidebarNav";
import RightSidebar from "@/components/RightSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Briefcase, Users, TrendingUp } from "lucide-react";

const Professional = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[400px] max-w-full overflow-hidden">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-4xl mx-auto min-w-0">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Professional Hub</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Create Business Page
                  </CardTitle>
                  <CardDescription>
                    Set up your professional presence
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to="/create-professional">
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Browse Professionals
                  </CardTitle>
                  <CardDescription>
                    Discover professional accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">Explore</Button>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Analytics
                  </CardTitle>
                  <CardDescription>
                    Track your professional growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">View Stats</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <RightSidebar />
    </div>
  );
};

export default Professional;
