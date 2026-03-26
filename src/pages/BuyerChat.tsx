import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Textarea } from '@/pages/components/ui/textarea';
import ritzyardLogo from '@/assets/RITZYARD3.svg';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface ChatMessage {
  _id: string;
  senderId: string;
  senderRole: 'buyer' | 'supplier' | 'ritzyard';
  message: string;
  createdAt: string;
  isRead: boolean;
}

const BuyerChat = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (email) params.set('email', email);
    if (token) params.set('token', token);
    return params.toString() ? `?${params.toString()}` : '';
  };

  const fetchMessages = async (silent = false) => {
    if (!inquiryId) return;
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/chat/${inquiryId}${buildQuery()}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
        setError('');
      } else {
        setError(data.message || 'Failed to load messages.');
      }
    } catch {
      setError('Could not connect. Please check your internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !inquiryId) return;
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/chat/${inquiryId}${buildQuery()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage('');
        await fetchMessages(true);
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll every 8 seconds for new messages
    pollRef.current = setInterval(() => fetchMessages(true), 8000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [inquiryId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Group messages by date
  const grouped: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateLabel) {
      last.messages.push(msg);
    } else {
      grouped.push({ date: dateLabel, messages: [msg] });
    }
  });

  const getSenderLabel = (msg: ChatMessage) => {
    if (msg.senderRole === 'buyer') return 'You';
    if (msg.senderRole === 'ritzyard') return 'RitzYard';
    return 'RitzYard Verified Supplier';
  };

  const isOwnMessage = (msg: ChatMessage) => msg.senderRole === 'buyer';

  return (
    <div className="flex flex-col h-screen bg-[#f3f0ec]">
      {/* Header */}
      <div className="glass-card border-b-2 border-white/20 backdrop-blur-2xl shadow-xl flex-shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary overflow-hidden flex-shrink-0">
            <img src={ritzyardLogo} alt="RitzYard" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground leading-tight">Inquiry Chat</p>
            <p className="text-xs text-muted-foreground truncate">
              Ref: <span className="font-mono font-semibold text-primary">{inquiryId}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full border border-green-200">
            <ShieldCheck className="w-3 h-3" />
            Protected
          </div>
          <button
            onClick={() => fetchMessages(true)}
            disabled={refreshing}
            className="p-2 rounded-xl hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="max-w-2xl mx-auto w-full px-4 pt-3">
        <div className="text-[11px] text-center text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Your contact details are protected by RitzYard. Communicate safely through this platform.
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <MessageSquare className="w-14 h-14 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button size="sm" variant="outline" onClick={() => fetchMessages()}>
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Start the conversation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Send a message to the supplier. Your inquiry has been received and matched with verified suppliers.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
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
                    <div
                      key={msg._id}
                      className={`flex mb-3 ${own ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] ${own ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {/* Sender label */}
                        <span className={`text-[10px] font-semibold px-1 ${own ? 'text-right text-primary' : 'text-left text-muted-foreground'}`}>
                          {getSenderLabel(msg)}
                        </span>

                        {/* Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            own
                              ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
                              : msg.senderRole === 'ritzyard'
                              ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-bl-sm'
                              : 'bg-white border border-border/30 text-foreground rounded-bl-sm'
                          }`}
                        >
                          {msg.message}
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground px-1">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background/80 backdrop-blur-xl px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-3 items-end">
          <Textarea
            placeholder="Type your message... (Enter to send, Shift+Enter for newline)"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 resize-none min-h-[44px] max-h-28 rounded-2xl border-2 border-border/50 focus:border-primary/50 bg-background text-sm py-2.5 px-4"
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="h-11 w-11 rounded-2xl p-0 bg-gradient-to-br from-primary to-secondary text-white flex-shrink-0 hover:shadow-lg transition-all disabled:opacity-50"
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
  );
};

export default BuyerChat;
