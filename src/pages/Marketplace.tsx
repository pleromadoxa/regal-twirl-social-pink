import { useState } from 'react';
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
import { useMarketplace, MarketplaceListing } from '@/hooks/useMarketplace';
import { useAuth } from '@/contexts/AuthContext';
import SidebarNav from '@/components/SidebarNav';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  MapPin, 
  DollarSign,
  Tag,
  Package,
  Eye,
  MessageCircle,
  Trash2,
  Edit2
} from 'lucide-react';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Home & Garden', 'Sports', 
  'Books', 'Vehicles', 'Services', 'Other'
];

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' }
];

const Marketplace = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { 
    listings, 
    myListings, 
    loading, 
    fetchListings, 
    createListing, 
    deleteListing, 
    markAsSold 
  } = useMarketplace();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: ''
  });

  const handleSearch = () => {
    fetchListings(selectedCategory, searchTerm);
  };

  const handleCreateListing = async () => {
    if (!formData.title || !formData.price) return;

    await createListing({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category || undefined,
      condition: formData.condition as any || undefined,
      location: formData.location || undefined
    });

    setFormData({ title: '', description: '', price: '', category: '', condition: '', location: '' });
    setDialogOpen(false);
  };

  const ListingCard = ({ listing }: { listing: MarketplaceListing }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {listing.images?.[0] && (
          <img 
            src={listing.images[0]} 
            alt={listing.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        {!listing.images?.[0] && (
          <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg mb-4 flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold line-clamp-2">{listing.title}</h3>
            <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
              {listing.status}
            </Badge>
          </div>
          
          <p className="text-2xl font-bold text-purple-600">
            ${listing.price.toFixed(2)}
          </p>
          
          {listing.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {listing.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.location}
              </span>
            )}
            {listing.condition && (
              <Badge variant="outline" className="text-xs">
                {listing.condition.replace('_', ' ')}
              </Badge>
            )}
          </div>
          
          {listing.seller && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="w-6 h-6">
                <AvatarImage src={listing.seller.avatar_url} />
                <AvatarFallback>{listing.seller.display_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {listing.seller.display_name}
              </span>
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-1" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <SidebarNav />
      
      <main className={`flex-1 ${isMobile ? 'px-4 pb-20' : 'ml-80'} p-4 lg:p-6`}>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <ShoppingBag className="w-8 h-8 text-purple-600" />
                Marketplace
              </h1>
              <p className="text-muted-foreground">Buy and sell with your community</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Listing
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Listing</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="What are you selling?"
                    />
                  </div>
                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your item..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Category</Label>
                      <Select onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Condition</Label>
                      <Select onValueChange={(v) => setFormData(prev => ({ ...prev, condition: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
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
                      placeholder="City, State"
                    />
                  </div>
                  <Button onClick={handleCreateListing} className="w-full">
                    Create Listing
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search marketplace..."
                    className="pl-10"
                  />
                </div>
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="browse">
            <TabsList>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="my-listings">My Listings</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-4">
              {loading ? (
                <div className="text-center py-12">Loading...</div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No listings found. Be the first to sell something!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map(listing => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-listings" className="mt-4">
              {myListings.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  You haven't created any listings yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map(listing => (
                    <Card key={listing.id}>
                      <CardContent className="p-4">
                        <ListingCard listing={listing} />
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markAsSold(listing.id)}
                            disabled={listing.status === 'sold'}
                          >
                            Mark as Sold
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteListing(listing.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Marketplace;
