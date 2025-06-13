
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Star,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  ExternalLink,
  Clock,
  Award,
  Briefcase,
  Target,
  TrendingUp,
  Heart,
  Share2
} from 'lucide-react';

const ProfessionalAccountProfile = () => {
  const { pageId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [businessPage, setBusinessPage] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (pageId) {
      fetchBusinessPage();
      fetchBusinessPosts();
      fetchBusinessServices();
      fetchBusinessReviews();
    }
  }, [pageId]);

  const fetchBusinessPage = async () => {
    try {
      const { data, error } = await supabase
        .from('business_pages')
        .select(`
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('id', pageId)
        .single();

      if (error) throw error;
      setBusinessPage(data);

      // Check if user is following this business
      if (user) {
        const { data: followData } = await supabase
          .from('business_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('business_page_id', pageId)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (error) {
      console.error('Error fetching business page:', error);
      toast({
        title: "Error",
        description: "Failed to load business page",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', pageId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching business posts:', error);
    }
  };

  const fetchBusinessServices = async () => {
    // Mock services data for demonstration
    setServices([
      {
        id: 1,
        name: "Website Development",
        description: "Custom website development with modern technologies",
        price: "$2,000 - $10,000",
        duration: "4-8 weeks"
      },
      {
        id: 2,
        name: "Digital Marketing",
        description: "Comprehensive digital marketing strategy and execution",
        price: "$500 - $2,000/month",
        duration: "Ongoing"
      },
      {
        id: 3,
        name: "Business Consultation",
        description: "Strategic business consultation and planning",
        price: "$150/hour",
        duration: "1-2 hours"
      }
    ]);
  };

  const fetchBusinessReviews = async () => {
    // Mock reviews data for demonstration
    setReviews([
      {
        id: 1,
        reviewer_name: "John Smith",
        rating: 5,
        comment: "Excellent service! Highly professional and delivered on time.",
        created_at: "2024-01-15"
      },
      {
        id: 2,
        reviewer_name: "Sarah Johnson",
        rating: 4,
        comment: "Great experience working with this team. Would recommend!",
        created_at: "2024-01-10"
      }
    ]);
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow businesses",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('business_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('business_page_id', pageId);

        if (error) throw error;
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${businessPage?.page_name}`
        });
      } else {
        const { error } = await supabase
          .from('business_follows')
          .insert({
            follower_id: user.id,
            business_page_id: pageId
          });

        if (error) throw error;
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${businessPage?.page_name}`
        });
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive"
      });
    }
  };

  const handleMessage = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }
    
    navigate('/messages');
  };

  const formatBusinessType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'retail': return '🛍️';
      case 'healthcare': return '🏥';
      case 'education': return '🎓';
      case 'technology': return '💻';
      case 'consulting': return '📊';
      case 'finance': return '💰';
      case 'real_estate': return '🏠';
      case 'entertainment': return '🎭';
      case 'fitness': return '💪';
      case 'beauty': return '💄';
      case 'automotive': return '🚗';
      case 'legal': return '⚖️';
      case 'construction': return '🏗️';
      case 'marketing': return '📢';
      case 'photography': return '📸';
      case 'travel': return '✈️';
      case 'nonprofit': return '❤️';
      case 'ecommerce': return '🛒';
      case 'it_services': return '🔧';
      case 'import_export': return '🚢';
      default: return '🏢';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 pl-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (!businessPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
        <SidebarNav />
        <div className="flex-1 pl-80 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Business Page Not Found</h3>
            <p className="text-slate-600 mb-4">The business page you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/professional')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-6 z-10">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/professional')}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {businessPage.page_name}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {getBusinessTypeIcon(businessPage.business_type)} {formatBusinessType(businessPage.business_type)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Business Profile Header */}
            <Card className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-blue-500/10 border-purple-200/50 dark:border-purple-800/50 backdrop-blur-xl shadow-xl">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                      <AvatarImage src={businessPage.logo_url} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-2xl">
                        {businessPage.page_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                          {businessPage.page_name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            {formatBusinessType(businessPage.business_type)}
                          </Badge>
                          {businessPage.verified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleFollow}
                          variant={isFollowing ? "outline" : "default"}
                          className={!isFollowing ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" : ""}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button onClick={handleMessage} variant="outline">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {businessPage.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {businessPage.location && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{businessPage.location}</span>
                        </div>
                      )}
                      {businessPage.website && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Globe className="w-4 h-4 text-purple-500" />
                          <a 
                            href={businessPage.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm hover:text-purple-600 flex items-center gap-1"
                          >
                            Website
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {businessPage.phone && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Phone className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{businessPage.phone}</span>
                        </div>
                      )}
                      {businessPage.email && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Mail className="w-4 h-4 text-purple-500" />
                          <span className="text-sm">{businessPage.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">1.2K</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Followers</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">4.8</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Rating</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">150+</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Projects</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">98%</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Success Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about">
                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <CardTitle>About {businessPage.page_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {businessPage.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          Business Hours
                        </h4>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex justify-between">
                            <span>Monday - Friday</span>
                            <span>9:00 AM - 6:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday</span>
                            <span>10:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday</span>
                            <span>Closed</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-500" />
                          Specializations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Web Development</Badge>
                          <Badge variant="outline">Mobile Apps</Badge>
                          <Badge variant="outline">UI/UX Design</Badge>
                          <Badge variant="outline">Digital Marketing</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services">
                <div className="grid gap-4">
                  {services.map((service) => (
                    <Card key={service.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            {service.name}
                          </h3>
                          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {service.price}
                          </Badge>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          {service.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Clock className="w-4 h-4" />
                            {service.duration}
                          </div>
                          <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                            Get Quote
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="posts">
                <div className="space-y-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <Card key={post.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                        <CardContent className="p-6">
                          <p className="text-slate-800 dark:text-slate-200">{post.content}</p>
                          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <Button variant="ghost" size="sm">
                              <Heart className="w-4 h-4 mr-1" />
                              Like
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Comment
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
                          No posts yet
                        </h3>
                        <p className="text-slate-500">
                          This business hasn't shared any posts yet.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-purple-200/50 dark:border-purple-800/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                              {review.reviewer_name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating ? 'text-yellow-500 fill-current' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-slate-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {review.comment}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default ProfessionalAccountProfile;
