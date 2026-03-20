import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ArrowLeft,
  LogOut,
  Loader,
  AlertCircle,
  Phone,
  User,
  Mail,
  Building2,
  Bell,
  Send,
  CheckCircle,
  ExternalLink,
  Star,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import {
  Card,
  CardContent,
} from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Input } from '@/pages/components/ui/input';
import { Textarea } from '@/pages/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/pages/components/ui/dialog';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

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
  buyerPhone?: string;
  buyerCompany?: string;
  quantity: number;
  unit: string;
  budget: string;
  description: string;
  status: 'new' | 'responded' | 'quoted' | 'converted';
  score?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  new: number;
  responded: number;
  qualified: number;
  converted: number;
}

const ProductInquiries = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'new' | 'responded' | 'quoted' | 'converted'>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [responding, setResponding] = useState(false);

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
      if (data.success) {
        setInquiries(data.inquiries || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseMessage('');
    setQuotedPrice('');
    setShowResponseModal(true);
  };

  const submitResponse = async () => {
    if (!selectedInquiry || !responseMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a response message',
        variant: 'destructive'
      });
      return;
    }

    setResponding(true);
    try {
      const response = await fetch(`${API_URL}/supplier/inquiries/${selectedInquiry._id}/respond`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: responseMessage,
          quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
          status: quotedPrice ? 'quoted' : 'contacted'
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Response Sent!',
          description: 'Your response has been recorded successfully',
        });
        setShowResponseModal(false);
        fetchInquiries(); // Refresh list
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send response',
        variant: 'destructive'
      });
    } finally {
      setResponding(false);
    }
  };

  const openWhatsApp = (phone: string, name: string, product: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const message = `Hi ${name}, Thank you for your inquiry about ${product}. I'm reaching out from RitzYard Marketplace to discuss your requirements.`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const openEmail = (email: string, name: string, product: string) => {
    const subject = `Re: Your inquiry for ${product} - RitzYard Marketplace`;
    const body = `Dear ${name},\n\nThank you for your inquiry about ${product}.\n\nWe're pleased to provide you with the following quotation:\n\n[Your quote details here]\n\nPlease let us know if you have any questions.\n\nBest regards`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(inq => inq.status === filter);

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    responded: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    quoted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    converted: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
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

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    localStorage.removeItem('supplierToken');
    setShowLogoutModal(false);
    navigate('/login');
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  const newCount = stats?.new || inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  {newCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold text-white">{newCount > 9 ? '9+' : newCount}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Buyer Inquiries</h1>
                  <p className="text-xs text-muted-foreground">
                    {newCount > 0 ? (
                      <span className="text-red-500 font-medium">{newCount} new inquiries waiting!</span>
                    ) : (
                      'Respond to buyers to win orders'
                    )}
                  </p>
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
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Inquiries', value: stats?.total || inquiries.length, color: 'from-blue-500 to-cyan-500', icon: MessageSquare },
            { label: 'New (Action Needed)', value: stats?.new || inquiries.filter(i => i.status === 'new').length, color: 'from-red-500 to-orange-500', icon: Bell },
            { label: 'Responded', value: stats?.responded || inquiries.filter(i => i.status === 'responded').length, color: 'from-yellow-500 to-amber-500', icon: Send },
            { label: 'Converted to Order', value: stats?.converted || inquiries.filter(i => i.status === 'converted').length, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
          ].map((stat, idx) => (
            <Card key={idx} className="glass-card border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
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
              className={`capitalize ${filter === status && status === 'new' ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              {status}
              {status === 'new' && newCount > 0 && (
                <Badge className="ml-2 bg-white text-red-500 px-1.5 py-0">{newCount}</Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Inquiries List */}
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
              <p className="text-lg font-semibold text-foreground mb-2">No inquiries yet</p>
              <p className="text-muted-foreground text-sm">
                When buyers inquire about your products, they'll appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => (
              <Card
                key={inquiry._id}
                className={`glass-card border backdrop-blur-xl hover:shadow-xl transition-all ${
                  inquiry.status === 'new' 
                    ? 'border-red-500/30 bg-red-500/5 dark:bg-red-500/10' 
                    : 'border-white/20 bg-white/10 dark:bg-white/5'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col gap-4">
                    {/* Top Row: Product & Score */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {inquiry.status === 'new' && (
                            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">NEW</Badge>
                          )}
                          <h3 className="font-bold text-foreground text-lg">{inquiry.productName}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{inquiry.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {inquiry.score && (
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getScoreColor(inquiry.score)}`}>
                              {inquiry.score}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Lead Score</div>
                          </div>
                        )}
                        <Badge className={`${statusColors[inquiry.status]} border`}>
                          {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Buyer Info Row */}
                    <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{inquiry.buyerName}</span>
                        {inquiry.buyerCompany && inquiry.buyerCompany !== 'Individual' && (
                          <>
                            <span className="text-muted-foreground">from</span>
                            <Building2 className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{inquiry.buyerCompany}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <a href={`mailto:${inquiry.buyerEmail}`} className="flex items-center gap-1.5 text-blue-500 hover:underline">
                          <Mail className="w-4 h-4" />
                          {inquiry.buyerEmail}
                        </a>
                        {inquiry.buyerPhone && inquiry.buyerPhone !== 'N/A' && (
                          <a href={`tel:${inquiry.buyerPhone}`} className="flex items-center gap-1.5 text-green-500 hover:underline">
                            <Phone className="w-4 h-4" />
                            {inquiry.buyerPhone}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Quantity</p>
                        <p className="font-bold text-foreground">{inquiry.quantity} {inquiry.unit}</p>
                      </div>
                      <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Budget</p>
                        <p className="font-bold text-foreground">{inquiry.budget}</p>
                      </div>
                      <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Received</p>
                        <p className="font-bold text-foreground">{getTimeAgo(inquiry.createdAt)}</p>
                      </div>
                      <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Last Activity</p>
                        <p className="font-bold text-foreground">{getTimeAgo(inquiry.updatedAt)}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {inquiry.tags && inquiry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {inquiry.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] bg-white/30 dark:bg-white/5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      <Button
                        onClick={() => handleRespond(inquiry)}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Respond
                      </Button>
                      {inquiry.buyerPhone && inquiry.buyerPhone !== 'N/A' && (
                        <Button
                          variant="outline"
                          onClick={() => openWhatsApp(inquiry.buyerPhone!, inquiry.buyerName, inquiry.productName)}
                          className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => openEmail(inquiry.buyerEmail, inquiry.buyerName, inquiry.productName)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      {inquiry.buyerPhone && inquiry.buyerPhone !== 'N/A' && (
                        <Button
                          variant="outline"
                          onClick={() => makeCall(inquiry.buyerPhone!)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Respond to Inquiry
            </DialogTitle>
            <DialogDescription>
              Send a response to {selectedInquiry?.buyerName} about {selectedInquiry?.productName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Buyer Info Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
              <p><strong>Buyer:</strong> {selectedInquiry?.buyerName}</p>
              <p><strong>Product:</strong> {selectedInquiry?.productName}</p>
              <p><strong>Quantity:</strong> {selectedInquiry?.quantity} {selectedInquiry?.unit}</p>
            </div>

            {/* Quoted Price */}
            <div>
              <label className="text-sm font-medium mb-1 block">Quoted Price (Optional)</label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">₹</span>
                <Input
                  type="number"
                  placeholder="Enter your price"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium mb-1 block">Your Message *</label>
              <Textarea
                placeholder="Write your response to the buyer..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowResponseModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={submitResponse}
                disabled={responding || !responseMessage.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {responding ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
