import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Package, TrendingUp, LogOut, MessageSquare, CheckCircle, Settings, CreditCard, X, Search, BarChart3, PieChart, DollarSign, AlertCircle, Clock, ShoppingBag, Sparkles, TrendingDown, Activity, Zap, Target } from 'lucide-react';
import { products as predefinedProducts } from '../data';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Textarea } from '@/pages/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/pages/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/components/ui/select';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id?: string;
  name: string;
  slug: string;
  isActive: boolean;
}

// Category options (will be loaded from API)
const INITIAL_CATEGORIES = [
  { value: 'mild-steel', label: 'Mild Steel', icon: '🔩' },
  { value: 'stainless-steel', label: 'Stainless Steel', icon: '⚙️' },
  { value: 'construction', label: 'Construction Materials', icon: '🏗️' },
  { value: 'electrical', label: 'Electrical Materials', icon: '⚡' },
];

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

const SupplierProductDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    customCategory: '',
    customSubcategory: '',
    description: '',
    imageFile: null as File | null,
    imagePreview: '',
    features: [] as string[],
    applications: [] as string[],
    specifications: {} as any,
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<typeof predefinedProducts>([]);
  const productInputRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('supplierToken');
  const user = JSON.parse(localStorage.getItem('supplierUser') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productForm.category) {
      const selectedCategory = categories.find(cat => cat.slug === productForm.category);
      if (selectedCategory) {
        setAvailableSubcategories(selectedCategory.subcategories || []);
      } else {
        setAvailableSubcategories([]);
      }
    }
  }, [productForm.category, categories]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/public`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleProductNameChange = (value: string) => {
    setProductForm({ ...productForm, name: value });
    
    if (value.trim().length > 0) {
      const filtered = predefinedProducts.filter(product => 
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductSuggestions(true);
    } else {
      setShowProductSuggestions(false);
    }
  };

  const handleSelectPredefinedProduct = async (product: typeof predefinedProducts[0]) => {
    // Map category slugs
    const categoryMap: Record<string, string> = {
      'mild-steel': 'mild-steel',
      'stainless-steel': 'stainless-steel',
      'construction': 'construction',
      'electrical': 'electrical'
    };

    const mappedCategory = categoryMap[product.category] || product.category;

    // Convert image import to File object for upload
    let imageFile: File | null = null;
    let imagePreview = '';

    // Fetch the image and convert to File
    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const fileName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      imageFile = new File([blob], fileName, { type: blob.type });
      imagePreview = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to load product image:', error);
      // Fallback: use image URL directly
      imagePreview = product.image;
    }

    setProductForm({
      ...productForm,
      name: product.name,
      category: mappedCategory,
      subcategory: '',
      customCategory: '',
      customSubcategory: '',
      description: product.description,
      features: product.features || [],
      applications: product.applications || [],
      specifications: product.specifications || {},
      imageFile,
      imagePreview
    });

    setShowProductSuggestions(false);
    
    // Show success toast
    toast({
      title: '✨ Product Details Auto-Filled',
      description: `Loaded complete information for "${product.name}"`,
      variant: 'default',
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // ... existing code ...

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('name', productForm.name);
      formDataToSend.append('category', productForm.category === 'custom' ? productForm.customCategory : productForm.category);
      formDataToSend.append('subcategory', productForm.subcategory === 'custom' ? productForm.customSubcategory : productForm.subcategory);
      formDataToSend.append('description', productForm.description);
      
      // Image file
      if (productForm.imageFile) {
        formDataToSend.append('productImage', productForm.imageFile);
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setShowProductDialog(false);
        setShowSuccessPopup(true);
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

  // ... existing code ...

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      subcategory: '',
      customCategory: '',
      customSubcategory: '',
      description: '',
      imageFile: null,
      imagePreview: '',
      features: [],
      applications: [],
      specifications: {},
    });
    setShowCustomCategory(false);
    setShowCustomSubcategory(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50',
      active: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/50',
      inactive: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border border-gray-200/50',
      rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200/50',
    };
    return <Badge className={`${variants[status as keyof typeof variants]} capitalize font-medium px-3 py-1`}>{status}</Badge>;
  };

  // Analytics calculations with AI insights
  const analytics = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    inactive: products.filter(p => p.status === 'inactive').length,
  };

  // AI-powered insights
  const aiInsights = {
    approvalRate: analytics.total > 0 ? Math.round((analytics.active / analytics.total) * 100) : 0,
    pendingTrend: analytics.pending > analytics.total * 0.5 ? 'high' : analytics.pending > analytics.total * 0.2 ? 'medium' : 'low',
    topCategory: Object.entries(products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
    recommendations: [
      analytics.pending > 5 ? '⚡ High pending items - Consider reviewing product details' : null,
      analytics.active === 0 && analytics.total > 0 ? '🎯 No active products - Follow up with admin team' : null,
      analytics.total < 5 ? '📦 Add more products to increase visibility' : null,
      analytics.rejected > 0 ? '🔍 Review rejected items and resubmit with corrections' : null,
    ].filter(Boolean),
  };

  const categoryBreakdown = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f3f0ec] relative overflow-hidden">
      {/* Animated Background - Match Login Page */}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Supplier Portal</h1>
                {/* <p className="text-muted-foreground text-sm">{user.companyName || 'Business Ventures'}</p> */}
              </div>
            </div>
            <div className="flex gap-3 items-center flex-col sm:flex-row">
              <LanguageSwitcher />
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* AI Insights Banner */}
        {aiInsights.recommendations.length > 0 && (
          <div className="glass-card border-2 border-primary/30 p-4 rounded-2xl backdrop-blur-2xl mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-secondary/10"></div>
            <div className="relative z-10 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 animate-pulse">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  AI-Powered Insights
                  <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-xs">SMART</Badge>
                </h3>
                <div className="space-y-1.5">
                  {aiInsights.recommendations.slice(0, 2).map((rec, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground leading-relaxed">{rec}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact Analytics - Single Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total Products */}
          <div className="glass-card border-2 border-white/30 p-4 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Total</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{analytics.total}</p>
            </div>
          </div>

          {/* Active */}
          <div className="glass-card border-2 border-white/30 p-4 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Active</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{analytics.active}</p>
            </div>
          </div>

          {/* Pending */}
          <div className="glass-card border-2 border-white/30 p-4 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-orange-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">Pending</p>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{analytics.pending}</p>
            </div>
          </div>

          {/* Rejected */}
          <div className="glass-card border-2 border-white/30 p-4 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">Rejected</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{analytics.rejected}</p>
            </div>
          </div>

          {/* Approval Rate - AI Metric */}
          <div className="glass-card border-2 border-primary/30 p-4 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs text-primary font-medium">Success</p>
              </div>
              <p className="text-2xl font-bold text-primary">{aiInsights.approvalRate}%</p>
            </div>
          </div>
        </div>

        {/* Animated Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Progress Bars */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Status Distribution</h3>
              </div>
              
              <div className="space-y-4">
                {/* Active Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-muted-foreground font-medium">Active</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.active} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.active / analytics.total) * 100 : 0}%`}}
                    ></div>
                  </div>
                </div>

                {/* Pending Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-muted-foreground font-medium">Pending Review</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.pending} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.pending / analytics.total) * 100 : 0}%`, animationDelay: '0.2s'}}
                    ></div>
                  </div>
                </div>

                {/* Rejected Progress */}
                {analytics.rejected > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        <span className="text-muted-foreground font-medium">Rejected</span>
                      </div>
                      <span className="font-bold text-foreground">{analytics.rejected} / {analytics.total}</span>
                    </div>
                    <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                        style={{width: `${analytics.total > 0 ? (analytics.rejected / analytics.total) * 100 : 0}%`, animationDelay: '0.4s'}}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Top Category */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Quick Insights</h3>
              </div>

              <div className="space-y-4">
                {/* Top Category */}
                <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">Top Category</p>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-lg font-bold text-foreground capitalize">{aiInsights.topCategory.replace('-', ' ')}</p>
                </div>

                {/* Pending Alert */}
                {analytics.pending > 0 && (
                  <div className="glass-card border border-yellow-200/50 bg-yellow-50/30 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Pending Approval</p>
                        <p className="text-xs text-yellow-700">{analytics.pending} product{analytics.pending > 1 ? 's' : ''} awaiting admin review</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Button */}
                <Button
                  onClick={() => navigate('/products/add')}
                  className="w-full bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold transition-all duration-300 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Compact Grid */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="glass-card border-2 border-white/30 p-5 rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Category Distribution</h3>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">{Object.keys(categoryBreakdown).length} Categories</Badge>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {Object.entries(categoryBreakdown).map(([category, count]) => (
                  <div key={category} className="glass-card border border-white/20 p-3 rounded-xl hover:border-primary/30 transition-all duration-300 group text-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xl font-bold text-foreground mb-0.5">{count}</p>
                    <p className="text-xs text-muted-foreground font-medium capitalize truncate" title={category.replace('-', ' ')}>{category.replace('-', ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="space-y-6">
            <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
              <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-6 rounded-t-3xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                <h2 className="text-gradient text-3xl font-bold mb-2 bg-clip-text text-transparent">
                  Product Management
             
              </h2>
                    {/* <h2 className="text-3xl font-bold text-foreground mb-2">Product Management</h2> */}
                    <p className="text-muted-foreground text-base">Manage your product listings and track performance</p>
                  </div>
                  <Button
                    onClick={() => navigate('/products/add')}
                    className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-6 py-5 transition-all duration-300 rounded-xl text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                  </Button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-white/30 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-xl"
                  />
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
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
                      <Package className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No products yet</h3>
                    <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">Add your first product to showcase your offerings to potential customers!</p>
                    <Button
                      onClick={() => navigate('/products/add')}
                      className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-8 py-6 rounded-xl transition-all duration-300 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product._id}
                        className="glass-card border-2 border-white/30 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 backdrop-blur-2xl group relative overflow-hidden"
                      >
                        {/* Subtle background gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium capitalize">{product.category.replace('-', ' ')}</p>
                              </div>
                            </div>
                            {getStatusBadge(product.status)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4 pt-4 border-t border-border/30">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-rgba(193, 72, 43, 0.2) to-rgba(193, 72, 43, 0.15) text-[#c1482b] border-2 border-[#c1482b]/30 hover:border-[#c1482b]/50 hover:shadow-lg transition-all duration-300 rounded-xl font-medium"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-2 border-white/30 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-4xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl animate-glow-pulse transform transition-transform hover:scale-105">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">Submit your product for admin review and approval</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Basic Information
              </h3>
              <div className="relative" ref={productInputRef}>
                <Label htmlFor="name">Product Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., MS Round Bars IS 2062"
                    value={productForm.name}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    required
                    className="h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Start typing to see product suggestions with pre-filled data
                </p>
                
                {/* Autocomplete Suggestions Dropdown */}
                {showProductSuggestions && productSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto bg-white dark:bg-gray-900 border-2 border-primary/30 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-border/50 bg-primary/5">
                      <p className="text-xs font-semibold text-primary flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {productSuggestions.length} Products Found - Click to auto-fill
                      </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {productSuggestions.slice(0, 10).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectPredefinedProduct(product)}
                          className="w-full p-3 hover:bg-primary/10 border-b border-border/30 last:border-0 text-left transition-all duration-200 flex items-start gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0 group-hover:border-primary/50 transition-all">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Fallback to a placeholder if image fails to load
                                target.src = 'https://placehold.co/100x100/6366f1/ffffff?text=Product';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                              {product.category.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    {productSuggestions.length > 10 && (
                      <div className="p-2 border-t border-border/50 bg-muted/50">
                        <p className="text-xs text-center text-muted-foreground">
                          Showing 10 of {productSuggestions.length} results. Type more to refine search.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Category Selection as Chips */}
              <div>
                <Label className="font-semibold text-foreground mb-2 block">Category *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`px-4 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${productForm.category === cat.slug
                        ? 'border-primary bg-primary/10 text-primary font-semibold' 
                        : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
                      onClick={() => setProductForm({ ...productForm, category: cat.slug, subcategory: '', customSubcategory: '' })}
                    >
                      <span>{cat.icon || '📦'}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCustomCategory(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>
                                
              {/* Custom Category Input */}
              {showCustomCategory && (
                <div className="mt-2 p-4 border-2 border-primary/30 rounded-xl bg-primary/5">
                  <Label className="font-semibold text-foreground mb-2 block">Request New Category</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new category name"
                      value={productForm.customCategory}
                      onChange={(e) => setProductForm({ ...productForm, customCategory: e.target.value })}
                      className="flex-1 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        if (productForm.customCategory.trim()) {
                          setProductForm({ ...productForm, category: 'custom' });
                        }
                      }}
                    >
                      Request
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setProductForm({ ...productForm, customCategory: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Your category will be reviewed by admin before it becomes available.</p>
                </div>
              )}
                                
              {/* Subcategory Selection */}
              {productForm.category && productForm.category !== 'custom' && !showCustomCategory && (
                <div>
                  <Label className="font-semibold text-foreground mb-2 block">Subcategory (Optional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSubcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        type="button"
                        className={`px-4 py-2 rounded-full border-2 transition-all duration-300 ${productForm.subcategory === sub.slug
                          ? 'border-primary bg-primary/10 text-primary font-semibold' 
                          : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
                        onClick={() => setProductForm({ ...productForm, subcategory: sub.slug, customSubcategory: '' })}
                      >
                        <span>{sub.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCustomSubcategory(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Subcategory</span>
                    </button>
                  </div>
                </div>
              )}
                                
              {/* Custom Subcategory Input */}
              {showCustomSubcategory && (
                <div className="mt-2 p-4 border-2 border-primary/30 rounded-xl bg-primary/5">
                  <Label className="font-semibold text-foreground mb-2 block">Request New Subcategory</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new subcategory name"
                      value={productForm.customSubcategory}
                      onChange={(e) => setProductForm({ ...productForm, customSubcategory: e.target.value })}
                      className="flex-1 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        if (productForm.customSubcategory.trim()) {
                          setProductForm({ ...productForm, subcategory: 'custom' });
                        }
                      }}
                    >
                      Request
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomSubcategory(false);
                        setProductForm({ ...productForm, customSubcategory: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Your subcategory will be reviewed by admin before it becomes available.</p>
                </div>
              )}
                                
              {/* Image Upload */}
              <div>
                <Label className="font-semibold text-foreground mb-2 block">Product Image (Optional)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {productForm.imagePreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/30">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageFile: null, imagePreview: '' })}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProductForm({ 
                            ...productForm, 
                            imageFile: e.target.files[0],
                            imagePreview: URL.createObjectURL(e.target.files[0])
                          });
                        }
                      }}
                      className="h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Upload product image or it will use a default placeholder
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="font-semibold text-foreground mb-2 block">AI Recommended Summary</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description including key features and specifications"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                />
              </div>

              {/* Auto-filled Features */}
              {productForm.features.length > 0 && (
                <div className="mt-6 p-4 border-2 border-green-500/30 rounded-xl bg-green-50/50 dark:bg-green-900/10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Label className="font-bold text-green-700 dark:text-green-400 text-base">Features (Auto-filled)</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productForm.features.map((feature, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-filled Applications */}
              {productForm.applications.length > 0 && (
                <div className="mt-4 p-4 border-2 border-blue-500/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <Label className="font-bold text-blue-700 dark:text-blue-400 text-base">Applications (Auto-filled)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {productForm.applications.map((app, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-blue-800 dark:text-blue-300"
                      >
                        • {app}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-filled Specifications */}
              {productForm.specifications && Object.keys(productForm.specifications).length > 0 && (
                <div className="mt-4 p-4 border-2 border-purple-500/30 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <Label className="font-bold text-purple-700 dark:text-purple-400 text-base">Product Specifications (Auto-filled)</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(productForm.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mt-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-sm text-purple-900 dark:text-purple-200 flex-1">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="border-2 border-border/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-8 transition-all duration-300 rounded-xl">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Popup - Glass Style */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card border-2 border-white/20 rounded-3xl p-8 max-w-md w-full bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-3xl animate-scale-in relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl animate-glow-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">Product Submitted!</h3>
              <p className="text-muted-foreground mb-6">Your product listing is under admin review. You will be notified once approved.</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-6 rounded-xl hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setShowSuccessPopup(false);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierProductDashboard;
