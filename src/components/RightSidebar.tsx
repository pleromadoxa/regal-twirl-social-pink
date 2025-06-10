import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  ExternalLink,
  Crown,
  Briefcase,
  Phone,
  MessageCircle
} from "lucide-react";
import TrendingWidget from "./TrendingWidget";
import ProfessionalUsersWidget from "./ProfessionalUsersWidget";
import BibleVerseWidget from "./BibleVerseWidget";
import StockMarketWidget from "./StockMarketWidget";
import PriceAlertsWidget from "./PriceAlertsWidget";
import FinancialNewsFeed from "./FinancialNewsFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const RightSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeWidget, setActiveWidget] = useState<string>("trending");

  const widgets = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "users", label: "Users", icon: Users },
    { id: "bible", label: "Verse", icon: Calendar },
    { id: "finance", label: "Finance", icon: Briefcase },
  ];

  const renderActiveWidget = () => {
    switch (activeWidget) {
      case "trending":
        return <TrendingWidget />;
      case "users":
        return <ProfessionalUsersWidget />;
      case "bible":
        return <BibleVerseWidget showHeader={false} />;
      case "finance":
        return (
          <div className="space-y-4">
            <StockMarketWidget />
            <PriceAlertsWidget />
            <FinancialNewsFeed />
          </div>
        );
      default:
        return <TrendingWidget />;
    }
  };

  // Mock suggested users data
  const suggestedUsers = [
    {
      id: "1",
      username: "techguru",
      displayName: "Tech Guru",
      avatar: "",
      followers: "12.5K",
      isVerified: true,
      bio: "Technology enthusiast & entrepreneur"
    },
    {
      id: "2", 
      username: "designpro",
      displayName: "Design Pro",
      avatar: "",
      followers: "8.2K",
      isVerified: false,
      bio: "UI/UX Designer & Creative Director"
    },
    {
      id: "3",
      username: "marketingmaven",
      displayName: "Marketing Maven",
      avatar: "",
      followers: "15.3K",
      isVerified: true,
      bio: "Digital marketing strategist"
    }
  ];

  // Mock upcoming events
  const upcomingEvents = [
    {
      id: "1",
      title: "Tech Conference 2024",
      date: "Dec 15, 2024",
      location: "San Francisco, CA",
      attendees: 250
    },
    {
      id: "2",
      title: "Design Workshop",
      date: "Dec 20, 2024", 
      location: "Online",
      attendees: 89
    }
  ];

  return (
    <aside className="w-80 p-6 space-y-6 overflow-y-auto">
      {/* Widget Selector */}
      <Card className="border-purple-200 dark:border-purple-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <Button
                  key={widget.id}
                  variant={activeWidget === widget.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveWidget(widget.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {widget.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Widget */}
      <div className="space-y-6">
        {renderActiveWidget()}
      </div>

      {/* Suggested Users */}
      <Card className="border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Who to follow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {suggestedUsers.map((suggestedUser) => (
            <div key={suggestedUser.id} className="flex items-start space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={suggestedUser.avatar} />
                <AvatarFallback>
                  {suggestedUser.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">
                    {suggestedUser.displayName}
                  </p>
                  {suggestedUser.isVerified && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">@{suggestedUser.username}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {suggestedUser.bio}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{suggestedUser.followers} followers</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-7 px-2">
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-3 text-xs">
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
              <h4 className="font-semibold text-sm mb-1">{event.title}</h4>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-1">
                <Calendar className="w-3 h-3" />
                {event.date}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-2">
                <MapPin className="w-3 h-3" />
                {event.location}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{event.attendees} attending</span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                  Join
                </Button>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-purple-600 hover:text-purple-700">
            <ExternalLink className="w-4 h-4 mr-2" />
            View all events
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {user && (
        <Card className="border-purple-200 dark:border-purple-700">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/messages')}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Messages
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
            >
              <Phone className="w-4 h-4 mr-2" />
              Start Call
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => navigate('/professional')}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Business
            </Button>
          </CardContent>
        </Card>
      )}
    </aside>
  );
};

export default RightSidebar;
