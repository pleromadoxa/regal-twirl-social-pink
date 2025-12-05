import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  ShoppingBag, Plus, Search, MapPin, DollarSign, Tag, Package, Eye, 
  MessageCircle, Trash2, Edit2, Heart, Share2, Filter, Globe, TrendingUp,
  Clock, CheckCircle, Star, Grid, List, SlidersHorizontal, X, Image as ImageIcon,
  Car, Home, Laptop, Shirt, BookOpen, Dumbbell, Briefcase, MoreHorizontal,
  ChevronRight, Sparkles, Shield, Verified
} from 'lucide-react';

const CATEGORIES = [
  { value: 'vehicles', label: 'Vehicles', icon: Car, color: 'from-blue-500 to-cyan-500' },
  { value: 'real_estate', label: 'Real Estate', icon: Home, color: 'from-green-500 to-emerald-500' },
  { value: 'electronics', label: 'Electronics', icon: Laptop, color: 'from-purple-500 to-violet-500' },
  { value: 'fashion', label: 'Fashion', icon: Shirt, color: 'from-pink-500 to-rose-500' },
  { value: 'books', label: 'Books & Media', icon: BookOpen, color: 'from-amber-500 to-orange-500' },
  { value: 'sports', label: 'Sports & Fitness', icon: Dumbbell, color: 'from-red-500 to-pink-500' },
  { value: 'services', label: 'Services', icon: Briefcase, color: 'from-indigo-500 to-blue-500' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, color: 'from-slate-500 to-zinc-500' }
];

const CONDITIONS = [
  { value: 'new', label: 'Brand New', badge: 'bg-green-500' },
  { value: 'like_new', label: 'Like New', badge: 'bg-emerald-500' },
  { value: 'good', label: 'Good', badge: 'bg-blue-500' },
  { value: 'fair', label: 'Fair', badge: 'bg-amber-500' },
  { value: 'poor', label: 'For Parts', badge: 'bg-red-500' }
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'KES', 'ZAR', 'INR', 'CNY'];

