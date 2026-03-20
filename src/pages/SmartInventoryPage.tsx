import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, LogOut, RefreshCw, Package, AlertTriangle,
  TrendingUp, Search, Loader, Plus, CheckCircle, Eye, Layers
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Badge } from '@/pages/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface InventoryItem {
  _id: string;
  productName?: string;
  name?: string;
  quantity: number;
  reorderPoint?: number;
  unit?: string;
  category?: string;
  lastUpdated?: string;
  updatedAt?: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: string;
  image?: string;
  price?: { amount?: number; currency?: string; unit?: string };
  stock?: { quantity?: number; available?: boolean; minimumOrder?: number };
}

export default function SmartInventoryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'stock'>('products');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [invRes, productsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/inventory`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/products/my-products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/inventory/analytics`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (invRes.status === 401) { navigate('/login'); return; }

      const invData = await invRes.json();
      const productsData = await productsRes.json();
      const analyticsData = await analyticsRes.json();

      if (invData.success) setInventory(invData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load inventory', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const pendingProducts = products.filter(p => p.status === 'pending');
  const lowStockItems = inventory.filter(i => (i.quantity || 0) <= (i.reorderPoint || 10) && i.quantity !== undefined);
  const uniqueCategories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const filteredInventory = inventory.filter(item => {
    const name = item.productName || item.name || '';
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  const getStockLevel = (qty: number, reorder: number) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100', bar: 'bg-red-500' };
    if (qty <= reorder) return { label: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100', bar: 'bg-yellow-500' };
    return { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-100', bar: 'bg-green-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Smart Inventory</h1>
                <p className="text-xs text-muted-foreground">Real-time stock tracking & alerts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAll}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white" onClick={() => navigate('/products/add')}>
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 border-red-200" onClick={() => setShowLogoutModal(true)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Products', value: products.length, color: 'from-amber-500 to-orange-500', icon: Package },
            { label: 'Active (Visible)', value: activeProducts.length, color: 'from-green-500 to-emerald-500', icon: Eye },
            { label: 'Pending Approval', value: pendingProducts.length, color: 'from-yellow-500 to-amber-500', icon: AlertTriangle },
            { label: 'Categories', value: uniqueCategories.length, color: 'from-blue-500 to-indigo-500', icon: Layers },
          ].map((s, i) => (
            <Card key={i} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analytics row */}
        {analytics && (
          <div className="glass-card border border-amber-200/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-5 mb-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Inventory Analytics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-foreground">{analytics.totalItems || inventory.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">₹{(analytics.totalValue || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{analytics.lowStockCount || lowStockItems.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{analytics.outOfStockCount || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="glass-card border border-red-200/50 bg-red-50/60 dark:bg-red-500/5 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-red-700 dark:text-red-400">Low Stock Alerts ({lowStockItems.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.slice(0, 8).map(item => (
                <Badge key={item._id} className="bg-red-100 text-red-700 border-red-200 text-xs">
                  {item.productName || item.name} — {item.quantity} {item.unit || 'units'}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'bg-white/60 dark:bg-white/5 text-muted-foreground hover:bg-white/80'}`}>
            Products Catalog ({products.length})
          </button>
          <button onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === 'stock' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg' : 'bg-white/60 dark:bg-white/5 text-muted-foreground hover:bg-white/80'}`}>
            Stock Records ({inventory.length})
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder={activeTab === 'products' ? 'Search products...' : 'Search inventory...'}
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-slate-800" />
          </div>
          {activeTab === 'products' && (
            <div className="flex gap-2">
              {(['all', 'active', 'pending', 'inactive'] as const).map(f => (
                <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
                  className={filter === f ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : ''}
                  onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
              <p className="text-muted-foreground">Loading inventory...</p>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          /* Products View with images */
          filteredProducts.length === 0 ? (
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
              <CardContent className="p-16 text-center">
                <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {products.length === 0 ? 'No Products Yet' : 'No Products Match Filter'}
                </h3>
                {products.length === 0 && (
                  <Button onClick={() => navigate('/products/add')} className="mt-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add First Product
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card key={product._id} className="glass-card border border-white/30 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
                  {/* Product Image */}
                  <div className="relative h-44 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.currentTarget.src = `https://placehold.co/400x176/f3f0ec/c1482b?text=${encodeURIComponent(product.name.slice(0, 15))}`; }} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10">
                        <Package className="w-12 h-12 text-amber-300 dark:text-amber-500/40" />
                        <p className="text-xs text-muted-foreground/60 mt-2">No image</p>
                      </div>
                    )}
                    {/* Status badge */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium shadow ${
                        product.status === 'active' ? 'bg-green-500 text-white' :
                        product.status === 'pending' ? 'bg-yellow-500 text-white' :
                        'bg-gray-400 text-white'
                      }`}>{product.status}</span>
                    </div>
                    {/* Price overlay */}
                    {product.price?.amount && product.price.amount > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <span className="bg-white/90 dark:bg-slate-800/90 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full font-bold shadow">
                          ₹{product.price.amount.toLocaleString()}/{product.price.unit || 'unit'}
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{product.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize mb-3">{product.category?.replace(/-/g, ' ')}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    )}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        {product.status === 'active' ? (
                          <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-xs text-green-600 font-medium">Visible to buyers</span></>
                        ) : product.status === 'pending' ? (
                          <><AlertTriangle className="w-3 h-3 text-yellow-500" /><span className="text-xs text-yellow-600 font-medium">Awaiting approval</span></>
                        ) : (
                          <><Package className="w-3 h-3 text-gray-400" /><span className="text-xs text-gray-500 font-medium">Not visible</span></>
                        )}
                      </div>
                      {product.stock?.minimumOrder && (
                        <p className="text-xs text-muted-foreground">MOQ: {product.stock.minimumOrder} units</p>
                      )}
                      {!product.price?.amount && (
                        <div className="mt-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg text-xs text-yellow-700 dark:text-yellow-400 font-medium">
                          ⚠ No price — buyers can't order
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          /* Stock Records View */
          filteredInventory.length === 0 ? (
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">
                  {inventory.length === 0 ? 'No stock records yet. Stock is tracked automatically when orders come in.' : 'No items match your search.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredInventory.map(item => {
                const level = getStockLevel(item.quantity || 0, item.reorderPoint || 10);
                const pct = Math.min(100, ((item.quantity || 0) / Math.max(item.quantity || 0, (item.reorderPoint || 10) * 3)) * 100);
                return (
                  <Card key={item._id} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-foreground">{item.productName || item.name}</h3>
                          {item.category && <p className="text-xs text-muted-foreground capitalize">{item.category}</p>}
                        </div>
                        <Badge className={`${level.bg} ${level.color} border-0 text-xs`}>{level.label}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Stock quantity</span>
                        <span className="font-bold text-foreground">{item.quantity} {item.unit || 'units'}</span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-1">
                        <div className={`${level.bar} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      {item.reorderPoint && (
                        <p className="text-xs text-muted-foreground">Reorder when below: {item.reorderPoint} {item.unit || 'units'}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        )}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={() => { localStorage.removeItem('supplierToken'); navigate('/login'); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
