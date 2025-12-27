import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ArrowLeft,
  LogOut,
  Loader,
  AlertCircle,
  TrendingUp,
  Clock,
  User,
  Mail,
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import LogoutModal from '@/components/LogoutModal';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000/api') {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://backendmatrix.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

interface Inquiry {
  _id: string;
  productId: string;
  productName: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  unit: string;
  budget: string;
  description: string;
  status: 'new' | 'responded' | 'quoted' | 'converted';
  createdAt: string;
  updatedAt: string;
}

const ProductInquiries = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('supplierToken');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded' | 'quoted' | 'converted'>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInquiries();
  }, [token]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/supplier/inquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('supplierToken');
        navigate('/login');
        return;
      }

      const data = await response.json();
      if (data.success && data.inquiries) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === filter);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    responded: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    quoted: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    converted: 'bg-green-500/20 text-green-300 border-green-500/30',
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('supplierToken');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/products')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Product Inquiries</h1>
                  <p className="text-xs text-muted-foreground">Customer demands for your products</p>
                </div>
              </div>
            </div>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleLogoutClick}
              size="sm"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Inquiries', value: inquiries.length, color: 'from-blue-500 to-cyan-500' },
            { label: 'New', value: inquiries.filter(i => i.status === 'new').length, color: 'from-blue-500 to-blue-600' },
            { label: 'Responded', value: inquiries.filter(i => i.status === 'responded').length, color: 'from-yellow-500 to-orange-500' },
            { label: 'Converted', value: inquiries.filter(i => i.status === 'converted').length, color: 'from-green-500 to-emerald-500' },
          ].map((stat, idx) => (
            <Card key={idx} className="glass-card border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'new', 'responded', 'quoted', 'converted'].map(status => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Inquiries Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
              <p className="text-muted-foreground">Loading inquiries...</p>
            </div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <Card className="glass-card border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No inquiries found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredInquiries.map((inquiry) => (
              <Card
                key={inquiry._id}
                className="glass-card border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1 space-y-3">
                      {/* Product & Status */}
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-lg">{inquiry.productName}</h3>
                          <p className="text-xs text-muted-foreground">{inquiry.description}</p>
                        </div>
                        <Badge className={statusColors[inquiry.status]}>
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Quantity Needed</p>
                          <p className="font-semibold text-foreground">{inquiry.quantity} {inquiry.unit}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Budget</p>
                          <p className="font-semibold text-foreground">{inquiry.budget}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Inquiry Date</p>
                          <p className="font-semibold text-foreground">{getTimeAgo(inquiry.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Last Update</p>
                          <p className="font-semibold text-foreground">{getTimeAgo(inquiry.updatedAt)}</p>
                        </div>
                      </div>

                      {/* Buyer Info */}
                      <div className="flex flex-col sm:flex-row gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground">{inquiry.buyerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <p className="text-foreground">{inquiry.buyerEmail}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white w-full sm:w-auto">
                      Respond
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
      />
    </div>
  );
};

export default ProductInquiries;
