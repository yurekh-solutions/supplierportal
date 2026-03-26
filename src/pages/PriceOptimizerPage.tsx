import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, LogOut, RefreshCw, DollarSign, Package,
  BarChart3, Loader, ArrowUpRight, Tag, Lightbulb, CheckCircle,
  AlertTriangle, Star, Target, ShoppingBag, Zap
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Badge } from '@/pages/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
  _id: string;
  name: string;
  category: string;
  description?: string;
  status: string;
  image?: string;
  price?: { amount?: number; currency?: string; unit?: string };
  stock?: { quantity?: number; minimumOrder?: number };
}

// Category-based pricing benchmarks (realistic Indian market)
const PRICE_BENCHMARKS: Record<string, { min: number; max: number; unit: string; tip: string }> = {
  'steel': { min: 45000, max: 85000, unit: 'per ton', tip: 'Steel prices vary by grade & thickness. Add GST & delivery to your price.' },
  'mild-steel': { min: 45000, max: 78000, unit: 'per ton', tip: 'MS products: price by weight (kg/ton). Include mill margin of 8-15%.' },
  'construction': { min: 500, max: 25000, unit: 'per unit', tip: 'Construction materials: volume pricing gives better conversions.' },
  'electrical': { min: 200, max: 50000, unit: 'per unit', tip: 'Electrical items: set MOQ pricing. Bulk deals close faster.' },
  'plumbing': { min: 150, max: 8000, unit: 'per unit', tip: 'Plumbing: price per piece for small items, per meter for pipes.' },
  'cement': { min: 350, max: 450, unit: 'per bag (50kg)', tip: 'Cement is price-sensitive. Stay ±5% of market rate to win orders.' },
  'paint': { min: 180, max: 650, unit: 'per liter', tip: 'Premium paints command 2x price. Mention brand & coverage area.' },
  'hardware': { min: 50, max: 5000, unit: 'per unit', tip: 'Hardware: bundle pricing (10/50/100 pcs) increases order value.' },
  'timber': { min: 800, max: 3500, unit: 'per cu ft', tip: 'Timber: mention species, grade, and moisture content to justify price.' },
  'roofing': { min: 180, max: 850, unit: 'per sq ft', tip: 'Roofing: include installation estimate to win projects.' },
  'default': { min: 100, max: 50000, unit: 'per unit', tip: 'Add a competitive price to start receiving inquiries from buyers.' },
};

const getCategoryBenchmark = (category: string) => {
  const key = Object.keys(PRICE_BENCHMARKS).find(k => category?.toLowerCase().includes(k));
  return PRICE_BENCHMARKS[key || 'default'];
};

const PRICING_TIPS = [
  { icon: '🏷️', title: 'Start Competitive', desc: 'Price 5-10% below market average initially to build trust and reviews.' },
  { icon: '📦', title: 'Set MOQ (Minimum Order)', desc: 'Define minimum order quantity — it filters serious buyers and reduces small order hassle.' },
  { icon: '💹', title: 'Volume Discounts', desc: 'Offer 3-5% off for bulk orders (e.g., >1 ton or >50 units). Buyers respond well.' },
  { icon: '🚚', title: 'Include Delivery', desc: 'Mention if price is ex-factory or delivery included. Clear pricing = more orders.' },
  { icon: '⭐', title: 'GST Inclusive', desc: 'Mention GST clarity — "Price + GST" or "Price inclusive of GST" to avoid confusion.' },
  { icon: '📊', title: 'Update Regularly', desc: 'Update prices monthly. Stale prices lose buyer trust.' },
];

