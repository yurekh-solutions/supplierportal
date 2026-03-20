import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, PieChart, LogOut, RefreshCw, DollarSign, Package, MessageSquare,
  Target, ShoppingBag, TrendingUp, BarChart3, Loader, CheckCircle, AlertTriangle,
  Eye, Lightbulb, Zap, Star, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  status: string;
  image?: string;
  price?: { amount?: number; currency?: string };
  createdAt?: string;
}

// Business tips per scenario
const BUSINESS_TIPS = [
  { icon: '🏷️', title: 'Set Competitive Prices', desc: 'Products without pricing cannot receive orders. Set prices to unlock revenue.', action: 'Add Pricing', route: '/automation/price-optimizer' },
  { icon: '📸', title: 'Add Product Photos', desc: 'Products with images get 3x more buyer inquiries. Upload clear product photos.', action: 'Manage Products', route: '/products' },
  { icon: '⚡', title: 'Enable Auto-Reply', desc: 'Respond to inquiries 24/7. Set up automatic responses to never miss a lead.', action: 'Setup Auto-Reply', route: '/automation/auto-reply' },
  { icon: '📦', title: 'Diversify Categories', desc: 'Listing in 3+ categories increases your visibility to 4x more buyers.', action: 'Add Products', route: '/products' },
  { icon: '📊', title: 'Track Your Orders', desc: 'Monitor all orders in real-time to ensure timely fulfilment and buyer satisfaction.', action: 'View Orders', route: '/automation/order-automation' },
];

const GRADIENT_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-red-500',
  'from-teal-500 to-cyan-500',
];

