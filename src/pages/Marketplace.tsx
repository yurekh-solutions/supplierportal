import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, MapPin, Package, ChevronRight, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Card } from '@/pages/components/ui/card';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { getFixedImageUrl } from '@/lib/imageUtils';

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
              <div onClick={() => navigate('/')} className="cursor-pointer flex items-center gap-2">
                <Package className="w-8 h-8 text-primary" />
                <h1 className="text-2xl font-bold text-gradient">RitzYard Marketplace</h1>
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
              const imageUrl = getFixedImageUrl(product.image);
              const displayImage = imageUrl || 'https://placehold.co/400x300/e5e7eb/9ca3af?text=No+Image';
              const supplierSuggestions = getSupplierSuggestions(product.category);
              return (
                <div
                  key={product._id}
                  className="glass-card border-2 border-white/30 rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-500 backdrop-blur-2xl group hover:-translate-y-2"
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={displayImage}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

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

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg transition-all rounded-xl">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
