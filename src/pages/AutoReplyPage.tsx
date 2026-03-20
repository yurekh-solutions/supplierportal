import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Plus, Trash2, LogOut, CheckCircle, XCircle,
  Loader, Zap, RefreshCw, Clock, Users, TrendingUp, Lightbulb, Bot
} from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Badge } from '@/pages/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Textarea } from '@/pages/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/components/ui/select';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AutoReply {
  _id: string;
  messageType: string;
  responseText: string;
  isActive: boolean;
  triggerKeywords: string[];
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  'general-inquiry': 'General Inquiry',
  'price-quote': 'Price Quote Request',
  'product-availability': 'Product Availability',
  'custom': 'Custom Message',
};

const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  'general-inquiry': { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/10', icon: '💬' },
  'price-quote': { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-500/10', icon: '💰' },
  'product-availability': { color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-500/10', icon: '📦' },
  'custom': { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/10', icon: '✏️' },
};

const REPLY_TIPS = [
  { icon: '⏱️', text: 'Auto-replies fire instantly 24/7 — even when you\'re offline.' },
  { icon: '🎯', text: 'Use trigger keywords to match specific buyer questions precisely.' },
  { icon: '📈', text: 'Suppliers with auto-replies get 78% more inquiry conversions.' },
  { icon: '🤝', text: 'Set professional tone: warm, concise, and action-oriented.' },
];

export default function AutoReplyPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = localStorage.getItem('supplierToken');

  const [replies, setReplies] = useState<AutoReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [form, setForm] = useState({
    messageType: 'general-inquiry',
    responseText: '',
    triggerKeywords: '',
  });

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetchReplies();
  }, []);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/automation/auto-replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) { navigate('/login'); return; }
      const data = await res.json();
      if (data.success) setReplies(data.data || []);
    } catch {
      toast({ title: 'Error', description: 'Failed to load auto-replies', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const prompts: Record<string, string> = {
        'general-inquiry': 'Generate a professional friendly auto-reply for a general product inquiry from a B2B construction materials supplier. Keep it 50-100 words.',
        'price-quote': 'Generate a professional auto-reply for a price quote request from a B2B supplier. Include timeline and next steps. Keep it 50-100 words.',
        'product-availability': 'Generate a professional auto-reply for product availability inquiries from a construction materials supplier. Keep it 50-100 words.',
        'custom': 'Generate a professional and friendly auto-reply for a B2B supplier. Be warm and helpful. Keep it 50-100 words.',
      };
      const res = await fetch(`${API_URL}/ai/generate-auto-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ messageType: form.messageType, prompt: prompts[form.messageType] })
      });
      const data = await res.json();
      if (data.success && data.reply) {
        setForm(f => ({ ...f, responseText: data.reply }));
        toast({ title: '✨ AI Generated', description: 'Response generated successfully!' });
      }
    } catch {
      toast({ title: 'Error', description: 'AI generation failed', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!form.responseText.trim()) {
      toast({ title: 'Required', description: 'Please enter a response text', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/automation/auto-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messageType: form.messageType,
          responseText: form.responseText,
          triggerKeywords: form.triggerKeywords.split(',').map(k => k.trim()).filter(Boolean),
        })
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Saved!', description: 'Auto-reply created successfully' });
        setForm({ messageType: 'general-inquiry', responseText: '', triggerKeywords: '' });
        setShowForm(false);
        fetchReplies();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save auto-reply', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/automation/auto-replies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Deleted', description: 'Auto-reply removed' });
        fetchReplies();
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleToggle = async (reply: AutoReply) => {
    try {
      const res = await fetch(`${API_URL}/automation/auto-replies/${reply._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !reply.isActive })
      });
      const data = await res.json();
      if (data.success) fetchReplies();
    } catch {
      toast({ title: 'Error', description: 'Failed to update', variant: 'destructive' });
    }
  };

  const activeReplies = replies.filter(r => r.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/products')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Auto Reply Manager</h1>
                <p className="text-xs text-muted-foreground">Respond to buyer inquiries instantly 24/7</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchReplies}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white" onClick={() => setShowForm(!showForm)}>
                <Plus className="w-4 h-4 mr-1" /> New Reply
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 border-red-200" onClick={() => setShowLogoutModal(true)}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Replies', value: replies.length, color: 'from-blue-500 to-indigo-500', icon: MessageSquare },
            { label: 'Active', value: activeReplies.length, color: 'from-green-500 to-emerald-500', icon: CheckCircle },
            { label: 'Inactive', value: replies.filter(r => !r.isActive).length, color: 'from-gray-400 to-gray-500', icon: XCircle },
            { label: 'Response Rate', value: replies.length > 0 ? '+78%' : '—', color: 'from-purple-500 to-pink-500', icon: TrendingUp },
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

        {/* How it works banner */}
        {replies.length === 0 && !showForm && (
          <Card className="glass-card border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-xl shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-base mb-1">How Auto-Reply Works</h3>
                  <p className="text-sm text-muted-foreground mb-4">When a buyer sends you a message on RitzYard, our system automatically matches it to your auto-reply rules and sends an instant response — even when you're offline.</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {REPLY_TIPS.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-lg flex-shrink-0">{tip.icon}</span>
                        <p className="text-xs text-muted-foreground">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                  <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white" onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Create First Auto-Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Form */}
        {showForm && (
          <Card className="glass-card border-2 border-blue-200/50 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-xl mb-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5 text-blue-500" /> Create Auto-Reply
              </CardTitle>
              <p className="text-xs text-muted-foreground">Set up an automatic response for a specific type of buyer inquiry</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message Type</label>
                <Select value={form.messageType} onValueChange={v => setForm(f => ({ ...f, messageType: v }))}>
                  <SelectTrigger className="bg-white/80 dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general-inquiry">💬 General Inquiry</SelectItem>
                    <SelectItem value="price-quote">💰 Price Quote Request</SelectItem>
                    <SelectItem value="product-availability">📦 Product Availability</SelectItem>
                    <SelectItem value="custom">✏️ Custom Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Response Text</label>
                  <Button size="sm" variant="outline" onClick={handleGenerateAI} disabled={generating} className="text-purple-600 border-purple-200">
                    {generating ? <Loader className="w-3 h-3 animate-spin mr-1" /> : <Zap className="w-3 h-3 mr-1" />}
                    {generating ? 'Generating...' : '✨ Generate with AI'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Type your automatic response here... e.g. 'Thank you for your inquiry! Our team will get back to you within 2-4 hours with pricing details...'"
                  value={form.responseText}
                  onChange={e => setForm(f => ({ ...f, responseText: e.target.value }))}
                  rows={4}
                  className="bg-white/80 dark:bg-slate-800"
                />
                {form.responseText && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200/50">
                    <p className="text-xs text-muted-foreground mb-1 font-medium">Preview:</p>
                    <p className="text-sm text-foreground/80 italic">"{form.responseText}"</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">
                  Trigger Keywords <span className="text-muted-foreground font-normal">(comma separated, optional)</span>
                </label>
                <p className="text-xs text-muted-foreground mb-2">This reply fires when buyer message contains these words</p>
                <Input
                  placeholder="e.g. price, quote, cost, availability, stock"
                  value={form.triggerKeywords}
                  onChange={e => setForm(f => ({ ...f, triggerKeywords: e.target.value }))}
                  className="bg-white/80 dark:bg-slate-800"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex-1">
                  {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? 'Saving...' : 'Save Auto-Reply'}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replies List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-3" />
              <p className="text-muted-foreground">Loading auto-replies...</p>
            </div>
          </div>
        ) : replies.length === 0 && !showForm ? null : replies.length > 0 ? (
          <>
            {/* Active Status Banner */}
            {activeReplies.length > 0 && (
              <div className="flex items-center gap-3 mb-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200/50 rounded-2xl">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {activeReplies.length} auto-repl{activeReplies.length > 1 ? 'ies' : 'y'} active — responding to buyers automatically
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {replies.map(reply => {
                const cfg = TYPE_CONFIG[reply.messageType] || TYPE_CONFIG['custom'];
                return (
                  <Card key={reply._id} className={`glass-card border backdrop-blur-xl shadow-lg hover:shadow-xl transition-all ${reply.isActive ? 'border-white/30 bg-white/60 dark:bg-white/5' : 'border-gray-200/30 bg-gray-50/60 dark:bg-white/2 opacity-70'}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center text-xl`}>
                            {cfg.icon}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{TYPE_LABELS[reply.messageType] || reply.messageType}</p>
                            <p className="text-xs text-muted-foreground">{new Date(reply.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleToggle(reply)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${reply.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-400'}`}>
                            {reply.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {reply.isActive ? 'Active' : 'Inactive'}
                          </button>
                          <button onClick={() => handleDelete(reply._id)}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition-colors dark:bg-red-500/10 dark:hover:bg-red-500/20">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Message Preview */}
                      <div className="relative">
                        <div className="absolute -left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full" />
                        <p className="text-sm text-foreground/80 bg-white/80 dark:bg-white/5 rounded-xl p-3 pl-4 leading-relaxed border border-gray-100/50 dark:border-white/5 italic">
                          "{reply.responseText}"
                        </p>
                      </div>

                      {reply.triggerKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-xs text-muted-foreground">Triggers:</span>
                          {reply.triggerKeywords.map((kw, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200">
                              {kw}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onConfirm={() => { localStorage.removeItem('supplierToken'); navigate('/login'); }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </div>
  );
}