export default function AnalyticsHubPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [perf, setPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/products/my-products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/automation/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/automation/analytics/performance`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (productsRes.status === 401) { navigate('/login'); return; }

      const [productsData, statsData, perfData] = await Promise.all([
        productsRes.json(), statsRes.json(), perfRes.json()
      ]);

      if (productsData.success) setProducts(productsData.data || []);
      if (statsData.success) setStats(statsData.data);
      if (perfData.success) setPerf(perfData.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load analytics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const pendingProducts = products.filter(p => p.status === 'pending');
  const inactiveProducts = products.filter(p => p.status !== 'active' && p.status !== 'pending');
  const categories = [...new Set(products.map(p => p.category))];
  const pricedProducts = products.filter(p => p.price?.amount && p.price.amount > 0);
  const withImages = products.filter(p => !!p.image);

  const visibilityScore = products.length === 0 ? 0 : Math.round((activeProducts.length / products.length) * 100);

  // Completeness score — how complete is the supplier's store
  const completenessFactors = [
    { label: 'Has products', done: products.length > 0 },
    { label: 'Has active products', done: activeProducts.length > 0 },
    { label: 'Products with pricing', done: pricedProducts.length > 0 },
    { label: 'Products with images', done: withImages.length > 0 },
    { label: 'Auto-reply enabled', done: (stats?.totalAutoReplies || 0) > 0 },
    { label: 'Multiple categories', done: categories.length >= 2 },
  ];
  const completenessScore = Math.round((completenessFactors.filter(f => f.done).length / completenessFactors.length) * 100);

  // Recent products (last 3)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Analytics Hub</h1>
                <p className="text-xs text-muted-foreground">Real-time business insights & reports</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAll}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 border-red-200" onClick={() => setShowLogoutModal(true)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-cyan-500 mb-3" />
              <p className="text-muted-foreground">Loading your analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Products', value: products.length, icon: Package, color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-100 dark:bg-cyan-500/10', iconColor: 'text-cyan-600' },
                { label: 'Active (Visible)', value: activeProducts.length, icon: Eye, color: 'from-green-500 to-emerald-500', bg: 'bg-green-100 dark:bg-green-500/10', iconColor: 'text-green-600' },
                { label: 'Total Orders', value: perf?.totalOrders ?? (stats?.totalOrders ?? 0), icon: ShoppingBag, color: 'from-purple-500 to-indigo-500', bg: 'bg-purple-100 dark:bg-purple-500/10', iconColor: 'text-purple-600' },
                { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: Target, color: 'from-rose-500 to-pink-500', bg: 'bg-rose-100 dark:bg-rose-500/10', iconColor: 'text-rose-600' },
              ].map((s, i) => (
                <Card key={i} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                        <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue + Visibility Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {/* Revenue Metrics */}
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg col-span-1 sm:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" /> Revenue Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-500/10 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(perf?.totalRevenue || 0) > 0 ? `₹${((perf.totalRevenue) / 1000).toFixed(1)}K` : '₹0'}
                      </p>
                      {(perf?.totalRevenue || 0) === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">No orders yet</p>
                      )}
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Avg Order</p>
                      <p className="text-2xl font-bold text-blue-600">₹{((perf?.avgOrderValue || 0)).toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">Orders</p>
                      <p className="text-2xl font-bold text-purple-600">{perf?.totalOrders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Visibility Score */}
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-cyan-500" /> Visibility Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="38" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle cx="48" cy="48" r="38" fill="none" stroke="url(#visGrad)" strokeWidth="8"
                          strokeDasharray={`${(visibilityScore / 100) * 238.8} 238.8`} strokeLinecap="round" />
                        <defs>
                          <linearGradient id="visGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={visibilityScore >= 80 ? '#10b981' : visibilityScore >= 50 ? '#f59e0b' : '#ef4444'} />
                            <stop offset="100%" stopColor={visibilityScore >= 80 ? '#059669' : visibilityScore >= 50 ? '#d97706' : '#dc2626'} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-foreground">{visibilityScore}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {activeProducts.length} of {products.length} products visible
                    </p>
                    {pendingProducts.length > 0 && (
                      <Badge className="mt-2 bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                        {pendingProducts.length} pending approval
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Store Completeness */}
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" /> Store Completeness
                  </CardTitle>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${completenessScore >= 80 ? 'from-green-500 to-emerald-500' : completenessScore >= 50 ? 'from-yellow-500 to-amber-500' : 'from-red-500 to-orange-500'} bg-clip-text text-transparent`}>
                    {completenessScore}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Complete your store profile to attract more buyers</p>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-4">
                  <div className={`h-2 rounded-full transition-all bg-gradient-to-r ${completenessScore >= 80 ? 'from-green-500 to-emerald-500' : completenessScore >= 50 ? 'from-yellow-500 to-amber-500' : 'from-red-500 to-orange-500'}`}
                    style={{ width: `${completenessScore}%` }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {completenessFactors.map((f, i) => (
                    <div key={i} className={`flex items-center gap-2 p-3 rounded-xl text-sm ${f.done ? 'bg-green-50 dark:bg-green-500/10' : 'bg-gray-50 dark:bg-white/5'}`}>
                      {f.done ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                      )}
                      <span className={`text-xs ${f.done ? 'text-green-700 dark:text-green-400 font-medium' : 'text-muted-foreground'}`}>{f.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown + Recent Products row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Category breakdown */}
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-cyan-500" /> Products by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {categories.length > 0 ? (
                    <div className="space-y-3">
                      {categories.map((cat, i) => {
                        const catProducts = products.filter(p => p.category === cat);
                        const catActive = catProducts.filter(p => p.status === 'active').length;
                        const pct = Math.round((catProducts.length / products.length) * 100);
                        const gradient = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradient}`} />
                                <span className="text-sm font-medium text-foreground capitalize">{cat.replace(/-/g, ' ')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{catProducts.length} ({catActive} active)</span>
                                <span className="text-xs font-bold text-foreground">{pct}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2">
                              <div className={`bg-gradient-to-r ${gradient} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-6">No products yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Products */}
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4 text-teal-500" /> Recent Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentProducts.length > 0 ? (
                    <div className="space-y-3">
                      {recentProducts.map(product => (
                        <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-white/5 rounded-xl">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img src={product.image} alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => { e.currentTarget.src = `https://placehold.co/48x48/f3f0ec/c1482b?text=${product.name.charAt(0)}`; }} />
                            ) : (
                              <div className="w-full h-full bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-cyan-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{product.category?.replace(/-/g, ' ')}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                            product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>{product.status}</span>
                        </div>
                      ))}
                      <button onClick={() => navigate('/products')} className="w-full text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center justify-center gap-1 pt-1">
                        View all {products.length} products <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No products yet</p>
                      <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white" onClick={() => navigate('/products')}>
                        Add First Product
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Automation Stats */}
            {stats && (
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-500" /> Automation Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Auto-Replies', value: stats.totalAutoReplies || 0, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', tip: 'replies set up' },
                      { label: 'Leads Scored', value: stats.totalLeads || 0, icon: Target, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10', tip: 'buyer leads' },
                      { label: 'Orders', value: stats.totalOrders || 0, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-500/10', tip: 'processed' },
                      { label: 'Active Products', value: activeProducts.length, icon: Package, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10', tip: 'visible to buyers' },
                    ].map((s, i) => (
                      <div key={i} className={`flex items-center gap-3 p-4 ${s.bg} rounded-xl`}>
                        <div className="w-10 h-10 rounded-lg bg-white/60 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                          <s.icon className={`w-5 h-5 ${s.color}`} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-xs text-muted-foreground/70">{s.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actionable Insights */}
            <Card className="glass-card border border-cyan-200/50 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-500/10 dark:to-teal-500/10 backdrop-blur-xl shadow-lg mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Key Insights & Next Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeProducts.length === 0 && (
                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">No active products</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-0.5">Submit products for admin approval to start selling on RitzYard.</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs text-red-600 border-red-200 flex-shrink-0 h-7"
                        onClick={() => navigate('/products')}>Fix →</Button>
                    </div>
                  )}
                  {activeProducts.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        <span className="font-semibold">{activeProducts.length}</span> active product{activeProducts.length > 1 ? 's' : ''} visible to buyers across <span className="font-semibold">{categories.length}</span> categor{categories.length > 1 ? 'ies' : 'y'}.
                      </p>
                    </div>
                  )}
                  {pendingProducts.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        <span className="font-semibold">{pendingProducts.length}</span> product{pendingProducts.length > 1 ? 's' : ''} awaiting admin approval — check back in 24 hrs.
                      </p>
                    </div>
                  )}
                  {pricedProducts.length < products.length && products.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl">
                      <TrendingUp className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-orange-700 dark:text-orange-400">
                          <span className="font-semibold">{products.length - pricedProducts.length}</span> products have no price — buyers can't place orders.
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs text-orange-600 border-orange-200 flex-shrink-0 h-7"
                        onClick={() => navigate('/automation/price-optimizer')}>Add →</Button>
                    </div>
                  )}
                  {withImages.length < products.length && products.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                      <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <span className="font-semibold">{products.length - withImages.length}</span> products are missing photos. Products with images get <span className="font-semibold">3x</span> more inquiries.
                      </p>
                    </div>
                  )}
                  {(!stats?.totalAutoReplies || stats.totalAutoReplies === 0) && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl">
                      <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-purple-700 dark:text-purple-400">Set up Auto-Reply to respond to inquiries 24/7 — boost response rate by <span className="font-semibold">+78%</span>.</p>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs text-purple-600 border-purple-200 flex-shrink-0 h-7"
                        onClick={() => navigate('/automation/auto-reply')}>Setup →</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Growth Tips */}
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-500" /> Grow Your Business on RitzYard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {BUSINESS_TIPS.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-500/10 dark:to-teal-500/10 rounded-xl">
                      <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm mb-1">{tip.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-2">{tip.desc}</p>
                        <button onClick={() => navigate(tip.route)}
                          className="text-xs text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
                          {tip.action} <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
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
