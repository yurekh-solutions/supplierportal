import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ArrowLeft,
  LogOut,
  Loader,
  AlertCircle,
  User,
  Building2,
  Bell,
  Send,
  CheckCircle,
  ShieldCheck,
  X,
  RefreshCw,
  Package,
  MapPin,
  Scale,
  Tag,
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Info,
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import {
  Card,
  CardContent,
} from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Textarea } from '@/pages/components/ui/textarea';
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
  sourceType?: 'lead' | 'material_inquiry' | 'rfq';
  inquiryNumber?: string;
  chatThreadId?: string;
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
  deliveryLocation?: string;
  specifications?: string;
  category?: string;
  brand?: string;
  grade?: string;
  status: 'new' | 'responded' | 'quoted' | 'converted';
  score?: number;
  tags?: string[];
  unreadMessages?: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: 'buyer' | 'supplier' | 'ritzyard';
  message: string;
  createdAt: string;
  isRead: boolean;
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

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInquiry, setChatInquiry] = useState<Inquiry | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showProductInfo, setShowProductInfo] = useState(true);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchInquiries();
    // Auto-refresh inquiry list every 20 seconds so supplier sees new unread badges
    listPollRef.current = setInterval(() => {
      fetchInquiriesSilent();
    }, 20000);
    return () => {
      if (listPollRef.current) clearInterval(listPollRef.current);
    };
  }, [token]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clear chat poll on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (listPollRef.current) clearInterval(listPollRef.current);
    };
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/supplier/inquiries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
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

  // Silent refresh — only updates unread counts without showing loader
  const fetchInquiriesSilent = async () => {
    try {
      const response = await fetch(`${API_URL}/supplier/inquiries`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setInquiries(data.inquiries || []);
        setStats(data.stats || null);
      }
    } catch {
      // silent — ignore network errors in background
    }
  };

  // ─── Chat Functions ──────────────────────────────────────────────
  const getThreadId = (inquiry: Inquiry) =>
    inquiry.chatThreadId || inquiry.inquiryNumber || inquiry._id;

  const fetchChatMessages = async (inquiry: Inquiry, silent = false) => {
    const threadId = getThreadId(inquiry);
    if (!threadId) return;
    if (!silent) setChatLoading(true);
    else setRefreshing(true);
    setChatError('');
    try {
      const res = await fetch(`${API_URL}/chat/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.messages || []);
        // Mark as read
        fetch(`${API_URL}/chat/${threadId}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      } else {
        setChatError(data.message || 'Failed to load messages.');
      }
    } catch {
      setChatError('Could not connect. Please try again.');
    } finally {
      setChatLoading(false);
      setRefreshing(false);
    }
  };

  const openChat = (inquiry: Inquiry) => {
    setChatInquiry(inquiry);
    setChatMessages([]);
    setChatError('');
    setNewMessage('');
    setChatOpen(true);
    fetchChatMessages(inquiry);
    // Start polling
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchChatMessages(inquiry, true), 8000);
  };

  const closeChat = () => {
    setChatOpen(false);
    setChatInquiry(null);
    setChatMessages([]);
    if (pollRef.current) clearInterval(pollRef.current);
    // Refresh inquiry list to update unread counts
    fetchInquiries();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatInquiry) return;
    const threadId = getThreadId(chatInquiry);
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat/${threadId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        await fetchChatMessages(chatInquiry, true);
      } else {
        toast({ title: 'Send failed', description: data.message || 'Could not send message', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────
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

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group messages by date for chat
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  chatMessages.forEach((msg) => {
    const label = formatDate(msg.createdAt);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === label) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date: label, messages: [msg] });
    }
  });

  const getSenderLabel = (msg: ChatMessage) => {
    if (msg.senderRole === 'buyer') return 'Buyer (Protected)';
    if (msg.senderRole === 'ritzyard') return 'RitzYard';
    return 'You';
  };

  const isOwnMessage = (msg: ChatMessage) => msg.senderRole === 'supplier';

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    localStorage.removeItem('supplierToken');
    setShowLogoutModal(false);
    navigate('/login');
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  const newCount = stats?.new || inquiries.filter(i => i.status === 'new').length;
  const totalUnread = inquiries.reduce((sum, i) => sum + (i.unreadMessages || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative">
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
                  {(newCount > 0 || totalUnread > 0) && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-[10px] font-bold text-white">
                        {(newCount + totalUnread) > 9 ? '9+' : newCount + totalUnread}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Buyer Inquiries</h1>
                  <p className="text-xs text-muted-foreground">
                    {newCount > 0 ? (
                      <span className="text-red-500 font-medium">{newCount} new inquiries waiting!</span>
                    ) : (
                      'Chat with buyers through RitzYard platform'
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {inquiry.status === 'new' && (
                            <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 animate-pulse">NEW</Badge>
                          )}
                          {(inquiry.unreadMessages || 0) > 0 && (
                            <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">
                              {inquiry.unreadMessages} unread
                            </Badge>
                          )}
                          {inquiry.sourceType === 'material_inquiry' && (
                            <Badge className="bg-purple-500/20 text-purple-600 border border-purple-500/30 text-[10px] px-1.5 py-0">
                              Material Inquiry
                            </Badge>
                          )}
                          {inquiry.sourceType === 'rfq' && (
                            <Badge className="bg-orange-500/20 text-orange-600 border border-orange-500/30 text-[10px] px-1.5 py-0">
                              RFQ
                            </Badge>
                          )}
                          {inquiry.sourceType === 'lead' && (
                            <Badge className="bg-blue-500/20 text-blue-600 border border-blue-500/30 text-[10px] px-1.5 py-0">
                              Direct Lead
                            </Badge>
                          )}
                          <h3 className="font-bold text-foreground text-lg">{inquiry.productName}</h3>
                        </div>
                        {inquiry.inquiryNumber && (
                          <p className="text-[10px] text-muted-foreground font-mono mb-1">#{inquiry.inquiryNumber}</p>
                        )}
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

                    {/* Buyer Info Row - Protected */}
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
                      <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-md px-2 py-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Buyer contact protected by RitzYard — chat through the platform to connect</span>
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
                        onClick={() => openChat(inquiry)}
                        className={`flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white relative ${
                          (inquiry.unreadMessages || 0) > 0 ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {inquiry.status === 'new' ? 'Open Chat & Quote' : 'Continue Chat'}
                        {(inquiry.unreadMessages || 0) > 0 && (
                          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                            {inquiry.unreadMessages}
                          </span>
                        )}
                      </Button>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-1.5">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        Via RitzYard only
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ─── Chat Panel Overlay ─── */}
      {chatOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeChat}
          />

          {/* Slide-in Panel */}
          <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Panel Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white leading-tight truncate">
                  {chatInquiry?.productName}
                </p>
                <p className="text-xs text-blue-100 font-mono">
                  #{chatInquiry?.inquiryNumber || chatInquiry?._id?.slice(-8)}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Protected
              </div>
              <button
                onClick={() => { if (chatInquiry) fetchChatMessages(chatInquiry, true); }}
                disabled={refreshing}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={closeChat}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Detail Card — collapsible */}
            <div className="flex-shrink-0 border-b border-border">
              {/* Toggle header */}
              <button
                onClick={() => setShowProductInfo(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-950/60 dark:hover:to-blue-950/60 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <Package className="w-3.5 h-3.5" />
                  Product / Buyer Details
                </span>
                {showProductInfo
                  ? <ChevronUp className="w-4 h-4 text-indigo-500" />
                  : <ChevronDown className="w-4 h-4 text-indigo-500" />
                }
              </button>

              {/* Expanded content */}
              {showProductInfo && chatInquiry && (
                <div className="bg-white dark:bg-slate-900 px-4 py-3 space-y-3">
                  {/* Product name + type badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight truncate">
                          {chatInquiry.productName}
                        </p>
                        {chatInquiry.inquiryNumber && (
                          <p className="text-[10px] text-muted-foreground font-mono">#{chatInquiry.inquiryNumber}</p>
                        )}
                      </div>
                    </div>
                    {chatInquiry.sourceType === 'material_inquiry' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5 flex-shrink-0">Material Inquiry</span>
                    )}
                    {chatInquiry.sourceType === 'rfq' && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5 flex-shrink-0">RFQ</span>
                    )}
                    {chatInquiry.sourceType === 'lead' && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 flex-shrink-0">Direct Lead</span>
                    )}
                  </div>

                  {/* Key specs grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Scale className="w-3 h-3 text-blue-500" />
                        <span className="text-[9px] text-blue-600 uppercase tracking-wide font-semibold">Quantity</span>
                      </div>
                      <p className="text-sm font-bold text-foreground">{chatInquiry.quantity} {chatInquiry.unit}</p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2">
                      <div className="flex items-center gap-1 mb-0.5">
                        <IndianRupee className="w-3 h-3 text-green-500" />
                        <span className="text-[9px] text-green-600 uppercase tracking-wide font-semibold">Budget</span>
                      </div>
                      <p className="text-sm font-bold text-foreground truncate">{chatInquiry.budget}</p>
                    </div>
                  </div>

                  {/* Buyer info */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span className="font-semibold text-foreground">{chatInquiry.buyerName}</span>
                      {chatInquiry.buyerCompany && chatInquiry.buyerCompany !== 'Individual' && (
                        <>
                          <span className="text-muted-foreground">·</span>
                          <Building2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                          <span className="text-muted-foreground truncate">{chatInquiry.buyerCompany}</span>
                        </>
                      )}
                    </div>
                    {chatInquiry.deliveryLocation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="truncate">{chatInquiry.deliveryLocation}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags / categories */}
                  {chatInquiry.tags && chatInquiry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {chatInquiry.tags.map((tag, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full px-2 py-0.5">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Description / requirements */}
                  {chatInquiry.description && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-lg p-2.5">
                      <div className="flex items-center gap-1 mb-1">
                        <Info className="w-3 h-3 text-amber-600" />
                        <span className="text-[9px] text-amber-600 uppercase tracking-wide font-semibold">Requirements</span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed line-clamp-3">
                        {chatInquiry.description}
                      </p>
                    </div>
                  )}

                  {/* Privacy notice */}
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-md px-2 py-1.5">
                    <ShieldCheck className="w-3 h-3 flex-shrink-0" />
                    Buyer contact protected by RitzYard — communicate only through platform
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {chatLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                  <p className="text-sm">Loading messages...</p>
                </div>
              ) : chatError ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
                  <AlertCircle className="w-12 h-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground text-sm">{chatError}</p>
                  <Button size="sm" variant="outline" onClick={() => chatInquiry && fetchChatMessages(chatInquiry)}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                  </Button>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Start the conversation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Send your quote or response to the buyer. All communication stays within RitzYard.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border/50" />
                        <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-background/80 rounded-full border border-border/30">
                          {group.date}
                        </span>
                        <div className="flex-1 h-px bg-border/50" />
                      </div>

                      {group.messages.map((msg) => {
                        const own = isOwnMessage(msg);
                        return (
                          <div key={msg._id} className={`flex mb-3 ${own ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex flex-col gap-1 ${own ? 'items-end' : 'items-start'}`}>
                              <span className={`text-[10px] font-semibold px-1 ${own ? 'text-blue-600' : 'text-muted-foreground'}`}>
                                {getSenderLabel(msg)}
                              </span>
                              <div
                                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                  own
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                                    : msg.senderRole === 'ritzyard'
                                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                                    : 'bg-gray-100 dark:bg-slate-700 text-foreground rounded-bl-sm'
                                }`}
                              >
                                {msg.message}
                              </div>
                              <span className="text-[10px] text-muted-foreground px-1">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={chatBottomRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 border-t border-border bg-background px-4 py-3">
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="Send your quote or message... (Enter to send)"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleChatKeyDown}
                  rows={1}
                  className="flex-1 resize-none min-h-[44px] max-h-28 rounded-xl border-2 border-border/50 focus:border-blue-500/50 text-sm py-2.5 px-3"
                />
                <Button
                  onClick={sendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="h-11 w-11 rounded-xl p-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex-shrink-0 hover:shadow-md disabled:opacity-50"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

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
