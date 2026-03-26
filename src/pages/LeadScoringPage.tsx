import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Target, LogOut, RefreshCw, TrendingUp, Star, Flame,
  Snowflake, Mail, Phone, Building, DollarSign, Loader, Calendar,
  Search, MessageSquare, Package, Lightbulb
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Badge } from '@/pages/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Lead {
  _id: string;
  company: string;
  email: string;
  phone?: string;
  score: number;
  potential: number;
  status: string;
  productInterest?: string;
  inquiryCount?: number;
  lastActivity?: string;
  createdAt: string;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : '#6b7280';
  const bgColor = score >= 80 ? '#fef2f2' : score >= 60 ? '#fffbeb' : '#f9fafb';
  const label = score >= 80 ? 'Hot' : score >= 60 ? 'Warm' : 'Cold';
  const circumference = 138.2;
  const progress = (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="22" fill={bgColor} stroke="#e5e7eb" strokeWidth="4.5" />
          <circle cx="28" cy="28" r="22" fill="none" stroke={color} strokeWidth="4.5"
            strokeDasharray={`${progress} ${circumference}`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>{score}</span>
      </div>
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color, backgroundColor: bgColor + 'cc', border: `1px solid ${color}30` }}>
        {label}
      </span>
    </div>
  );
}

export default function LeadScoringPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/automation/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (data.success) setLeads(data.leads || data.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load leads', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = leads
    .filter(l => filter === 'all' || (filter === 'hot' && l.score >= 80) || (filter === 'warm' && l.score >= 60 && l.score < 80) || (filter === 'cold' && l.score < 60))
    .filter(l => !search || l.company?.toLowerCase().includes(search.toLowerCase()) || l.email?.toLowerCase().includes(search.toLowerCase()) || l.productInterest?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  const hot = leads.filter(l => l.score >= 80).length;
  const warm = leads.filter(l => l.score >= 60 && l.score < 80).length;
  const cold = leads.filter(l => l.score < 60).length;
  const avg = leads.length > 0 ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / leads.length) : 0;
  const totalPotential = leads.reduce((s, l) => s + (l.potential || 0), 0);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lead Scoring</h1>
                <p className="text-xs text-muted-foreground">Identify & prioritize high-value buyer leads</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchLeads}>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Hot Leads', value: hot, icon: Flame, color: 'from-red-500 to-orange-500', bg: 'bg-red-100 dark:bg-red-500/10', iconColor: 'text-red-500', desc: 'Score ≥80' },
            { label: 'Warm Leads', value: warm, icon: TrendingUp, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-100 dark:bg-yellow-500/10', iconColor: 'text-yellow-500', desc: 'Score 60-79' },
            { label: 'Cold Leads', value: cold, icon: Snowflake, color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-100 dark:bg-blue-500/10', iconColor: 'text-blue-400', desc: 'Score <60' },
            { label: 'Avg Score', value: avg || '—', icon: Star, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-100 dark:bg-purple-500/10', iconColor: 'text-purple-500', desc: `${leads.length} total leads` },
          ].map((s, i) => (
            <Card key={i} className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Potential Revenue Banner */}
        {totalPotential > 0 && (
          <div className="glass-card border border-white/30 bg-white/40 backdrop-blur-xl rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Lead Potential Value</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">₹{totalPotential.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Estimated value from {leads.length} active leads</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by company, email, or product interest..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/80 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'all', label: `All (${leads.length})` },
              { key: 'hot', label: `🔥 Hot (${hot})` },
              { key: 'warm', label: `⚡ Warm (${warm})` },
              { key: 'cold', label: `❄️ Cold (${cold})` },
            ].map(f => (
              <Button key={f.key} size="sm" variant={filter === f.key ? 'default' : 'outline'}
                className={filter === f.key ? 'bg-primary text-white' : ''}
                onClick={() => setFilter(f.key as any)}>
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-green-500 mb-3" />
              <p className="text-muted-foreground">Loading leads...</p>
            </div>
          </div>
        ) : leads.length === 0 ? (
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Leads Yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-4">
                Leads are automatically scored when buyers inquire about your products. Make sure your products are active and priced.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mt-4">
                {[
                  { icon: Package, label: 'Active Products', action: () => navigate('/automation/smart-inventory') },
                  { icon: MessageSquare, label: 'Auto-Reply Setup', action: () => navigate('/automation/auto-reply') },
                  { icon: Lightbulb, label: 'Price Optimizer', action: () => navigate('/automation/price-optimizer') },
                ].map((item, i) => (
                  <button key={i} onClick={item.action}
                    className="flex flex-col items-center gap-2 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors text-center">
                    <item.icon className="w-5 h-5 text-green-600" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">{item.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="glass-card border border-white/30 bg-white/60 dark:bg-white/5 backdrop-blur-xl">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No leads match your search or filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead, index) => (
              <Card key={lead._id} className={`glass-card border backdrop-blur-xl shadow-md hover:shadow-lg transition-all ${
                lead.score >= 80 ? 'border-red-200/40 bg-white/70 dark:bg-white/5' :
                lead.score >= 60 ? 'border-yellow-200/40 bg-white/70 dark:bg-white/5' :
                'border-white/30 bg-white/60 dark:bg-white/5'
              }`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Score Ring */}
                    <div className="flex-shrink-0">
                      <ScoreRing score={lead.score || 0} />
                      <p className="text-xs text-center text-muted-foreground mt-1">#{index + 1}</p>
                    </div>

                    {/* Lead Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Building className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <h3 className="font-bold text-foreground">{lead.company || 'Unknown Company'}</h3>
                            {lead.score >= 80 && <span className="text-xs">🔥</span>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-green-600 transition-colors">
                                <Mail className="w-3 h-3" />{lead.email}
                              </a>
                            )}
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-green-600 transition-colors">
                                <Phone className="w-3 h-3" />{lead.phone}
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {lead.potential > 0 && (
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-lg">₹{lead.potential.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </div>

                      {/* Product interest & actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {lead.productInterest && (
                          <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            {lead.productInterest}
                          </Badge>
                        )}
                        {lead.inquiryCount && lead.inquiryCount > 1 && (
                          <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                            {lead.inquiryCount} inquiries
                          </Badge>
                        )}
                        {lead.status && lead.status !== 'new' && (
                          <Badge variant="outline" className="text-xs capitalize">{lead.status}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
