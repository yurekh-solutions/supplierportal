import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Package, TrendingUp, LogOut, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Textarea } from '@/pages/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/pages/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/pages/components/ui/tabs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    unit: string;
  };
  stock: {
    available: boolean;
    quantity?: number;
    minimumOrder?: number;
  };
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  createdAt: string;
}

interface RFQ {
  _id: string;
  customerName: string;
  email: string;
  phone: string;
  productName: string;
  quantity: number;
  unit: string;
  status: string;
  createdAt: string;
}

const SupplierProductDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showRFQDialog, setShowRFQDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    applications: [''],
    features: [''],
    materialStandard: '',
    packaging: '',
    testingCertificate: '',
    brand: [''],
    grades: [''],
    delivery: '',
    quality: '',
    availability: '',
    priceAmount: '',
    priceUnit: '',
    stockQuantity: '',
    minimumOrder: '',
    available: true,
  });

  const token = localStorage.getItem('supplierToken');
  const user = JSON.parse(localStorage.getItem('supplierUser') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchProducts();
    fetchRFQs();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRFQs = async () => {
    try {
      const response = await fetch(`${API_URL}/rfqs/supplier/my-rfqs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setRFQs(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch RFQs');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productForm.name,
          category: productForm.category,
          description: productForm.description,
          image: productForm.image,
          applications: productForm.applications.filter(a => a.trim()),
          features: productForm.features.filter(f => f.trim()),
          specifications: {
            materialStandard: productForm.materialStandard,
            packaging: productForm.packaging,
            testingCertificate: productForm.testingCertificate,
            brand: productForm.brand.filter(b => b.trim()),
            grades: productForm.grades.filter(g => g.trim()),
            delivery: productForm.delivery,
            quality: productForm.quality,
            availability: productForm.availability,
          },
          price: {
            amount: parseFloat(productForm.priceAmount),
            currency: 'INR',
            unit: productForm.priceUnit,
          },
          stock: {
            available: productForm.available,
            quantity: productForm.stockQuantity ? parseInt(productForm.stockQuantity) : undefined,
            minimumOrder: productForm.minimumOrder ? parseInt(productForm.minimumOrder) : undefined,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: data.message });
        setShowProductDialog(false);
        resetProductForm();
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Product deleted successfully' });
        fetchProducts();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const handleRespondRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;

    try {
      const response = await fetch(`${API_URL}/rfqs/supplier/${selectedRFQ._id}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quotedPrice: parseFloat(quotedPrice),
          notes: quoteNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Quote submitted successfully' });
        setShowRFQDialog(false);
        setQuotedPrice('');
        setQuoteNotes('');
        fetchRFQs();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to submit quote', variant: 'destructive' });
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      description: '',
      image: '',
      applications: [''],
      features: [''],
      materialStandard: '',
      packaging: '',
      testingCertificate: '',
      brand: [''],
      grades: [''],
      delivery: '',
      quality: '',
      availability: '',
      priceAmount: '',
      priceUnit: '',
      stockQuantity: '',
      minimumOrder: '',
      available: true,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-glow/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Header */}
      <div className="glass-card border-b-2 border-white/20 backdrop-blur-2xl sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Supplier Dashboard</h1>
                <p className="text-muted-foreground text-sm">{user.companyName}</p>
              </div>
            </div>
            <Button
              className="bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:scale-105 transition-all"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="glass-card border-2 border-primary/30 p-6 rounded-2xl backdrop-blur-2xl hover:shadow-2xl transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                <p className="text-3xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card border-2 border-green-300/50 p-6 rounded-2xl backdrop-blur-2xl hover:shadow-2xl transition-all duration-300 group bg-green-50/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Active Products</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter((p) => p.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card border-2 border-yellow-300/50 p-6 rounded-2xl backdrop-blur-2xl hover:shadow-2xl transition-all duration-300 group bg-yellow-50/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">Pending RFQs</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {rfqs.filter((r) => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-card border-2 border-white/30 backdrop-blur-2xl p-2 h-auto">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg h-12 rounded-lg transition-all"
            >
              <Package className="w-4 h-4 mr-2" />
              My Products
            </TabsTrigger>
            <TabsTrigger 
              value="rfqs" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white data-[state=active]:shadow-lg h-12 rounded-lg transition-all"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              RFQ Requests
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Product Management</h2>
                    <p className="text-muted-foreground text-sm">Manage your product listings</p>
                  </div>
                  <Button
                    onClick={() => setShowProductDialog(true)}
                    className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-foreground font-semibold mb-2">No products yet</p>
                    <p className="text-muted-foreground text-sm">Add your first product to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className="glass-card border-2 border-white/30 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 backdrop-blur-xl group hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">{product.category}</p>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
                          <div>
                            <p className="text-xl font-bold text-gradient">
                              ₹{product.price.amount}/{product.price.unit}
                            </p>
                            {product.stock.quantity && (
                              <p className="text-xs text-muted-foreground mt-1">Stock: {product.stock.quantity}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-2 border-red-500/50 text-red-600 hover:bg-red-50 hover:border-red-500 transition-all"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* RFQs Tab */}
          <TabsContent value="rfqs">
            <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-6">
                <h2 className="text-2xl font-bold text-foreground mb-1">RFQ Requests</h2>
                <p className="text-muted-foreground text-sm">Respond to customer inquiries</p>
              </div>
              <div className="p-6">
                {rfqs.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-10 h-10 text-yellow-600" />
                    </div>
                    <p className="text-foreground font-semibold mb-2">No RFQ requests yet</p>
                    <p className="text-muted-foreground text-sm">Customer inquiries will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rfqs.map((rfq) => (
                      <div
                        key={rfq._id}
                        className="glass-card border-2 border-white/30 rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 backdrop-blur-xl"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-foreground text-lg">{rfq.productName}</h3>
                            <p className="text-sm text-muted-foreground">{rfq.customerName}</p>
                          </div>
                          <Badge className={rfq.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-green-100 text-green-800 border border-green-200'}>
                            {rfq.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                          <div className="glass-card border border-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-muted-foreground text-xs mb-1">Quantity</p>
                            <p className="text-foreground font-semibold">{rfq.quantity} {rfq.unit}</p>
                          </div>
                          <div className="glass-card border border-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-muted-foreground text-xs mb-1">Date</p>
                            <p className="text-foreground font-semibold">{new Date(rfq.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="glass-card border border-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-muted-foreground text-xs mb-1">Email</p>
                            <p className="text-foreground font-semibold text-xs truncate">{rfq.email}</p>
                          </div>
                          <div className="glass-card border border-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <p className="text-muted-foreground text-xs mb-1">Phone</p>
                            <p className="text-foreground font-semibold">{rfq.phone}</p>
                          </div>
                        </div>
                        {rfq.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl transition-all"
                              onClick={() => {
                                setSelectedRFQ(rfq);
                                setShowRFQDialog(true);
                              }}
                            >
                              Submit Quote
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-2 border-green-500/50 text-green-600 hover:bg-green-50 hover:border-green-500 transition-all"
                              onClick={() => {
                                window.open(`https://wa.me/${rfq.phone.replace(/[^0-9]/g, '')}?text=Hello ${rfq.customerName}, I received your RFQ for ${rfq.productName}. I would like to discuss further.`, '_blank');
                              }}
                            >
                              WhatsApp
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-2 border-white/30 backdrop-blur-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gradient">Add New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground">Product will be pending until admin approves it. Fill in all required fields marked with *</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3">Basic Information</h3>
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., MS Round Bars IS 2062"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={productForm.category} onValueChange={(value) => setProductForm({ ...productForm, category: value })} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild-steel">Mild Steel</SelectItem>
                      <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                      <SelectItem value="construction">Construction Materials</SelectItem>
                      <SelectItem value="electrical">Electrical Materials</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="image">Product Image URL *</Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/product-image.jpg"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description including key features and specifications"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Applications & Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3">Applications & Features</h3>
              <div>
                <Label>Applications (one per line)</Label>
                <Textarea
                  placeholder="e.g.,\nHigh-Rise Buildings\nBridge Construction\nIndustrial Structures"
                  value={productForm.applications.join('\n')}
                  onChange={(e) => setProductForm({ ...productForm, applications: e.target.value.split('\n').filter(a => a.trim()) })}
                  rows={4}
                />
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  placeholder="e.g.,\nHigh Tensile Strength\nCorrosion Resistant\nEasy Installation"
                  value={productForm.features.join('\n')}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  rows={4}
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="materialStandard">Material Standard</Label>
                  <Input
                    id="materialStandard"
                    placeholder="e.g., IS 2062 / ASTM A36"
                    value={productForm.materialStandard}
                    onChange={(e) => setProductForm({ ...productForm, materialStandard: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="packaging">Packaging</Label>
                  <Input
                    id="packaging"
                    placeholder="e.g., Bundle / Crate"
                    value={productForm.packaging}
                    onChange={(e) => setProductForm({ ...productForm, packaging: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="testingCertificate">Testing Certificate</Label>
                  <Input
                    id="testingCertificate"
                    placeholder="e.g., Mill Test Available"
                    value={productForm.testingCertificate}
                    onChange={(e) => setProductForm({ ...productForm, testingCertificate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="delivery">Delivery</Label>
                  <Input
                    id="delivery"
                    placeholder="e.g., Pan India"
                    value={productForm.delivery}
                    onChange={(e) => setProductForm({ ...productForm, delivery: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quality">Quality Certification</Label>
                  <Input
                    id="quality"
                    placeholder="e.g., ISO Certified"
                    value={productForm.quality}
                    onChange={(e) => setProductForm({ ...productForm, quality: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    placeholder="e.g., In Stock"
                    value={productForm.availability}
                    onChange={(e) => setProductForm({ ...productForm, availability: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Brand (comma separated)</Label>
                <Input
                  placeholder="e.g., JSW Steel, Tata Steel, SAIL"
                  value={productForm.brand.join(', ')}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value.split(',').map(b => b.trim()).filter(b => b) })}
                />
              </div>
              <div>
                <Label>Grades (comma separated)</Label>
                <Input
                  placeholder="e.g., Grade A, Grade B, E250A"
                  value={productForm.grades.join(', ')}
                  onChange={(e) => setProductForm({ ...productForm, grades: e.target.value.split(',').map(g => g.trim()).filter(g => g) })}
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3">Pricing & Stock</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceAmount">Price (₹) *</Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    step="0.01"
                    placeholder="Enter price"
                    value={productForm.priceAmount}
                    onChange={(e) => setProductForm({ ...productForm, priceAmount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priceUnit">Unit *</Label>
                  <Input
                    id="priceUnit"
                    placeholder="e.g., Ton, Kg, Piece, MT"
                    value={productForm.priceUnit}
                    onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="Available quantity"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrder">Minimum Order Quantity</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    placeholder="Minimum order"
                    value={productForm.minimumOrder}
                    onChange={(e) => setProductForm({ ...productForm, minimumOrder: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="border-2 border-border/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-8 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* RFQ Response Dialog */}
      <Dialog open={showRFQDialog} onOpenChange={setShowRFQDialog}>
        <DialogContent className="glass-card border-2 border-white/30 backdrop-blur-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gradient">Submit Quote</DialogTitle>
                <DialogDescription className="text-muted-foreground">Provide your pricing for this RFQ</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleRespondRFQ} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="quotedPrice" className="text-foreground font-semibold">Quoted Price (₹) *</Label>
              <Input
                id="quotedPrice"
                type="number"
                step="0.01"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                className="h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                placeholder="Enter your quoted price"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quoteNotes" className="text-foreground font-semibold">Notes (Optional)</Label>
              <Textarea
                id="quoteNotes"
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                rows={4}
                className="border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg resize-none"
                placeholder="Any additional information, delivery terms, etc..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setShowRFQDialog(false)} className="border-2 border-border/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-xl hover:scale-105 text-white font-semibold px-8 transition-all duration-300">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Quote
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierProductDashboard;
