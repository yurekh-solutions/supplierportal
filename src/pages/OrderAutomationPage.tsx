import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, LogOut, RefreshCw, Package, Truck, CheckCircle,
  Clock, XCircle, Search, Loader, DollarSign, TrendingUp, Calendar,
  AlertTriangle, BarChart3, User
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Badge } from '@/pages/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Order {
  _id: string;
  orderNumber?: string;
  customerName?: string;
  buyerName?: string;
  productName?: string;
  productImage?: string;
  totalAmount?: number;
  amount?: number;
  status: string;
  paymentStatus?: string;
  quantity?: number;
  unit?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; textBg: string; icon: any; dot: string }> = {
  pending:        { label: 'Pending',        color: 'text-yellow-700', bg: 'bg-yellow-100 dark:bg-yellow-500/10', textBg: 'bg-yellow-50 dark:bg-yellow-500/5',  icon: Clock,        dot: 'bg-yellow-500' },
  confirmed:      { label: 'Confirmed',      color: 'text-blue-700',   bg: 'bg-blue-100 dark:bg-blue-500/10',     textBg: 'bg-blue-50 dark:bg-blue-500/5',      icon: CheckCircle,  dot: 'bg-blue-500' },
  processing:     { label: 'Processing',     color: 'text-purple-700', bg: 'bg-purple-100 dark:bg-purple-500/10', textBg: 'bg-purple-50 dark:bg-purple-500/5',  icon: Package,      dot: 'bg-purple-500' },
  'ready-to-ship':{ label: 'Ready to Ship', color: 'text-indigo-700', bg: 'bg-indigo-100 dark:bg-indigo-500/10', textBg: 'bg-indigo-50 dark:bg-indigo-500/5',  icon: Package,      dot: 'bg-indigo-500' },
  shipped:        { label: 'Shipped',        color: 'text-indigo-700', bg: 'bg-indigo-100 dark:bg-indigo-500/10', textBg: 'bg-indigo-50 dark:bg-indigo-500/5',  icon: Truck,        dot: 'bg-indigo-400' },
  delivered:      { label: 'Delivered',      color: 'text-green-700',  bg: 'bg-green-100 dark:bg-green-500/10',  textBg: 'bg-green-50 dark:bg-green-500/5',    icon: CheckCircle,  dot: 'bg-green-500' },
  cancelled:      { label: 'Cancelled',      color: 'text-red-700',    bg: 'bg-red-100 dark:bg-red-500/10',      textBg: 'bg-red-50 dark:bg-red-500/5',        icon: XCircle,      dot: 'bg-red-500' },
};

export default function OrderAutomationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/automation/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (data.success) setOrders(data.orders || data.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o =>
    (statusFilter === 'all' || o.status === statusFilter) &&
    (!search ||
      o.orderNumber?.includes(search) ||
      (o.customerName || o.buyerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (o.productName || '').toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    pending:   orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length,
    shipped:   orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || o.amount || 0), 0);
  const deliveredRevenue = orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.totalAmount || o.amount || 0), 0);

  const statusTabs = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'processing', label: 'Processing', count: counts.processing },
    { key: 'shipped', label: 'Shipped', count: counts.shipped },
    { key: 'delivered', label: 'Delivered', count: counts.delivered },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
  ];

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Order Automation</h1>
                <p className="text-xs text-muted-foreground">Track & manage all buyer orders in one place</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchOrders}>
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
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: 'Pending', value: counts.pending, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
            { label: 'Processing', value: counts.processing, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Shipped', value: counts.shipped, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Delivered', value: counts.delivered, color: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-500/10' },
            { label: 'Cancelled', value: counts.cancelled, color: 'from-red-500 to-rose-500', bg: 'bg-red-50 dark:bg-red-500/10' },
            { label: 'Total Orders', value: orders.length, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
          ].map((s, i) => (
            <Card key={i} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-2xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Delivered Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{deliveredRevenue.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
            <CardContent className="p-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ₹{orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Automations Banner */}
        <div className="glass-card border border-white/30 bg-white/40 backdrop-blur-xl rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-purple-500" /> Active Order Automations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Email Confirmations', status: true },
              { label: 'Invoice Generation', status: true },
              { label: 'Shipment Tracking', status: true },
              { label: 'Payment Reminders', status: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${f.status ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                <span className="text-muted-foreground text-xs">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter Tabs + Search */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by order number, buyer name, or product..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map(tab => (
              <Button key={tab.key} size="sm" variant={statusFilter === tab.key ? 'default' : 'outline'}
                className={statusFilter === tab.key ? 'bg-primary text-white' : ''}
                onClick={() => setStatusFilter(tab.key)}>
                {tab.label} {tab.count > 0 && <span className="ml-1 text-xs opacity-80">({tab.count})</span>}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-purple-500 mb-3" />
              <p className="text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
            <CardContent className="p-16 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Filter'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {orders.length === 0
                  ? 'Orders will appear here when buyers purchase your products on RitzYard. Make sure your products are active and priced.'
                  : 'Try clearing your search or selecting a different status tab.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
              const Icon = cfg.icon;
              const orderAmount = order.totalAmount || order.amount || 0;
              const customerName = order.customerName || order.buyerName;
              return (
                <Card key={order._id} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Product Image or Status Icon */}
                      <div className="flex-shrink-0">
                        {order.productImage ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden">
                            <img src={order.productImage} alt={order.productName || ''}
                              className="w-full h-full object-cover"
                              onError={e => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                            <Icon className={`w-6 h-6 ${cfg.color}`} />
                          </div>
                        )}
                      </div>

                      {/* Order Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-foreground">
                                Order #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                              </span>
                              {order.paymentStatus && (
                                <Badge variant="outline" className="text-xs capitalize">{order.paymentStatus}</Badge>
                              )}
                            </div>
                            {order.productName && (
                              <p className="text-sm text-muted-foreground mt-0.5 truncate">{order.productName}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {orderAmount > 0 && (
                              <p className="text-lg font-bold text-foreground">₹{orderAmount.toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        {/* Meta row */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {customerName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" /> {customerName}
                            </span>
                          )}
                          {order.quantity && (
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" /> Qty: {order.quantity} {order.unit || 'units'}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
