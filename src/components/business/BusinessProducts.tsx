import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/useCart';
import { Plus, Package, Edit2, Trash2, Image, Percent, ShoppingCart } from 'lucide-react';

interface BusinessProductsProps {
  businessPage: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  stock_quantity: number;
  images: string[];
  category: string;
  is_active: boolean;
  discount_percentage?: number;
  discount_start_date?: string;
  discount_end_date?: string;
  created_at: string;
}

const BusinessProducts = ({ businessPage }: BusinessProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { addToCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock_quantity: '0',
    category: '',
    is_active: true,
    discount_percentage: '0',
    discount_start_date: '',
    discount_end_date: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchProducts();
  }, [businessPage.id]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price.toString(),
        sku: editingProduct.sku || '',
        stock_quantity: editingProduct.stock_quantity.toString(),
        category: editingProduct.category || '',
        is_active: editingProduct.is_active,
        discount_percentage: editingProduct.discount_percentage?.toString() || '0',
        discount_start_date: editingProduct.discount_start_date || '',
        discount_end_date: editingProduct.discount_end_date || ''
      });
      setImagePreview(editingProduct.images?.[0] || '');
      setImageFile(null);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        sku: '',
        stock_quantity: '0',
        category: '',
        is_active: true,
        discount_percentage: '0',
        discount_start_date: '',
        discount_end_date: ''
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [editingProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_page_id', businessPage.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map data to include default values for discount fields
      const mappedData = (data || []).map((product: any) => ({
        ...product,
        discount_percentage: product.discount_percentage ?? 0,
        discount_start_date: product.discount_start_date ?? '',
        discount_end_date: product.discount_end_date ?? ''
      }));
      setProducts(mappedData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicURL } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicURL.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    try {
      let imageUrls: string[] = editingProduct?.images || [];
      
      // Upload new image if provided
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile);
        imageUrls = [imageUrl];
      }

      const productData = {
        business_page_id: businessPage.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        currency: businessPage.default_currency,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category: formData.category,
        is_active: formData.is_active,
        images: imageUrls,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        discount_start_date: formData.discount_start_date || null,
        discount_end_date: formData.discount_end_date || null
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('business_products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast({ title: "Success", description: "Product updated successfully" });
      } else {
        const { error } = await supabase
          .from('business_products')
          .insert([productData]);

        if (error) throw error;
        toast({ title: "Success", description: "Product created successfully" });
      }

      setDialogOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted"
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('business_products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);

      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error updating product status:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive"
      });
    }
  };

  const getCurrencySymbol = () => {
    const symbols: { [key: string]: string } = {
      'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
      'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BTC': '₿', 'ETH': 'Ξ'
    };
    return symbols[businessPage.default_currency] || businessPage.default_currency;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getDiscountedPrice = (product: Product) => {
    if (!product.discount_percentage || product.discount_percentage <= 0) return product.price;
    
    const currentDate = new Date().toISOString().split('T')[0];
    const isDiscountActive = (!product.discount_start_date || currentDate >= product.discount_start_date) &&
                           (!product.discount_end_date || currentDate <= product.discount_end_date);
    
    if (!isDiscountActive) return product.price;
    
    return product.price * (1 - product.discount_percentage / 100);
  };

  const isDiscountActive = (product: Product) => {
    if (!product.discount_percentage || product.discount_percentage <= 0) return false;
    
    const currentDate = new Date().toISOString().split('T')[0];
    return (!product.discount_start_date || currentDate >= product.discount_start_date) &&
           (!product.discount_end_date || currentDate <= product.discount_end_date);
  };

  const openDialog = (product?: Product) => {
    setEditingProduct(product || null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your e-commerce products, pricing, and discounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => openDialog()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price ({businessPage.default_currency}) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image">Product Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mb-2"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Product code"
                  />
                </div>
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Electronics, Clothing, etc."
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Discount Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discount_percentage">Discount (%)</Label>
                    <Input
                      id="discount_percentage"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.discount_percentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_start_date">Start Date</Label>
                    <Input
                      id="discount_start_date"
                      type="date"
                      value={formData.discount_start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount_end_date">End Date</Label>
                    <Input
                      id="discount_end_date"
                      type="date"
                      value={formData.discount_end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_end_date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Product is active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No products added yet. Create your first product above.
          </div>
        ) : (
          products.map((product) => {
            const discountedPrice = getDiscountedPrice(product);
            const hasActiveDiscount = isDiscountActive(product);
            
            return (
              <Card key={product.id} className={`${!product.is_active ? 'opacity-50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDialog(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {hasActiveDiscount ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(discountedPrice)}
                                </span>
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  -{product.discount_percentage}%
                                </Badge>
                              </div>
                              <span className="text-sm text-gray-500 line-through">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                          )}
                        </div>
                        <Switch
                          checked={product.is_active}
                          onCheckedChange={() => toggleProductStatus(product)}
                        />
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Stock: {product.stock_quantity}</span>
                        {product.sku && <span>SKU: {product.sku}</span>}
                      </div>
                      
                      {product.category && (
                        <div className="inline-block bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded text-xs">
                          {product.category}
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => addToCart(product.id)}
                        className="w-full mt-2"
                        disabled={!product.is_active || product.stock_quantity === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BusinessProducts;