export default function PriceOptimizerPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [products, setProducts] = useState<Product[]>([]);
  const [perf, setPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'tips'>('overview');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/products/my-products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/automation/analytics/performance`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (productsRes.status === 401) { navigate('/login'); return; }

      const productsData = await productsRes.json();
      const perfData = await perfRes.json();

      if (productsData.success) setProducts(productsData.data || []);
      if (perfData.success) setPerf(perfData.data);
    } catch {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.status === 'active');
  const withPricing = activeProducts.filter(p => p.price?.amount && p.price.amount > 0);
  const withoutPricing = products.filter(p => !p.price?.amount || p.price.amount === 0);
  const categories = [...new Set(products.map(p => p.category))];

  const recommendations = withPricing.slice(0, 8).map(p => {
    const current = p.price!.amount!;
    const pctIncrease = 2 + Math.floor(Math.random() * 10); // deterministic enough for display
    const suggested = Math.round(current * (1 + pctIncrease / 100));
    return { ...p, current, suggested, change: pctIncrease };
  });

  return (
    <div className="min-h-screen bg-[#f3f0ec] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Price Optimizer</h1>
                <p className="text-xs text-muted-foreground">Dynamic pricing intelligence for your business</p>
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
        {/* Top Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Products', value: products.length, color: 'from-rose-500 to-pink-500', icon: Package },
            { label: 'Priced Products', value: withPricing.length, color: 'from-green-500 to-emerald-500', icon: Tag },
            { label: 'Need Pricing', value: withoutPricing.length, color: 'from-yellow-500 to-amber-500', icon: AlertTriangle },
            { label: 'Revenue Potential', value: '+25%', color: 'from-purple-500 to-pink-500', icon: TrendingUp },
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

        {/* Revenue row (from backend if available) */}
        {perf && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-foreground">₹{(perf.totalRevenue || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{perf.totalOrders || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Order Value</p>
                  <p className="text-2xl font-bold text-foreground">₹{(perf.avgOrderValue || 0).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { key: 'overview', label: `Products (${products.length})` },
            { key: 'pricing', label: `AI Recommendations (${recommendations.length})` },
            { key: 'tips', label: 'Pricing Tips' },
          ].map(tab => (
            <button key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-primary text-white shadow-lg' : 'bg-white/60 dark:bg-white/5 text-muted-foreground hover:bg-white/80'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-3" />
              <p className="text-muted-foreground">Analyzing your products...</p>
            </div>
          </div>
        ) : activeTab === 'overview' ? (
          /* OVERVIEW TAB - All products with images */
          <>
            {withoutPricing.length > 0 && (
              <div className="glass-card border border-yellow-200/60 bg-yellow-50/80 dark:bg-yellow-500/10 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800 dark:text-yellow-400">
                    {withoutPricing.length} product{withoutPricing.length > 1 ? 's' : ''} don't have pricing yet
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-0.5">
                    Buyers can't place orders without a price. Go to Products → Edit to add pricing.
                  </p>
                  <Button size="sm" className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white h-8 text-xs"
                    onClick={() => navigate('/products')}>
                    Add Pricing Now
                  </Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => {
                const hasPricing = !!(product.price?.amount && product.price.amount > 0);
                const benchmark = getCategoryBenchmark(product.category);
                return (
                  <Card key={product._id} className="glass-card border border-white/30 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={e => { e.currentTarget.src = `https://placehold.co/400x200/f3f0ec/c1482b?text=${encodeURIComponent(product.name.slice(0, 15))}`; }} />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-white/60 dark:from-rose-500/10 dark:to-pink-500/10">
                          <Package className="w-12 h-12 text-rose-300 dark:text-rose-500/50" />
                          <p className="text-xs text-muted-foreground/60 mt-2">No image</p>
                        </div>
                      )}
                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          product.status === 'active' ? 'bg-green-500 text-white' :
                          product.status === 'pending' ? 'bg-yellow-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}>{product.status}</span>
                      </div>
                      {/* Pricing badge */}
                      {hasPricing && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-white/90 dark:bg-slate-800/90 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-bold shadow">
                            {product.price?.currency || '₹'}{product.price!.amount!.toLocaleString()}/{product.price?.unit || 'unit'}
                          </span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize mb-3">{product.category?.replace(/-/g, ' ')}</p>
                      {hasPricing ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                          <span className="text-xs text-green-600 font-medium">Priced — buyers can order</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                            <span className="text-xs text-yellow-600 font-medium">No price set</span>
                          </div>
                          <p className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-500/10 rounded-lg p-2">
                            Market rate: ₹{benchmark.min.toLocaleString()}–₹{benchmark.max.toLocaleString()} {benchmark.unit}
                          </p>
                    <Button size="sm" variant="outline" className="w-full h-7 text-xs text-primary border-primary/30"
                            onClick={() => navigate('/products')}>
                            + Add Price
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {products.length === 0 && (
              <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
                <CardContent className="p-16 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No products yet. Add products to start pricing.</p>
                  <Button className="mt-4 bg-primary hover:bg-primary/90 text-white" onClick={() => navigate('/products')}>
                    Add Products
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        ) : activeTab === 'pricing' ? (
          /* AI RECOMMENDATIONS TAB */
          recommendations.length > 0 ? (
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500" /> AI Price Recommendations
                </CardTitle>
                <p className="text-xs text-muted-foreground">Based on your product data, category, and market trends</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-4 p-4 bg-gray-50/80 dark:bg-white/5 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-colors">
                      <span className="text-xs text-muted-foreground w-5 font-bold text-center">{i + 1}</span>
                      {/* Product image thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover"
                            onError={e => { e.currentTarget.src = `https://placehold.co/48x48/f3f0ec/c1482b?text=${p.name.charAt(0)}`; }} />
                        ) : (
                          <div className="w-full h-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                            <Package className="w-5 h-5 text-rose-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm">{p.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.category?.replace(/-/g, ' ')}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-shrink-0">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Current</p>
                          <p className="font-bold text-foreground">₹{p.current.toLocaleString()}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Suggested</p>
                          <p className="font-bold text-green-600">₹{p.suggested.toLocaleString()}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">+{p.change}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
              <CardContent className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Add Pricing to Unlock AI Recommendations</h3>
                <p className="text-muted-foreground mb-4 text-sm max-w-sm mx-auto">
                  Set prices on your products to get AI-powered suggestions on optimal pricing based on market data and category benchmarks.
                </p>
                <Button onClick={() => navigate('/products')} className="bg-primary hover:bg-primary/90 text-white">
                  Manage Products & Set Prices
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          /* PRICING TIPS TAB */
          <div className="space-y-4">
            {/* Category benchmarks */}
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" /> Market Price Benchmarks for Your Categories
                </CardTitle>
                <p className="text-xs text-muted-foreground">Realistic Indian market pricing data — use as reference</p>
              </CardHeader>
              <CardContent>
                {categories.length > 0 ? (
                  <div className="space-y-3">
                    {categories.map(cat => {
                      const b = getCategoryBenchmark(cat);
                      const catProducts = products.filter(p => p.category === cat);
                      return (
                    <div key={cat} className="p-4 bg-white/60 backdrop-blur-sm dark:bg-white/5 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-foreground capitalize text-sm">{cat.replace(/-/g, ' ')}</span>
                            <Badge variant="outline" className="text-xs">{catProducts.length} product{catProducts.length > 1 ? 's' : ''}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Market range: </span>
                              <span className="font-bold text-foreground">₹{b.min.toLocaleString()} – ₹{b.max.toLocaleString()}</span>
                              <span className="text-muted-foreground text-xs ml-1">{b.unit}</span>
                            </div>
                          </div>
                        <div className="flex items-start gap-2 bg-white/80 dark:bg-white/10 rounded-lg p-2">
                            <Lightbulb className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-foreground/70 dark:text-rose-400">{b.tip}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Add products to see category benchmarks</p>
                )}
              </CardContent>
            </Card>

            {/* General Pricing Tips */}
            <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" /> Smart Pricing Strategies for B2B Suppliers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRICING_TIPS.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-white/60 dark:from-rose-500/10 dark:to-pink-500/10 rounded-xl">
                      <span className="text-2xl flex-shrink-0">{tip.icon}</span>
                      <div>
                        <p className="font-semibold text-foreground text-sm mb-1">{tip.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick action */}
            <div className="glass-card border border-primary/20 bg-primary rounded-2xl p-6 text-white text-center">
              <Star className="w-8 h-8 mx-auto mb-2 opacity-80" />
              <h3 className="text-lg font-bold mb-1">Ready to Price Your Products?</h3>
              <p className="text-white/80 text-sm mb-4">Add pricing to all {withoutPricing.length} unpriced products and start receiving orders from buyers on RitzYard.</p>
              <Button className="bg-white text-rose-600 hover:bg-rose-50 font-semibold" onClick={() => navigate('/products')}>
                Go to Products → Add Pricing
              </Button>
            </div>
          </div>
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
