import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, MapPin, Package, ChevronRight, Menu, X, Globe, MessageSquare, CheckCircle, Loader } from 'lucide-react';
import ritzyardLogo from "@/assets/RITZYARD3.svg";
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Card } from '@/pages/components/ui/card';
import { Textarea } from '@/pages/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/pages/components/ui/dialog';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { getFixedImageUrl, handleImageErrorWithFallback, handleImageErrorWithRetry } from '@/lib/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  price?: {
    amount: number;
    currency: string;
    unit: string;
  };
  stock?: {
    available: boolean;
    quantity?: number;
  };
  supplierId: string;
  supplierName?: string;
  image?: string;
  createdAt: string;
}

interface Supplier {
  _id: string;
  companyName: string;
  location?: string;
  rating?: number;
  products?: number;
  verified?: boolean;
}

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);

  // Request Quote modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);
  const [quoteForm, setQuoteForm] = useState({
    customerName: '',
    company: '',
    email: '',
    phone: '',
    quantity: '',
    unit: 'MT',
    deliveryLocation: '',
    message: '',
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState<{ inquiryNumber: string; chatUrl: string } | null>(null);
  const [quoteError, setQuoteError] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/active`);
      const data = await response.json();
      if (data.success) {
        console.log('📦 Marketplace Products Fetched:', {
          total: data.data?.length || 0,
          timestamp: new Date().toISOString(),
        });
        // Log first 3 products for verification
        data.data?.slice(0, 3).forEach((p: Product, idx: number) => {
          console.log(`\n✨ Product ${idx + 1}: ${p.name}`);
          console.log(`   Image field: ${!!p.image}`);
          console.log(`   Image URL: "${p.image}"`);
          if (p.image) {
            const isCloudinary = p.image.includes('cloudinary.com') || p.image.includes('res.cloudinary.com');
            console.log(`   From Cloudinary: ${isCloudinary ? '✅ YES' : '❌ NO'}`);
          }
        });
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_URL}/suppliers/active`);
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/public`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const openQuoteModal = (product: Product) => {
    setQuoteProduct(product);
    setQuoteForm({ customerName: '', company: '', email: '', phone: '', quantity: '', unit: 'MT', deliveryLocation: '', message: '' });
    setQuoteError('');
    setQuoteSuccess(null);
    setQuoteModalOpen(true);
  };

  const submitQuote = async () => {
    if (!quoteProduct) return;
    const { customerName, email, phone, quantity, deliveryLocation } = quoteForm;
    if (!customerName.trim() || !email.trim() || !phone.trim() || !quantity || !deliveryLocation.trim()) {
      setQuoteError('Please fill in Name, Email, Phone, Quantity and Delivery Location.');
      return;
    }
    setQuoteError('');
    setQuoteSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/rfqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: quoteForm.customerName.trim(),
          company: quoteForm.company.trim() || undefined,
          email: quoteForm.email.trim().toLowerCase(),
          phone: quoteForm.phone.trim(),
          location: quoteForm.deliveryLocation.trim(),
          items: [{
            productName: quoteProduct.name,
            category: quoteProduct.category,
            quantity: parseFloat(quoteForm.quantity) || 1,
          }],
        }),
      });
      const data = await res.json();
      if (data.success) {
        const inquiryNum = data.rfqNumber || data.data?.[0]?.inquiryNumber || 'N/A';
        // Generate buyer chat token
        let chatUrl = `/chat/${inquiryNum}?email=${encodeURIComponent(quoteForm.email.trim().toLowerCase())}`;
        try {
          const tokenRes = await fetch(`${API_URL}/chat/${inquiryNum}/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: quoteForm.email.trim().toLowerCase() }),
          });
          const tokenData = await tokenRes.json();
          if (tokenData.success && tokenData.token) {
            chatUrl = `/chat/${inquiryNum}?email=${encodeURIComponent(quoteForm.email.trim().toLowerCase())}&token=${tokenData.token}`;
          }
        } catch {
          // token generation is non-blocking
        }
        setQuoteSuccess({ inquiryNumber: inquiryNum, chatUrl });
      } else {
        setQuoteError(data.message || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setQuoteError('Network error. Please check connection and try again.');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const getSupplierSuggestions = (productCategory: string) => {
    return suppliers
      .filter(s => {
        const supplierProducts = products.filter(p => p.supplierId === s._id);
        return supplierProducts.some(p => p.category === productCategory);
      })
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#f3f0ec]">
      {/* Header */}
      <div className="glass-card border-b-2 border-white/20 backdrop-blur-2xl sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                  <img src={ritzyardLogo} alt="ritzyard logo" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold leading-tight notranslate">
                    <span className="text-primary">r</span>
                    <span className="text-[#452a21]">itz </span>
                    <span className="text-[#452a21]">yard</span>
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Marketplace</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <LanguageSwitcher />
              <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-primary to-secondary text-white font-semibold">
                Login / Register
              </Button>
            </div>
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="mt-4 flex flex-col gap-3 md:hidden">
              <LanguageSwitcher />
              <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-primary to-secondary text-white">
                Login / Register
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search and Filter Section */}
        <div className="glass-card border-2 border-white/30 rounded-3xl p-6 mb-8 backdrop-blur-2xl">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products, suppliers, materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 rounded-xl"
              />
            </div>

            {/* Category Filter */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-primary" />
                <label className="text-sm font-semibold text-foreground">Category</label>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    selectedCategory === 'all'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  All Products
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2 rounded-full border-2 transition-all ${
                      selectedCategory === cat.slug
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Found <span className="font-bold text-foreground">{filteredProducts.length}</span> products
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-20 h-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search or browse all categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => {
              const hasImage = product.image && product.image.trim() !== '';
              const imageUrl = hasImage ? getFixedImageUrl(product.image) : '';
              const supplierSuggestions = getSupplierSuggestions(product.category);
              
              // Log image details when rendering
              if (imageUrl && imageUrl.includes('cloudinary')) {
                console.log(`📸 Rendering Cloudinary image for "${product.name}"`);
              }
              
              return (
                <div
                  key={product._id}
                  className="glass-card border-2 border-white/30 rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500 backdrop-blur-2xl group hover:-translate-y-2"
                >
                  {/* Product Image - Only show if exists */}
                  {imageUrl && imageUrl.length > 0 ? (
                    <div className="relative h-56 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                      <img
                        src={imageUrl}
                        data-src={imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        crossOrigin="anonymous"
                        data-retry="0"
                        onError={(e) => {
                          console.error(`❌ Marketplace image failed: ${imageUrl}`);
                          handleImageErrorWithRetry(e);
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="p-6">
                    {/* Product Title */}
                    <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Category */}
                    <div className="flex items-center gap-2 mb-3">
                      <Package className="w-4 h-4 text-primary" />
                      <p className="text-sm text-muted-foreground capitalize">{product.category.replace('-', ' ')}</p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{product.description}</p>

                    {/* Stock Status */}
                    {product.stock?.available !== false && (
                      <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full mb-4">
                        ✓ In Stock
                      </div>
                    )}

                    {/* Supplier Suggestions */}
                    {supplierSuggestions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Suppliers of this product
                        </p>
                        <div className="space-y-2">
                          {supplierSuggestions.map(supplier => (
                            <div
                              key={supplier._id}
                              className="p-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors cursor-pointer group/supplier"
                              onClick={() => navigate(`/supplier/${supplier._id}`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground group-hover/supplier:text-primary transition-colors truncate">
                                    {supplier.companyName}
                                  </p>
                                  {supplier.location && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground truncate">{supplier.location}</p>
                                    </div>
                                  )}
                                  {supplier.rating && (
                                    <div className="flex items-center gap-1 mt-1">
                                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                      <p className="text-xs text-foreground font-semibold">{supplier.rating.toFixed(1)}</p>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/supplier:text-primary transition-colors flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg transition-all rounded-xl"
                        onClick={() => openQuoteModal(product)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Request Quote
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Request Quote Modal */}
      <Dialog open={quoteModalOpen} onOpenChange={(open) => { if (!open) { setQuoteModalOpen(false); setQuoteSuccess(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Request Quote via RitzYard
            </DialogTitle>
            <DialogDescription>
              {quoteProduct && (
                <span>Requesting quote for <strong>{quoteProduct.name}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>

          {quoteSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">Inquiry Submitted!</p>
                <p className="text-sm text-muted-foreground mt-1">Your inquiry number is:</p>
                <p className="text-2xl font-black text-primary mt-1">{quoteSuccess.inquiryNumber}</p>
              </div>
              <p className="text-xs text-muted-foreground">Suppliers will respond through the RitzYard platform. You can track your inquiry using the chat link below.</p>
              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-primary text-white"
                  onClick={() => { setQuoteModalOpen(false); navigate(quoteSuccess.chatUrl); }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat Thread
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setQuoteModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {quoteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
                  {quoteError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Your Name <span className="text-red-500">*</span></label>
                  <Input placeholder="Full name" value={quoteForm.customerName} onChange={e => setQuoteForm(f => ({ ...f, customerName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Company</label>
                  <Input placeholder="Company name" value={quoteForm.company} onChange={e => setQuoteForm(f => ({ ...f, company: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Email <span className="text-red-500">*</span></label>
                  <Input type="email" placeholder="your@email.com" value={quoteForm.email} onChange={e => setQuoteForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Phone <span className="text-red-500">*</span></label>
                  <Input placeholder="+91 XXXXX XXXXX" value={quoteForm.phone} onChange={e => setQuoteForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Quantity <span className="text-red-500">*</span></label>
                  <Input type="number" min="1" placeholder="e.g. 10" value={quoteForm.quantity} onChange={e => setQuoteForm(f => ({ ...f, quantity: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Unit</label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={quoteForm.unit}
                    onChange={e => setQuoteForm(f => ({ ...f, unit: e.target.value }))}
                  >
                    {['MT', 'KG', 'Ton', 'Pieces', 'Litre', 'Units'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Delivery Location <span className="text-red-500">*</span></label>
                <Input placeholder="City, State" value={quoteForm.deliveryLocation} onChange={e => setQuoteForm(f => ({ ...f, deliveryLocation: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">Additional Message</label>
                <Textarea placeholder="Any specific grade, brand, specifications..." rows={2} value={quoteForm.message} onChange={e => setQuoteForm(f => ({ ...f, message: e.target.value }))} />
              </div>
              <p className="text-[10px] text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
                Your contact details are protected by RitzYard. Suppliers respond through the platform only.
              </p>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setQuoteModalOpen(false)}>Cancel</Button>
                <Button
                  className="flex-1 bg-primary text-white"
                  onClick={submitQuote}
                  disabled={quoteSubmitting}
                >
                  {quoteSubmitting ? (
                    <><Loader className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><MessageSquare className="w-4 h-4 mr-2" /> Submit Inquiry</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