const Marketplace = () => {
  const isMobile = useIsMobile();
  const { user, profile } = useAuth();
  const { 
    listings, myListings, loading, fetchListings, createListing, 
    deleteListing, markAsSold, updateListing 
  } = useMarketplace();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState<MarketplaceListing | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: '',
    condition: '',
    location: '',
    images: [] as string[]
  });

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter(l => l.status === 'active').length,
    myListingsCount: myListings.length,
    totalViews: listings.reduce((acc, l) => acc + (l.views_count || 0), 0)
  };

  const handleSearch = () => {
    const category = selectedCategory === 'all' ? undefined : selectedCategory;
    fetchListings(category, searchTerm);
  };

  useEffect(() => {
    handleSearch();
  }, [selectedCategory]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      toast.success(`${uploadedUrls.length} image(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCreateListing = async () => {
    if (!formData.title || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    await createListing({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      currency: formData.currency,
      category: formData.category || undefined,
      condition: formData.condition as any || undefined,
      location: formData.location || undefined,
      images: formData.images
    });

    setFormData({ title: '', description: '', price: '', currency: 'USD', category: '', condition: '', location: '', images: [] });
    setDialogOpen(false);
  };

  const CategoryCard = ({ category }: { category: typeof CATEGORIES[0] }) => {
    const Icon = category.icon;
    const count = listings.filter(l => l.category === category.value).length;
    
    return (
      <button
        onClick={() => setSelectedCategory(category.value)}
        className={`flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105 ${
          selectedCategory === category.value 
            ? 'bg-primary text-primary-foreground shadow-lg' 
            : 'bg-card hover:bg-accent border border-border'
        }`}
      >
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-2`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-medium">{category.label}</span>
        <span className="text-xs text-muted-foreground">{count} items</span>
      </button>
    );
  };

  const ListingCard = ({ listing }: { listing: MarketplaceListing }) => {
    const conditionInfo = CONDITIONS.find(c => c.value === listing.condition);
    
    return (
      <Card 
        className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-border/50"
        onClick={() => setDetailDialog(listing)}
      >
        <div className="relative aspect-square overflow-hidden">
          {listing.images?.[0] ? (
            <img 
              src={listing.images[0]} 
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/50" />
            </div>
          )}
          
          {listing.status === 'sold' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Badge className="bg-red-600 text-white text-lg px-4 py-2">SOLD</Badge>
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {listing.condition && conditionInfo && (
              <Badge className={`${conditionInfo.badge} text-white`}>
                {conditionInfo.label}
              </Badge>
            )}
          </div>
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-2xl font-bold text-white">
              {listing.currency} {listing.price.toLocaleString()}
            </p>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.views_count || 0} views
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(listing.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {listing.seller && (
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={listing.seller.avatar_url} />
                  <AvatarFallback>{listing.seller.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {listing.seller.display_name}
                    <Verified className="w-3 h-3 text-primary" />
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); }}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ListingListItem = ({ listing }: { listing: MarketplaceListing }) => (
    <Card className="flex gap-4 p-4 hover:shadow-lg transition-all cursor-pointer" onClick={() => setDetailDialog(listing)}>
      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
            <p className="text-xl font-bold text-primary">{listing.currency} {listing.price.toLocaleString()}</p>
          </div>
          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>{listing.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{listing.description}</p>
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          {listing.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location}</span>}
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{listing.views_count || 0}</span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      
      <main className={`flex-1 ${isMobile ? 'px-4 pb-20' : 'ml-80'} p-4 lg:p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                Global Marketplace
              </h1>
              <p className="text-muted-foreground mt-1">Buy and sell globally with trusted members</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Create New Listing
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <Label>Photos (up to 10)</Label>
                    <div className="mt-2 grid grid-cols-4 gap-2">
                      {formData.images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {formData.images.length < 10 && (
                        <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Add Photo</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploadingImages} />
                        </label>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What are you selling?"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Price *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Currency</Label>
                      <Select value={formData.currency} onValueChange={(v) => setFormData(prev => ({ ...prev, currency: v }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your item in detail..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITIONS.map(c => (
                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleCreateListing} className="w-full" disabled={uploadingImages}>
                    {uploadingImages ? 'Uploading...' : 'Publish Listing'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                  <p className="text-xs text-muted-foreground">Total Listings</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeListings}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.myListingsCount}</p>
                  <p className="text-xs text-muted-foreground">My Listings</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-xs text-muted-foreground">Total Views</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Browse Categories
            </h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => setSelectedCategory(undefined)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105 min-w-[100px] ${
                    !selectedCategory ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card hover:bg-accent border border-border'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center mb-2">
                    <Grid className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium">All</span>
                  <span className="text-xs text-muted-foreground">{listings.length}</span>
                </button>
                {CATEGORIES.map(cat => (
                  <CategoryCard key={cat.value} category={cat} />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* Search & Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search marketplace..."
                    className="pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="popular">Most Popular</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  </Button>
                  <Button onClick={handleSearch}>Search</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="browse">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="browse" className="data-[state=active]:bg-background">
                <Globe className="w-4 h-4 mr-2" />
                Browse All
              </TabsTrigger>
              <TabsTrigger value="my-listings" className="data-[state=active]:bg-background">
                <Package className="w-4 h-4 mr-2" />
                My Listings
              </TabsTrigger>
              <TabsTrigger value="saved" className="data-[state=active]:bg-background">
                <Heart className="w-4 h-4 mr-2" />
                Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="aspect-square bg-muted" />
                      <CardContent className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-6 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                  <p className="text-muted-foreground mb-4">Be the first to sell something in this category!</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.map(listing => (
                    <ListingListItem key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-listings" className="mt-4">
              {myListings.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">Start selling to the global community!</p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Listing
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map(listing => (
                    <Card key={listing.id} className="overflow-hidden">
                      <ListingCard listing={listing} />
                      <div className="flex gap-2 p-4 pt-0 border-t">
                        <Button size="sm" variant="outline" onClick={() => markAsSold(listing.id)} disabled={listing.status === 'sold'} className="flex-1">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {listing.status === 'sold' ? 'Sold' : 'Mark Sold'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteListing(listing.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-4">
              <div className="text-center py-16">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved items</h3>
                <p className="text-muted-foreground">Items you save will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Detail Dialog */}
        <Dialog open={!!detailDialog} onOpenChange={() => setDetailDialog(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {detailDialog && (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {detailDialog.images?.[0] ? (
                      <img src={detailDialog.images[0]} alt="" className="w-full aspect-square object-cover rounded-lg" />
                    ) : (
                      <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    {detailDialog.images && detailDialog.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {detailDialog.images.slice(1).map((img, i) => (
                          <img key={i} src={img} alt="" className="w-full aspect-square object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Badge variant="outline" className="mb-2">{detailDialog.category || 'Other'}</Badge>
                      <h2 className="text-2xl font-bold">{detailDialog.title}</h2>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {detailDialog.currency} {detailDialog.price.toLocaleString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {detailDialog.location && (
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{detailDialog.location}</span>
                      )}
                      {detailDialog.condition && (
                        <Badge variant="secondary">{CONDITIONS.find(c => c.value === detailDialog.condition)?.label}</Badge>
                      )}
                    </div>
                    
                    {detailDialog.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{detailDialog.description}</p>
                      </div>
                    )}
                    
                    {detailDialog.seller && (
                      <Card className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={detailDialog.seller.avatar_url} />
                            <AvatarFallback>{detailDialog.seller.display_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold flex items-center gap-1">
                              {detailDialog.seller.display_name}
                              <Shield className="w-4 h-4 text-green-500" />
                            </p>
                            <p className="text-sm text-muted-foreground">@{detailDialog.seller.username}</p>
                          </div>
                        </div>
                      </Card>
                    )}
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="lg">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Contact Seller
                      </Button>
                      <Button variant="outline" size="lg">
                        <Heart className="w-5 h-5" />
                      </Button>
                      <Button variant="outline" size="lg">
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Marketplace;