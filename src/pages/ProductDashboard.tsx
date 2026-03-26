import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Package, TrendingUp, LogOut, MessageSquare, CheckCircle, Settings, CreditCard, X, Search, BarChart3, PieChart, DollarSign, AlertCircle, Clock, ShoppingBag, Sparkles, TrendingDown, Activity, Zap, Target, Star } from 'lucide-react';
import { products as predefinedProducts } from '../data';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { Textarea } from '@/pages/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/pages/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/pages/components/ui/select';
import LanguageSwitcher from './components/LanguageSwitcher';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import ProductDetailModal from '@/components/ProductDetailModal';
import LogoutModal from '@/components/LogoutModal';
import { useToast } from '@/hooks/use-toast';
import { getFixedImageUrl, handleImageErrorWithFallback, handleImageErrorWithRetry } from '@/lib/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Category interface
interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  _id?: string;
  name: string;
  slug: string;
  isActive: boolean;
}

// Category options (will be loaded from API)
const INITIAL_CATEGORIES = [
  { value: 'mild-steel', label: 'Mild Steel', icon: '🔩' },
  { value: 'stainless-steel', label: 'Stainless Steel', icon: '⚙️' },
  { value: 'construction', label: 'Construction Materials', icon: '🏗️' },
  { value: 'electrical', label: 'Electrical Materials', icon: '⚡' },
];

interface Product {
  _id: string;
  name: string;
  category: string;
  description: string;
  price?: {
    amount?: number;
    currency?: string;
    unit?: string;
  };
  stock?: {
    available?: boolean;
    quantity?: number;
    minimumOrder?: number;
  };
  status: string;
  createdAt?: string;
  image?: string;
}

const SupplierProductDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    subcategory: '',
    customCategory: '',
    customSubcategory: '',
    description: '',
    imageFile: null as File | null,
    imagePreview: '',
    features: [] as string[],
    applications: [] as string[],
    specifications: {} as any,
  });

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [showCustomSubcategory, setShowCustomSubcategory] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState<typeof predefinedProducts>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showAutoReplyChatbox, setShowAutoReplyChatbox] = useState(false);
  const [autoReplyMessages, setAutoReplyMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [autoReplyInput, setAutoReplyInput] = useState('');
  const [autoReplyStep, setAutoReplyStep] = useState<'menu' | 'select-type' | 'write-response' | 'confirm' | 'ai-suggestion' | 'view-saved'>('menu');
  const [autoReplyConfig, setAutoReplyConfig] = useState({messageType: '', response: '', triggerKeywords: '', useAI: false});
  const [autoReplyLoading, setAutoReplyLoading] = useState(false);
  const [savedAutoReplies, setSavedAutoReplies] = useState<any[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Lead Scoring Chatbox
  const [showLeadScoringChatbox, setShowLeadScoringChatbox] = useState(false);
  const [leadScoringMessages, setLeadScoringMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [leadScoringInput, setLeadScoringInput] = useState('');
  
  // Order Automation Chatbox
  const [showOrderAutomationChatbox, setShowOrderAutomationChatbox] = useState(false);
  const [orderAutomationMessages, setOrderAutomationMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [orderAutomationInput, setOrderAutomationInput] = useState('');
  
  // Smart Inventory Chatbox
  const [showSmartInventoryChatbox, setShowSmartInventoryChatbox] = useState(false);
  const [smartInventoryMessages, setSmartInventoryMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [smartInventoryInput, setSmartInventoryInput] = useState('');
  
  // Price Optimizer Chatbox
  const [showPriceOptimizerChatbox, setShowPriceOptimizerChatbox] = useState(false);
  const [priceOptimizerMessages, setPriceOptimizerMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [priceOptimizerInput, setPriceOptimizerInput] = useState('');
  
  // Analytics Hub Chatbox
  const [showAnalyticsHubChatbox, setShowAnalyticsHubChatbox] = useState(false);
  const [analyticsHubMessages, setAnalyticsHubMessages] = useState<Array<{id: number, text: string, sender: 'user' | 'bot', timestamp: Date}>>([]);
  const [analyticsHubInput, setAnalyticsHubInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // ── LIVE LEADS ──
  const [liveLeads, setLiveLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const productInputRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem('supplierToken');
  const user = JSON.parse(localStorage.getItem('supplierUser') || '{}');
  
  // Check for 401 Unauthorized and clear invalid tokens
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Clear mock tokens that start with 'test-supplier-token-'
    if (token.startsWith('test-supplier-token-')) {
      console.warn('Invalid mock token detected, clearing...');
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplierUser');
      toast({
        title: 'Session Expired',
        description: 'Please login again with valid credentials',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [token, navigate]);

const getRecommendedProducts = () => {
    // Get the selected product
    const selectedProduct = predefinedProducts.find(p => p.name === productForm.name);
    
    if (!selectedProduct) {
      // Return random featured products from all categories for dynamic feel
      const shuffled = [...predefinedProducts].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 4);
    }
    
    // Get products from different categories (not just same category) for variety
    const otherCategories = predefinedProducts.filter(p => p.category !== selectedProduct.category);
    const sameCategory = predefinedProducts.filter(p => p.category === selectedProduct.category && p.name !== selectedProduct.name);
    
    // Mix products from same category and other categories for dynamic recommendations
    const mixed = [
      ...sameCategory.slice(0, 2),
      ...otherCategories.sort(() => Math.random() - 0.5).slice(0, 2)
    ];
    
    // Shuffle and return up to 4 products
    return mixed.sort(() => Math.random() - 0.5).slice(0, 4);
  };

  // Handle redirecting to add product with auto-filled data including features
  const handleAddProductWithAutofill = (product: typeof predefinedProducts[0]) => {
    navigate('/products/add', {
      state: {
        selectedProduct: {
          id: product.id,
          name: product.name,
          category: product.category,
          description: product.description,
          image: product.image,
          features: product.features || [],
          applications: product.applications || [],
          specifications: product.specifications || {}
        }
      }
    });
  };

  // Fetch live leads (buyer inquiries) for this supplier
  const fetchLiveLeads = async () => {
    if (!token) return;
    try {
      setLeadsLoading(true);
      const res = await fetch(`${API_URL}/supplier/inquiries`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setLiveLeads((data.inquiries || []).slice(0, 6));
    } catch (e) {
      console.warn('Leads fetch failed', e);
    } finally {
      setLeadsLoading(false);
    }
  };

  // Score a lead: Hot / Warm / Cold
  const scoreLead = (inq: any): { label: string; color: string; bg: string; dot: string } => {
    const budget = parseFloat(String(inq.budget || '').replace(/[^0-9.]/g, '')) || 0;
    const qty    = parseFloat(String(inq.quantity || '').replace(/[^0-9.]/g, '')) || 0;
    const isNew  = inq.status === 'new' || !inq.status;
    if (budget > 50000 || qty > 500 || isNew)
      return { label: '🔥 Hot',  color: '#b91c1c', bg: '#fef2f2', dot: '#ef4444' };
    if (budget > 10000 || qty > 100)
      return { label: '🌡️ Warm', color: '#92400e', bg: '#fffbeb', dot: '#f59e0b' };
    return   { label: '❄️ Cold', color: '#1e3a5f', bg: '#eff6ff', dot: '#3b82f6' };
  };

  // Handle tool click and send to API
  const handleToolClick = async (toolName: string, toolType: string, description: string) => {
    try {
      // Send to backend
      const response = await fetch(`${API_URL}/automation/tools/record-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          toolName,
          toolType,
          description
        })
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: toolName,
          description: description,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error recording tool click:', error);
      toast({
        title: toolName,
        description: description,
        duration: 3000
      });
    }
  };

  // Handle Auto Reply Manager chatbox with configuration steps
  const handleAutoReplyOpen = () => {
    setShowAutoReplyChatbox(true);
    setAutoReplyStep('menu');
    setAutoReplyMessages([{
      id: 1,
      text: 'Hello! 👋 I\'m your Auto Reply Manager. I can help you set up automatic responses to customer inquiries. What would you like to do?',
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const handleAutoReplyClose = () => {
    setShowAutoReplyChatbox(false);
  };

  const addBotMessage = (text: string) => {
    setAutoReplyMessages(prev => [...prev, {
      id: prev.length + 1,
      text,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const handleAutoReplyAction = (action: string) => {
    const userMessage = {
      id: autoReplyMessages.length + 1,
      text: action,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setAutoReplyMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      if (action === 'Create Auto-Reply') {
        setAutoReplyStep('select-type');
        addBotMessage('Great! What type of inquiry would you like to respond to? Choose one:\n\n1️⃣ General Inquiry\n2️⃣ Price Quote Request\n3️⃣ Product Availability\n4️⃣ Custom Message');
      } else if (action === 'View Saved Replies') {
        fetchAndShowSavedReplies();
      }
    }, 300);
  };

  // Handle 401 Unauthorized responses
  const handleApiError = (error: any, context: string) => {
    const errorMessage = error?.message || '';
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      console.warn(`❌ 401 Unauthorized in ${context} - Session expired`);
      localStorage.removeItem('supplierToken');
      localStorage.removeItem('supplierUser');
      toast({
        title: 'Session Expired',
        description: 'Your session has expired. Please login again.',
        variant: 'destructive',
      });
      navigate('/login');
      return true;
    }
    return false;
  };

  const fetchAndShowSavedReplies = async () => {
    try {
      const response = await fetch(`${API_URL}/automation/auto-replies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.status === 401) {
        handleApiError({ message: 'Unauthorized' }, 'fetchAndShowSavedReplies');
        return;
      }
      
      if (data.success && data.data && data.data.length > 0) {
        setSavedAutoReplies(data.data);
        setAutoReplyStep('view-saved');
        
        let message = '📋 Your Saved Auto-Replies:\n\n';
        data.data.forEach((reply: any, idx: number) => {
          const emoji = reply.isActive ? '✅' : '❌';
          const typeDisplay = reply.messageType.replace('-', ' ').toUpperCase();
          message += `${idx + 1}. ${emoji} ${typeDisplay}\n   "${reply.responseText.substring(0, 50)}..."\n\n`;
        });
        message += 'Reply "Create New" to add another, or "Back" to go to menu.';
        addBotMessage(message);
      } else {
        addBotMessage('📭 You don\'t have any saved auto-replies yet. Let\'s create your first one! 🚀');
        setTimeout(() => {
          setAutoReplyStep('select-type');
          addBotMessage('What type of inquiry would you like to respond to?\n\n1️⃣ General Inquiry\n2️⃣ Price Quote Request\n3️⃣ Product Availability\n4️⃣ Custom Message');
        }, 600);
      }
    } catch (error: any) {
      console.error('Error fetching saved replies:', error);
      if (handleApiError(error, 'fetchAndShowSavedReplies')) return;
      addBotMessage('❌ Error loading saved replies. Please try again.');
    }
  };

  const handleMessageTypeSelect = (type: string) => {
    const typeMap: Record<string, string> = {
      '1': 'General Inquiry',
      '2': 'Price Quote Request',
      '3': 'Product Availability',
      '4': 'Custom Message'
    };
    const selectedType = typeMap[type] || type;

    const userMessage = {
      id: autoReplyMessages.length + 1,
      text: `I want to set up: ${selectedType}`,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setAutoReplyMessages(prev => [...prev, userMessage]);
    setAutoReplyConfig({...autoReplyConfig, messageType: selectedType});

    setTimeout(() => {
      setAutoReplyStep('ai-suggestion');
      addBotMessage(`Great choice! 🤖 Would you like me to generate an AI-powered response for ${selectedType}, or would you prefer to write it yourself?\n\n1️⃣ Generate with AI\n2️⃣ Write manually`);
    }, 300);
  };

  const generateAIResponse = async (messageType: string) => {
    setAutoReplyLoading(true);
    try {
      const prompts: Record<string, string> = {
        'General Inquiry': 'Generate a professional, friendly auto-reply for a general product inquiry. Keep it concise (50-100 words) and include gratitude and next steps.',
        'Price Quote Request': 'Generate a professional auto-reply for a price quote request. Include thanks, mention custom quote availability, and timeline. Keep it 50-100 words.',
        'Product Availability': 'Generate a professional auto-reply for product availability inquiries. Mention current availability, alternatives if needed, and contact info. Keep it 50-100 words.',
        'Custom Message': 'Generate a professional and friendly auto-reply for customer messages. Be warm and helpful. Keep it 50-100 words.'
      };

      const response = await fetch(`${API_URL}/ai/generate-auto-reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messageType,
          prompt: prompts[messageType] || prompts['Custom Message']
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const userMessage = {
          id: autoReplyMessages.length + 1,
          text: `Generate with AI`,
          sender: 'user' as const,
          timestamp: new Date()
        };
        setAutoReplyMessages(prev => [...prev, userMessage]);
        setAutoReplyConfig({...autoReplyConfig, response: data.reply, useAI: true});
        
        setTimeout(() => {
          setAutoReplyStep('confirm');
          addBotMessage(`✨ AI-Generated Response:

"${data.reply}"

Does this look good? Reply YES to save or NO to edit.`);
        }, 300);
      } else {
        addBotMessage('❌ Failed to generate AI response. Please write manually instead.');
        setAutoReplyStep('write-response');
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      addBotMessage('❌ Error generating response. Please write it manually.');
      setAutoReplyStep('write-response');
    } finally {
      setAutoReplyLoading(false);
    }
  };

  const handleAISuggestionChoice = (choice: string) => {
    if (choice === '1') {
      const userMsg = {
        id: autoReplyMessages.length + 1,
        text: 'Generate with AI',
        sender: 'user' as const,
        timestamp: new Date()
      };
      setAutoReplyMessages(prev => [...prev, userMsg]);
      addBotMessage('⏳ Generating AI response for you...');
      generateAIResponse(autoReplyConfig.messageType);
    } else {
      const userMsg = {
        id: autoReplyMessages.length + 1,
        text: 'Write manually',
        sender: 'user' as const,
        timestamp: new Date()
      };
      setAutoReplyMessages(prev => [...prev, userMsg]);
      setAutoReplyStep('write-response');
      setTimeout(() => {
        addBotMessage(`Perfect! What should the automatic response be for ${autoReplyConfig.messageType}? Please type your message.`);
      }, 300);
    }
  };

  const handleResponseText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoReplyInput.trim()) return;

    const userMessage = {
      id: autoReplyMessages.length + 1,
      text: autoReplyInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setAutoReplyMessages(prev => [...prev, userMessage]);
    setAutoReplyConfig({...autoReplyConfig, response: autoReplyInput});
    setAutoReplyInput('');

    setTimeout(() => {
      setAutoReplyStep('confirm');
      addBotMessage(`Great! Here's your auto-reply:\n\n"${autoReplyInput}"\n\nDoes this look good? Reply YES to save or NO to edit.`);
    }, 300);
  };

  const handleConfirmReply = (action: string) => {
    const userMessage = {
      id: autoReplyMessages.length + 1,
      text: action,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setAutoReplyMessages(prev => [...prev, userMessage]);

    if (action.toUpperCase() === 'YES') {
      // Save to backend
      const messageTypeMap: Record<string, string> = {
        'General Inquiry': 'general-inquiry',
        'Price Quote Request': 'price-quote',
        'Product Availability': 'product-availability',
        'Custom Message': 'custom'
      };

      const saveAutoReply = async () => {
        try {
          const response = await fetch(`${API_URL}/automation/auto-replies`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              messageType: messageTypeMap[autoReplyConfig.messageType] || 'custom',
              responseText: autoReplyConfig.response,
              triggerKeywords: []
            })
          });

          const data = await response.json();
          console.log('Auto-reply response:', { status: response.status, data });
          if (data.success) {
            setTimeout(() => {
              addBotMessage('✅ Auto-reply saved successfully! Your response will now be sent automatically when customers inquire about ' + autoReplyConfig.messageType + '.');
              setTimeout(() => {
                addBotMessage('Would you like to set up another auto-reply? Reply YES or NO.');
                setAutoReplyStep('menu');
              }, 600);
            }, 300);
          } else {
            console.error('Auto-reply save failed:', data);
            addBotMessage(`❌ Failed to save auto-reply: ${data.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error('Error saving auto-reply:', error);
          addBotMessage('❌ Error saving auto-reply. Please try again.');
        }
      };

      saveAutoReply();
    } else {
      setTimeout(() => {
        addBotMessage('No problem! Let\'s try again. What should the response be?');
        setAutoReplyStep('write-response');
      }, 300);
    }
  };

  const handleAutoReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (autoReplyStep === 'menu') {
      handleAutoReplyAction(autoReplyInput);
    } else if (autoReplyStep === 'select-type') {
      handleMessageTypeSelect(autoReplyInput);
    } else if (autoReplyStep === 'ai-suggestion') {
      handleAISuggestionChoice(autoReplyInput);
    } else if (autoReplyStep === 'write-response') {
      handleResponseText(e);
      return;
    } else if (autoReplyStep === 'confirm') {
      handleConfirmReply(autoReplyInput);
    } else if (autoReplyStep === 'view-saved') {
      if (autoReplyInput.toLowerCase() === 'create new') {
        setAutoReplyStep('select-type');
        addBotMessage('What type would you like to create?\n\n1️⃣ General Inquiry\n2️⃣ Price Quote Request\n3️⃣ Product Availability\n4️⃣ Custom Message');
      } else if (autoReplyInput.toLowerCase() === 'back') {
        setAutoReplyStep('menu');
        addBotMessage('Hello! 👋 What would you like to do?');
      }
    }

    setAutoReplyInput('');
  };

  // Lead Scoring Handlers
  const handleLeadScoringOpen = () => {
    setShowLeadScoringChatbox(true);
    setLeadScoringMessages([{
      id: 1,
      text: '🎯 Lead Scoring Assistant ready! This tool analyzes your inquiries and scores them by value potential.\n\nFeatures:\n• AI-powered lead evaluation\n• Priority ranking (Hot → Warm → Cold)\n• Custom scoring criteria\n• Auto-tagging high-value leads',
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const handleLeadScoringClose = () => {
    setShowLeadScoringChatbox(false);
  };

  // Order Automation Handlers
  const handleOrderAutomationOpen = async () => {
    setShowOrderAutomationChatbox(true);

    setOrderAutomationMessages([{
      id: 1,
      text: '📦 Order Automation loading...',
      sender: 'bot',
      timestamp: new Date()
    }]);

    try {
      const ordersRes = await fetch(`${API_URL}/automation/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();

      let openingText = '';
      if (ordersData.success && ordersData.orders && ordersData.orders.length > 0) {
        const orders = ordersData.orders;
        const pending = orders.filter((o: any) => o.status === 'pending').length;
        const processing = orders.filter((o: any) => o.status === 'processing').length;
        const shipped = orders.filter((o: any) => o.status === 'shipped' || o.status === 'delivered').length;
        const total = orders.length;

        openingText = `📦 Order Automation — Live Orders\n\n📊 Order Overview:\n• Total Orders: ${total}\n• Pending: ${pending}\n• Processing: ${processing}\n• Shipped/Delivered: ${shipped}\n\n🤖 Automation Capabilities:\n• Instant order confirmations\n• Automatic invoice generation\n• Shipment tracking updates\n• Payment reminders\n\n💡 Ask me:\n• "Order status" — detailed breakdown\n• "Setup automation" — configure workflows\n• "Pending orders" — what needs action`;
      } else {
        openingText = `📦 Order Automation System Ready\n\n📊 No orders yet.\n\nStart selling to see order automation in action!\n\n🤖 Automation Features:\n• Instant confirmation emails\n• Auto invoice generation\n• Shipment tracking\n• Payment reminders\n\n💡 Ask me:\n• "Setup automation"\n• "How does it work?"`;
      }

      setOrderAutomationMessages([{
        id: 1,
        text: openingText,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch {
      setOrderAutomationMessages([{
        id: 1,
        text: `📦 Order Automation System initialized!\n\n🤖 Capabilities:\n• Instant order confirmation emails\n• Automatic invoice generation\n• Shipment tracking updates\n• Payment reminders\n• Reduces processing time by 60%\n\n💡 Ask me about order status or automation setup.`,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleOrderAutomationClose = () => {
    setShowOrderAutomationChatbox(false);
  };

  // Smart Inventory Handlers
  const handleSmartInventoryOpen = async () => {
    setShowSmartInventoryChatbox(true);

    // Build opening message from real products state
    const totalProducts = products.length;
    const active = products.filter(p => p.status === 'active').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const rejected = products.filter(p => p.status === 'rejected').length;
    const uniqueCategories = [...new Set(products.map(p => p.category))];

    let openingText = '';

    if (totalProducts === 0) {
      openingText = '📊 Smart Inventory Tracker activated!\n\nYou have no products listed yet.\n\nStart by adding products and your inventory stats will appear here in real-time.\n\n💡 Ask me:\n• "Stock overview"\n• "Inventory alerts"\n• "Forecast demand"';
    } else {
      openingText = `📊 Smart Inventory — Live Snapshot\n\n📦 Total Products: ${totalProducts}\n✅ Active: ${active}\n⏳ Pending Review: ${pending}${rejected > 0 ? `\n❌ Rejected: ${rejected}` : ''}\n\n🗂️ Categories: ${uniqueCategories.join(', ')}\n\n💡 Ask me:\n• "Stock overview" — see full inventory\n• "Low stock alerts" — find items needing attention\n• "Demand forecast" — plan ahead`;
    }

    setSmartInventoryMessages([{
      id: 1,
      text: openingText,
      sender: 'bot',
      timestamp: new Date()
    }]);

    // Fetch low-stock alerts in background to enrich context
    try {
      const alertsRes = await fetch(`${API_URL}/inventory/alerts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const alertsData = await alertsRes.json();
      if (alertsData.success && alertsData.data && alertsData.data.length > 0) {
        const alertMsg = `\n⚠️ Low Stock Alert: ${alertsData.data.length} item(s) need attention. Ask me "low stock alerts" for details.`;
        setSmartInventoryMessages(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], text: updated[0].text + alertMsg };
          return updated;
        });
      }
    } catch {
      // silent — opening message is already shown
    }
  };

  const handleSmartInventoryClose = () => {
    setShowSmartInventoryChatbox(false);
  };

  // Price Optimizer Handlers
  const handlePriceOptimizerOpen = () => {
    setShowPriceOptimizerChatbox(true);

    const activeProducts = products.filter(p => p.status === 'active');
    const totalProducts = products.length;

    let openingText = '';
    if (totalProducts === 0) {
      openingText = '💰 Price Optimizer activated!\n\nNo products found yet. Add products to start getting pricing recommendations.\n\n💡 Ask me:\n• "Price recommendations"\n• "Market analysis"\n• "Revenue boost tips"';
    } else {
      const productList = activeProducts.slice(0, 4).map(p => `• ${p.name} (${p.category})`).join('\n');
      openingText = `💰 Price Optimizer — ${totalProducts} Products Found\n\nActive Products:\n${productList}${activeProducts.length > 4 ? `\n• ...and ${activeProducts.length - 4} more` : ''}\n\n📈 Dynamic Pricing Engine Ready!\n\n💡 Ask me:\n• "Price recommendations" — optimize your pricing\n• "Market analysis" — competitor insights\n• "Revenue forecast" — growth opportunities`;
    }

    setPriceOptimizerMessages([{
      id: 1,
      text: openingText,
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  const handlePriceOptimizerClose = () => {
    setShowPriceOptimizerChatbox(false);
  };

  // Analytics Hub Handlers
  const handleAnalyticsHubOpen = async () => {
    setShowAnalyticsHubChatbox(true);

    // Show loading message first
    setAnalyticsHubMessages([{
      id: 1,
      text: '📈 Analytics Hub loading your live data...',
      sender: 'bot',
      timestamp: new Date()
    }]);

    try {
      const [statsRes, perfRes] = await Promise.all([
        fetch(`${API_URL}/automation/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/automation/analytics/performance`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const statsData = await statsRes.json();
      const perfData = await perfRes.json();

      const totalProducts = products.length;
      const activeProducts = products.filter(p => p.status === 'active').length;

      let openingText = `📈 Analytics Hub — Live Dashboard\n\n`;

      if (statsData.success && statsData.data) {
        const s = statsData.data;
        openingText += `📊 Automation Stats:\n• Total Leads: ${s.totalLeads || 0}\n• Auto-Replies: ${s.totalAutoReplies || 0}\n• Orders: ${s.totalOrders || 0}\n\n`;
      }

      if (perfData.success && perfData.data) {
        const p = perfData.data;
        openingText += `💰 Performance:\n• Revenue: ₹${(p.totalRevenue || 0).toLocaleString()}\n• Orders This Period: ${p.totalOrders || 0}\n• Avg Order: ₹${(p.avgOrderValue || 0).toLocaleString()}\n\n`;
      }

      openingText += `📦 Your Products:\n• Total Listed: ${totalProducts}\n• Active: ${activeProducts}\n• Categories: ${[...new Set(products.map(p => p.category))].length}\n\n💡 Ask me:\n• "Sales report" — revenue trends\n• "Key insights" — business analysis\n• "Performance" — detailed metrics`;

      setAnalyticsHubMessages([{
        id: 1,
        text: openingText,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch {
      // Fallback with product data only
      const openingText = `📈 Analytics Hub Dashboard\n\n📦 Your Products:\n• Total: ${products.length}\n• Active: ${products.filter(p => p.status === 'active').length}\n• Pending: ${products.filter(p => p.status === 'pending').length}\n\n💡 Ask me:\n• "Sales report"\n• "Key insights"\n• "Performance metrics"`;
      setAnalyticsHubMessages([{
        id: 1,
        text: openingText,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const handleAnalyticsHubClose = () => {
    setShowAnalyticsHubChatbox(false);
  };

  // Lead Scoring Submit Handler
  const handleLeadScoringSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadScoringInput.trim()) return;

    const userMessage = {
      id: leadScoringMessages.length + 1,
      text: leadScoringInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setLeadScoringMessages(prev => [...prev, userMessage]);
    setLeadScoringInput('');

    try {
      const input = leadScoringInput.toLowerCase();
      let response = '';

      if (input.includes('score') || input.includes('analyze')) {
        // Fetch real leads from backend
        const leadsResponse = await fetch(`${API_URL}/automation/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const leadsData = await leadsResponse.json();
        
        if (leadsData.success && leadsData.leads) {
          const hotLeads = leadsData.leads.filter((l: any) => l.score >= 80).length;
          const warmLeads = leadsData.leads.filter((l: any) => l.score >= 60 && l.score < 80).length;
          const coldLeads = leadsData.leads.filter((l: any) => l.score < 60).length;
          const avgScore = Math.round(leadsData.leads.reduce((sum: number, l: any) => sum + (l.score || 0), 0) / leadsData.leads.length);
          const topLead = leadsData.leads.sort((a: any, b: any) => (b.score || 0) - (a.score || 0))[0];
          
          response = `🎯 Analyzing your leads...

📊 Lead Score Analysis:
• Hot Leads: ${hotLeads} (80+ score)
• Warm Leads: ${warmLeads} (60-79 score)
• Cold Leads: ${coldLeads} (<60 score)
• Average Score: ${avgScore}

🏆 Top Priority: ${topLead?.company || 'Unknown'} (Score: ${topLead?.score || 0})
📧 Contact: ${topLead?.email || 'N/A'}
💼 Potential: ₹${topLead?.potential || 0}`;
        } else {
          response = '📊 No leads found yet. Start collecting inquiries to see scoring analysis!';
        }
      } else if (input.includes('criteria') || input.includes('weight')) {
        response = '⚙️ Your Scoring Criteria:\n• Budget Size: 30%\n• Company Size: 25%\n• Industry Match: 20%\n• Engagement Level: 15%\n• Product Interest: 10%\n\n💡 Tip: Leads are automatically scored. Higher scores = Better conversion potential!';
      } else if (input.includes('hot') || input.includes('best')) {
        const leadsResponse = await fetch(`${API_URL}/automation/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const leadsData = await leadsResponse.json();
        
        if (leadsData.success && leadsData.leads) {
          const hotLeads = leadsData.leads
            .filter((l: any) => l.score >= 80)
            .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
            .slice(0, 3);
          
          if (hotLeads.length > 0) {
            response = '🔥 Your Hottest Leads:\n\n';
            hotLeads.forEach((lead: any, idx: number) => {
              response += `${idx + 1}. ${lead.company} - Score: ${lead.score}
   📧 ${lead.email}
   💰 ${lead.potential}

`;
            });
            response += '👉 These are your priority contacts!';
          } else {
            response = '❄️ No hot leads yet. Keep nurturing your inquiries!';
          }
        }
      } else {
        response = '✅ I can help you with:\n• Score and analyze your leads\n• Show your hottest prospects\n• Explain scoring criteria\n• Identify high-value leads\n\n📝 Try asking: "Score my leads" or "Show hot leads"';
      }

      const botMessage = {
        id: userMessage.id + 1,
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setLeadScoringMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      const botMessage = {
        id: userMessage.id + 1,
        text: '❌ Error analyzing leads. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setLeadScoringMessages(prev => [...prev, botMessage]);
    }
  };

  // Order Automation Submit Handler
  const handleOrderAutomationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderAutomationInput.trim()) return;

    const userMessage = {
      id: orderAutomationMessages.length + 1,
      text: orderAutomationInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setOrderAutomationMessages(prev => [...prev, userMessage]);
    const inputText = orderAutomationInput;
    setOrderAutomationInput('');

    try {
      const input = inputText.toLowerCase();
      let response = '';

      if (input.includes('status') || input.includes('pending') || input.includes('order')) {
        // Fetch real orders from backend
        const ordersRes = await fetch(`${API_URL}/automation/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ordersData = await ordersRes.json();

        if (ordersData.success && ordersData.orders && ordersData.orders.length > 0) {
          const orders = ordersData.orders;
          const pending = orders.filter((o: any) => o.status === 'pending').length;
          const processing = orders.filter((o: any) => o.status === 'processing').length;
          const readyToShip = orders.filter((o: any) => o.status === 'ready-to-ship' || o.status === 'ready').length;
          const shipped = orders.filter((o: any) => o.status === 'shipped').length;
          const delivered = orders.filter((o: any) => o.status === 'delivered').length;
          const cancelled = orders.filter((o: any) => o.status === 'cancelled').length;

          // Show recent orders
          const recentOrders = orders.slice(0, 3);
          let recentDetails = '';
          recentOrders.forEach((o: any, idx: number) => {
            recentDetails += `\n${idx + 1}. Order #${o.orderNumber || o._id?.slice(-6) || idx + 1} — ${o.status?.toUpperCase()}\n   ₹${(o.totalAmount || o.amount || 0).toLocaleString()} • ${new Date(o.createdAt || Date.now()).toLocaleDateString()}`;
          });

          response = `📦 Order Status — Live Data\n\n📊 Breakdown:\n• Pending: ${pending}\n• Processing: ${processing}${readyToShip > 0 ? `\n• Ready to Ship: ${readyToShip}` : ''}\n• Shipped: ${shipped}\n• Delivered: ${delivered}${cancelled > 0 ? `\n• Cancelled: ${cancelled}` : ''}\n• Total: ${orders.length}\n\n📋 Recent Orders:${recentDetails}\n\n⏱️ ${pending > 0 ? `${pending} order(s) need your attention!` : 'All orders on track!'}`;
        } else {
          response = `📦 No orders found yet.\n\nYour order management will appear here once you start receiving orders.\n\n💡 Tips to get orders:\n• Keep products active and updated\n• Respond to inquiries promptly\n• Set up Auto-Reply for faster responses`;
        }

      } else if (input.includes('setup') || input.includes('configure') || input.includes('automation')) {
        response = `⚙️ Order Automation Setup\n\n✅ Active Automations:\n• Email Confirmations — Auto-sent on new orders\n• Invoice Generation — Created automatically\n• Shipment Tracking — Updates sent to buyers\n• Payment Reminders — Sent after 3 days\n\n📦 Your Products: ${products.length} listed (${products.filter(p => p.status === 'active').length} active)\n\n💡 All systems are configured and ready to automate your order workflow!`;

      } else if (input.includes('how') || input.includes('work') || input.includes('help')) {
        response = `🤖 How Order Automation Works\n\n1️⃣ Buyer places an order\n2️⃣ Confirmation email sent automatically\n3️⃣ Invoice generated in seconds\n4️⃣ You prepare & ship the order\n5️⃣ Tracking updates sent to buyer\n6️⃣ Payment reminder if overdue\n\n⏱️ Time saved: Up to 60% per order\n📦 Your active products: ${products.filter(p => p.status === 'active').length}`;

      } else {
        response = `📦 Order Automation\n\n📊 Products Ready to Sell: ${products.filter(p => p.status === 'active').length}\n\nAsk me:\n• "Order status" — current order breakdown\n• "Setup automation" — configure workflows\n• "How does it work?" — automation guide\n• "Pending orders" — items needing action`;
      }

      const botMessage = {
        id: userMessage.id + 1,
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setOrderAutomationMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Order Automation error:', error);
      const botMessage = {
        id: userMessage.id + 1,
        text: '❌ Error fetching order data. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setOrderAutomationMessages(prev => [...prev, botMessage]);
    }
  };

  // Smart Inventory Submit Handler
  const handleSmartInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInventoryInput.trim()) return;

    const userMessage = {
      id: smartInventoryMessages.length + 1,
      text: smartInventoryInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setSmartInventoryMessages(prev => [...prev, userMessage]);
    const inputText = smartInventoryInput;
    setSmartInventoryInput('');

    try {
      const input = inputText.toLowerCase();
      let response = '';

      if (input.includes('stock') || input.includes('overview') || input.includes('inventory')) {
        // Use real products state for live snapshot
        const totalProducts = products.length;
        const active = products.filter(p => p.status === 'active').length;
        const pending = products.filter(p => p.status === 'pending').length;
        const rejected = products.filter(p => p.status === 'rejected').length;
        const uniqueCategories = [...new Set(products.map(p => p.category))];

        if (totalProducts === 0) {
          response = '📦 No products in your inventory yet.\n\nAdd your first product to start tracking stock levels!';
        } else {
          // Also fetch inventory API for quantity data
          let inventoryDetails = '';
          try {
            const invRes = await fetch(`${API_URL}/inventory`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const invData = await invRes.json();
            if (invData.success && invData.data && invData.data.length > 0) {
              const totalQty = invData.data.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
              const lowStock = invData.data.filter((item: any) => (item.quantity || 0) <= (item.reorderPoint || 10)).length;
              inventoryDetails = `\n\n📊 Stock Quantities:\n• Total Units in Stock: ${totalQty}\n• Items with Low Stock: ${lowStock}`;
            }
          } catch { /* use product data only */ }

          response = `📦 Your Inventory Overview\n\n✅ Active Products: ${active}\n⏳ Pending Review: ${pending}${rejected > 0 ? `\n❌ Rejected: ${rejected}` : ''}\n📋 Total Listed: ${totalProducts}\n\n🗂️ Categories (${uniqueCategories.length}): ${uniqueCategories.join(', ')}${inventoryDetails}`;
        }

      } else if (input.includes('alert') || input.includes('low') || input.includes('reorder')) {
        // Fetch real low-stock alerts
        const alertsRes = await fetch(`${API_URL}/inventory/alerts`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const alertsData = await alertsRes.json();

        if (alertsData.success && alertsData.data && alertsData.data.length > 0) {
          response = `⚠️ Low Stock Alerts (${alertsData.data.length} items)\n\n`;
          alertsData.data.slice(0, 6).forEach((item: any, idx: number) => {
            const urgency = (item.quantity || 0) <= 2 ? '🔴 URGENT' : (item.quantity || 0) <= 5 ? '🟡 Low' : '🟢 Watch';
            response += `${idx + 1}. ${item.productName || item.name || 'Item'}\n   Qty: ${item.quantity || 0} units — ${urgency}\n\n`;
          });
          response += '💡 Reorder soon to avoid stockouts!';
        } else {
          // Fallback: check products with pending/rejected status
          const needAttention = products.filter(p => p.status !== 'active');
          if (needAttention.length > 0) {
            response = `🔔 ${needAttention.length} product(s) are not yet active:\n\n`;
            needAttention.slice(0, 5).forEach((p, idx) => {
              response += `${idx + 1}. ${p.name} — Status: ${p.status}\n`;
            });
            response += '\nActivate products to improve availability!';
          } else {
            response = '✅ All Clear! No low stock alerts at the moment.\n\nAll your active products are in good standing.';
          }
        }

      } else if (input.includes('forecast') || input.includes('predict') || input.includes('demand')) {
        // Fetch inventory analytics for real forecast data
        const analyticsRes = await fetch(`${API_URL}/inventory/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const analyticsData = await analyticsRes.json();

        if (analyticsData.success && analyticsData.data) {
          const d = analyticsData.data;
          response = `🔮 Demand Forecast & Analytics\n\n📈 Total Items Tracked: ${d.totalItems || products.length}\n💰 Total Inventory Value: ₹${(d.totalValue || 0).toLocaleString()}\n⚠️ Low Stock Items: ${d.lowStockCount || 0}\n📦 Out of Stock: ${d.outOfStockCount || 0}\n\n📊 Your Active Products: ${products.filter(p => p.status === 'active').length}\n🗂️ Categories: ${[...new Set(products.map(p => p.category))].length}\n\n💡 Focus on restocking low-stock items to meet demand!`;
        } else {
          const activeCount = products.filter(p => p.status === 'active').length;
          response = `🔮 Demand Forecast (Based on Your Listings)\n\n📦 Active Products Ready to Sell: ${activeCount}\n⏳ Pending Approval: ${products.filter(p => p.status === 'pending').length}\n\n📈 To improve forecast accuracy:\n• Add stock quantities via the Inventory API\n• Keep products active and updated\n• Monitor inquiry trends\n\n💡 Your ${activeCount} active products are visible to buyers!`;
        }

      } else {
        response = `📦 Smart Inventory — Your Data\n\nYou have ${products.length} product(s) listed.\n✅ Active: ${products.filter(p => p.status === 'active').length}\n⏳ Pending: ${products.filter(p => p.status === 'pending').length}\n\nAsk me:\n• "Stock overview" — full inventory status\n• "Low stock alerts" — items needing attention\n• "Demand forecast" — planning insights`;
      }

      const botMessage = {
        id: userMessage.id + 1,
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setSmartInventoryMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Smart Inventory error:', error);
      const botMessage = {
        id: userMessage.id + 1,
        text: '❌ Error fetching inventory data. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setSmartInventoryMessages(prev => [...prev, botMessage]);
    }
  };

  // Price Optimizer Submit Handler
  const handlePriceOptimizerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceOptimizerInput.trim()) return;

    const userMessage = {
      id: priceOptimizerMessages.length + 1,
      text: priceOptimizerInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setPriceOptimizerMessages(prev => [...prev, userMessage]);
    const inputText = priceOptimizerInput;
    setPriceOptimizerInput('');

    try {
      const input = inputText.toLowerCase();
      let response = '';

      if (input.includes('recommend') || input.includes('suggest') || input.includes('price')) {
        const activeProducts = products.filter(p => p.status === 'active');

        if (activeProducts.length === 0) {
          response = '💰 No active products found.\n\nAdd and get approval for products to receive pricing recommendations!';
        } else {
          // Show real product names with pricing suggestions
          response = `💰 Price Recommendations for Your Products\n\n`;
          activeProducts.slice(0, 5).forEach((p, idx) => {
            const currentPrice = p.price?.amount;
            if (currentPrice && currentPrice > 0) {
              const suggestedIncrease = Math.round(currentPrice * 1.05);
              const currency = p.price?.currency || '₹';
              const unit = p.price?.unit || 'unit';
              response += `${idx + 1}. ${p.name}\n   Current: ${currency}${currentPrice.toLocaleString()}/${unit}\n   Suggested: ${currency}${suggestedIncrease.toLocaleString()}/${unit} (+5%)\n\n`;
            } else {
              response += `${idx + 1}. ${p.name} (${p.category})\n   💡 Add pricing to unlock recommendations\n\n`;
            }
          });
          if (activeProducts.length > 5) {
            response += `...and ${activeProducts.length - 5} more products.\n\n`;
          }
          response += '📈 Tip: Products with pricing data get better optimization insights!';
        }

      } else if (input.includes('market') || input.includes('competitor') || input.includes('analysis')) {
        // Fetch automation stats for market context
        const statsRes = await fetch(`${API_URL}/automation/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        const activeCount = products.filter(p => p.status === 'active').length;
        const categories = [...new Set(products.map(p => p.category))];

        if (statsData.success && statsData.data) {
          const d = statsData.data;
          response = `🔍 Market Analysis\n\n📦 Your Active Listings: ${activeCount}\n🗂️ Categories Covered: ${categories.join(', ')}\n📩 Total Inquiries: ${d.totalLeads || 0}\n✉️ Auto-Replies Sent: ${d.totalAutoReplies || 0}\n📋 Orders Processed: ${d.totalOrders || 0}\n\n💡 Insights:\n• More categories = wider market reach\n• ${activeCount > 5 ? 'Good product variety!' : 'Add more products to increase visibility'}\n• Respond fast to beat competitors`;
        } else {
          response = `🔍 Market Analysis\n\n📦 Your Active Products: ${activeCount}\n🗂️ Categories: ${categories.join(', ')}\n\n💡 Strategy Tips:\n• Keep prices competitive in ${categories[0] || 'your category'}\n• Respond to inquiries within 2 hours\n• Add detailed product specs to win more deals\n• Offer bulk pricing for better conversions`;
        }

      } else if (input.includes('revenue') || input.includes('forecast') || input.includes('growth')) {
        const activeCount = products.filter(p => p.status === 'active').length;
        const pendingCount = products.filter(p => p.status === 'pending').length;

        // Try to get performance analytics
        const perfRes = await fetch(`${API_URL}/automation/analytics/performance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const perfData = await perfRes.json();

        if (perfData.success && perfData.data) {
          const d = perfData.data;
          response = `📈 Revenue Forecast\n\n🎯 Current Performance:\n• Orders This Period: ${d.totalOrders || 0}\n• Revenue Generated: ₹${(d.totalRevenue || 0).toLocaleString()}\n• Avg Order Value: ₹${(d.avgOrderValue || 0).toLocaleString()}\n\n📦 Listing Health:\n• Active: ${activeCount} products\n• Pending: ${pendingCount} products\n\n💡 To increase revenue:\n• Approve pending products → +${pendingCount * 10}% potential reach\n• Add pricing to all products\n• Respond to all inquiries promptly`;
        } else {
          response = `📈 Revenue Growth Opportunities\n\n📦 Active Products: ${activeCount}\n⏳ Pending (Unlock These!): ${pendingCount}\n\n🎯 Growth Actions:\n1. Get ${pendingCount} pending products approved\n2. Add detailed pricing to all listings\n3. Use Auto-Reply for faster response rates\n4. Respond to leads within 1 hour\n\n💡 Estimated Impact: Each active product = more buyer inquiries!`;
        }

      } else {
        const activeCount = products.filter(p => p.status === 'active').length;
        response = `💎 Price Optimizer — ${products.length} Products\n\nActive & Earning: ${activeCount} products\n\nAsk me:\n• "Price recommendations" — optimize pricing\n• "Market analysis" — competitor insights\n• "Revenue forecast" — growth planning\n• "Suggest pricing" — per-product advice`;
      }

      const botMessage = {
        id: userMessage.id + 1,
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setPriceOptimizerMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Price Optimizer error:', error);
      const botMessage = {
        id: userMessage.id + 1,
        text: '❌ Error fetching pricing data. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setPriceOptimizerMessages(prev => [...prev, botMessage]);
    }
  };

  // Analytics Hub Submit Handler
  const handleAnalyticsHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyticsHubInput.trim()) return;

    const userMessage = {
      id: analyticsHubMessages.length + 1,
      text: analyticsHubInput,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setAnalyticsHubMessages(prev => [...prev, userMessage]);
    const inputText = analyticsHubInput;
    setAnalyticsHubInput('');

    try {
      const input = inputText.toLowerCase();
      let response = '';

      if (input.includes('sales') || input.includes('revenue') || input.includes('report')) {
        // Fetch real performance analytics
        const perfRes = await fetch(`${API_URL}/automation/analytics/performance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const perfData = await perfRes.json();

        if (perfData.success && perfData.data) {
          const d = perfData.data;
          response = `📈 Sales & Revenue Report\n\n💰 Revenue: ₹${(d.totalRevenue || 0).toLocaleString()}\n📦 Total Orders: ${d.totalOrders || 0}\n🧾 Avg Order Value: ₹${(d.avgOrderValue || 0).toLocaleString()}\n\n📊 Your Products:\n• Active: ${products.filter(p => p.status === 'active').length}\n• Pending: ${products.filter(p => p.status === 'pending').length}\n• Total Listed: ${products.length}\n\n💡 ${(d.totalRevenue || 0) === 0 ? 'Start getting orders to see revenue grow!' : 'Keep growing — great progress!'}`;
        } else {
          const activeCount = products.filter(p => p.status === 'active').length;
          const pendingCount = products.filter(p => p.status === 'pending').length;
          response = `📈 Sales Report\n\n📦 Product Status:\n• Active Products: ${activeCount}\n• Pending Approval: ${pendingCount}\n• Total: ${products.length}\n\n🗂️ Categories: ${[...new Set(products.map(p => p.category))].join(', ')}\n\n💡 Orders and revenue will appear here as you start selling!`;
        }

      } else if (input.includes('trend') || input.includes('insight') || input.includes('key')) {
        const statsRes = await fetch(`${API_URL}/automation/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();

        const activeCount = products.filter(p => p.status === 'active').length;
        const categories = [...new Set(products.map(p => p.category))];

        if (statsData.success && statsData.data) {
          const s = statsData.data;
          response = `🎯 Key Business Insights\n\n✅ Strengths:\n• Active Products: ${activeCount}\n• Leads Collected: ${s.totalLeads || 0}\n• Auto-Replies Set Up: ${s.totalAutoReplies || 0}\n• Orders Processed: ${s.totalOrders || 0}\n\n📊 Your Reach:\n• Categories: ${categories.join(', ')}\n• Visibility Score: ${activeCount > 5 ? 'High' : activeCount > 2 ? 'Medium' : 'Low — add more products!'}\n\n⚠️ Opportunities:\n• ${products.filter(p => p.status === 'pending').length} products awaiting approval\n• ${s.totalAutoReplies === 0 ? 'Set up Auto-Reply to respond faster' : 'Auto-Reply is active — great!'}\n• ${activeCount < 5 ? 'Add more products to grow reach' : 'Good product variety!'}`;
        } else {
          response = `🎯 Key Insights\n\n✅ Current Status:\n• Active Products: ${activeCount}\n• Categories: ${categories.join(', ')}\n\n⚠️ Action Items:\n• ${products.filter(p => p.status === 'pending').length > 0 ? `${products.filter(p => p.status === 'pending').length} products pending approval` : 'All products approved!'}\n• Set up Auto-Reply for faster responses\n• Use Lead Scoring to prioritize inquiries\n\n📈 Growth Potential: ${activeCount < 5 ? '+' + ((5 - activeCount) * 20) + '% by adding more products' : 'Strong listing volume!'}`;
        }

      } else if (input.includes('performance') || input.includes('metric') || input.includes('stat')) {
        const [statsRes, perfRes] = await Promise.all([
          fetch(`${API_URL}/automation/analytics/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/automation/analytics/performance`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const statsData = await statsRes.json();
        const perfData = await perfRes.json();

        response = `📊 Full Performance Metrics\n\n`;

        if (statsData.success && statsData.data) {
          const s = statsData.data;
          response += `🤖 Automation:\n• Leads: ${s.totalLeads || 0}\n• Auto-Replies: ${s.totalAutoReplies || 0}\n• Orders: ${s.totalOrders || 0}\n\n`;
        }

        if (perfData.success && perfData.data) {
          const p = perfData.data;
          response += `💰 Revenue:\n• Total: ₹${(p.totalRevenue || 0).toLocaleString()}\n• Orders: ${p.totalOrders || 0}\n• Avg Value: ₹${(p.avgOrderValue || 0).toLocaleString()}\n\n`;
        }

        response += `📦 Products:\n• Active: ${products.filter(p => p.status === 'active').length}\n• Pending: ${products.filter(p => p.status === 'pending').length}\n• Total: ${products.length}\n• Categories: ${[...new Set(products.map(p => p.category))].length}`;

      } else {
        response = `📊 Analytics Hub — Your Business\n\n📦 Products: ${products.length} (${products.filter(p => p.status === 'active').length} active)\n\nAsk me:\n• "Sales report" — revenue & orders\n• "Key insights" — strengths & opportunities\n• "Performance metrics" — full dashboard\n• "Revenue trends" — growth tracking`;
      }

      const botMessage = {
        id: userMessage.id + 1,
        text: response,
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setAnalyticsHubMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Analytics Hub error:', error);
      const botMessage = {
        id: userMessage.id + 1,
        text: '❌ Error fetching analytics data. Please try again.',
        sender: 'bot' as const,
        timestamp: new Date()
      };
      setAnalyticsHubMessages(prev => [...prev, botMessage]);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCategories();
    fetchProducts();
    fetchLiveLeads();
  }, []);

  useEffect(() => {
    fetchAISuggestions();
  }, [products]);

  const fetchAISuggestions = async () => {
    try {
      setLoadingAI(true);
      const response = await fetch(`${API_URL}/ai/supplier-insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAiSuggestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/public`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleProductNameChange = (value: string) => {
    setProductForm({ ...productForm, name: value });
    
    if (value.trim().length > 0) {
      const filtered = predefinedProducts.filter(product => 
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setProductSuggestions(filtered);
      setShowProductSuggestions(true);
    } else {
      setShowProductSuggestions(false);
    }
  };

  const handleSelectPredefinedProduct = async (product: typeof predefinedProducts[0]) => {
    // Map category slugs
    const categoryMap: Record<string, string> = {
      'mild-steel': 'mild-steel',
      'stainless-steel': 'stainless-steel',
      'construction': 'construction',
      'electrical': 'electrical'
    };

    const mappedCategory = categoryMap[product.category] || product.category;

    // Convert image import to File object for upload
    let imageFile: File | null = null;
    let imagePreview = '';

    // Fetch the image and convert to File
    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const fileName = product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.jpg';
      imageFile = new File([blob], fileName, { type: blob.type });
      imagePreview = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Failed to load product image:', error);
      // Fallback: use image URL directly
      imagePreview = product.image;
    }

    setProductForm({
      ...productForm,
      name: product.name,
      category: mappedCategory,
      subcategory: '',
      customCategory: '',
      customSubcategory: '',
      description: product.description,
      features: product.features || [],
      applications: product.applications || [],
      specifications: product.specifications || {},
      imageFile,
      imagePreview
    });

    setShowProductSuggestions(false);
    
    // Show success toast
    toast({
      title: '✨ Product Details Auto-Filled',
      description: `Loaded complete information for "${product.name}"`,
      variant: 'default',
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productInputRef.current && !productInputRef.current.contains(event.target as Node)) {
        setShowProductSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products/my-products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        console.log('📄 API Response - Total products:', data.data?.length);
        data.data?.forEach((p: any) => {
          console.log(`📸 Product: ${p.name}`);
          console.log(`   Image field exists: ${!!p.image}`);
          console.log(`   Image value: "${p.image}"`);
          console.log(`   Image length: ${p.image?.length || 0}`);
          if (p.image && p.image.length > 0) {
            const isCloudinary = p.image.includes('cloudinary.com') || p.image.includes('res.cloudinary.com');
            const isRelative = p.image.startsWith('/');
            const isHttp = p.image.startsWith('http');
            console.log(`   Is Cloudinary: ${isCloudinary}`);
            console.log(`   Is Relative path: ${isRelative}`);
            console.log(`   Is HTTP(S): ${isHttp}`);
          }
        });
        setProducts(data.data);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch products', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // ... existing code ...

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Basic fields
      formDataToSend.append('name', productForm.name);
      formDataToSend.append('category', productForm.category === 'custom' ? productForm.customCategory : productForm.category);
      formDataToSend.append('subcategory', productForm.subcategory === 'custom' ? productForm.customSubcategory : productForm.subcategory);
      formDataToSend.append('description', productForm.description);
      
      // Image file
      if (productForm.imageFile) {
        formDataToSend.append('productImage', productForm.imageFile);
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();
      if (data.success) {
        setShowProductDialog(false);
        setShowSuccessPopup(true);
        resetProductForm();
        fetchProducts();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add product', variant: 'destructive' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        toast({ title: 'Success', description: 'Product deleted successfully' });
        fetchProducts();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  // ... existing code ...

  const resetProductForm = () => {
    setProductForm({
      name: '',
      category: '',
      subcategory: '',
      customCategory: '',
      customSubcategory: '',
      description: '',
      imageFile: null,
      imagePreview: '',
      features: [],
      applications: [],
      specifications: {},
    });
    setShowCustomCategory(false);
    setShowCustomSubcategory(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    localStorage.removeItem('supplierToken');
    localStorage.removeItem('supplierUser');
    setShowLogoutModal(false);
    navigate('/login');
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200/50',
      active: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200/50',
      inactive: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border border-gray-200/50',
      rejected: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200/50',
    };
    return <Badge className={`${variants[status as keyof typeof variants]} capitalize font-medium px-3 py-1`}>{status}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      'mild-steel': { bg: 'from-slate-500 to-slate-600', text: 'text-slate-700', border: 'border-slate-300', icon: '⚙️' },
      'stainless-steel': { bg: 'from-gray-400 to-gray-500', text: 'text-gray-700', border: 'border-gray-300', icon: '✨' },
      'construction': { bg: 'from-orange-500 to-amber-600', text: 'text-orange-700', border: 'border-orange-300', icon: '🏗️' },
      'electrical': { bg: 'from-yellow-500 to-amber-500', text: 'text-yellow-700', border: 'border-yellow-300', icon: '⚡' },
    };
    return colors[category] || { bg: 'from-primary to-secondary', text: 'text-primary', border: 'border-primary', icon: '📦' };
  };

  // Analytics calculations with AI insights
  const analytics = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    rejected: products.filter(p => p.status === 'rejected').length,
    inactive: products.filter(p => p.status === 'inactive').length,
  };

  // AI-powered insights
  const aiInsights = {
    approvalRate: analytics.total > 0 ? Math.round((analytics.active / analytics.total) * 100) : 0,
    pendingTrend: analytics.pending > analytics.total * 0.5 ? 'high' : analytics.pending > analytics.total * 0.2 ? 'medium' : 'low',
    topCategory: Object.entries(products.reduce((acc, product) => {
      const category = product.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
    recommendations: [
      analytics.pending > 5 ? '⚡ High pending items - Consider reviewing product details' : null,
      analytics.active === 0 && analytics.total > 0 ? '🎯 No active products - Follow up with admin team' : null,
      analytics.total < 5 ? '📦 Add more products to increase visibility' : null,
      analytics.rejected > 0 ? '🔍 Review rejected items and resubmit with corrections' : null,
    ].filter(Boolean),
  };

  const categoryBreakdown = products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f3f0ec] relative overflow-hidden">
      {/* Animated Background - Match Login Page */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-glow/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Header */}
      <div className="glass-card border-b-2 border-white/20 backdrop-blur-2xl sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                <Package className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient">Supplier Portal</h1>
                {/* <p className="text-muted-foreground text-sm">{user.companyName || 'Business Ventures'}</p> */}
              </div>
            </div>
            <div className="flex gap-3 items-center flex-col sm:flex-row">
              <LanguageSwitcher />
              <Button
                className="bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-xl hover:scale-105 transition-all"
                onClick={handleLogoutClick}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Supplier Profile Card */}
        <div className="glass-card border-2 border-white/30 p-4 sm:p-6 rounded-xl sm:rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              {/* Profile Section */}
              <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                {/* Logo or Initial Avatar with Edit Option */}
                <div className="relative group">
                  {user?.logo ? (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl shadow-lg flex-shrink-0 overflow-hidden bg-white">
                      <img 
                        src={getFixedImageUrl(user.logo)} 
                        alt={user?.companyName || 'Company Logo'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initial if logo fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex';
                          }
                        }}
                      />
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center" style={{display: 'none'}}>
                        <span className="text-white font-bold text-lg sm:text-2xl">{user?.companyName?.charAt(0) || 'S'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white font-bold text-lg sm:text-2xl">{user?.companyName?.charAt(0) || 'S'}</span>
                    </div>
                  )}
                  {/* Edit Profile Button - Always visible */}
                  <button 
                    onClick={() => navigate('/profile')}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 hover:scale-110 transition-all"
                    title="Edit Profile"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-1 truncate max-w-full">{user?.companyName || 'Business Ventures'}</h2>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground">
                    {user?.email && <span className="truncate">📧 {user.email}</span>}
                    {user?.phone && <span className="truncate">📞 {user.phone}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-muted-foreground mt-1">
                    <span className="truncate">📊 {analytics.total} Products</span>
                    <span className="truncate">✅ {aiInsights.approvalRate}% Success</span>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
                <div className="text-center glass-card border border-white/20 p-2 sm:p-3 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-primary">{analytics.total}</p>
                  <p className="text-xs text-muted-foreground mt-1">Products</p>
                </div>
                <div className="text-center glass-card border border-white/20 p-2 sm:p-3 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{aiInsights.approvalRate}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Approval</p>
                </div>
                <div className="text-center glass-card border border-white/20 p-2 sm:p-3 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{analytics.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Insights */}
        <AIInsightsPanel />

        {/* Compact Analytics - Single Row - Enhanced Design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Total Products */}
          <div className="glass-card border-2 border-white/30 p-3 sm:p-5 rounded-lg sm:rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-900/30 dark:to-slate-800/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 group-hover:from-primary/12 group-hover:to-secondary/12 transition-colors duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide hidden sm:block">Total</p>
              </div>
              <p className="text-2xl sm:text-4xl font-bold text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{analytics.total}</p>
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Products</p>
            </div>
          </div>

          {/* Active */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-green-50/50 to-emerald-100/30 dark:from-green-900/20 dark:to-emerald-800/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/8 via-transparent to-emerald-500/8 group-hover:from-green-500/12 group-hover:to-emerald-500/12 transition-colors duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide">Active</p>
              </div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">{analytics.active}</p>
              <p className="text-xs text-green-700/70 dark:text-green-400/70 mt-2">Published</p>
            </div>
          </div>

          {/* Pending */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-yellow-50/50 to-orange-100/30 dark:from-yellow-900/20 dark:to-orange-800/10">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/8 via-transparent to-orange-500/8 group-hover:from-yellow-500/12 group-hover:to-orange-500/12 transition-colors duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-semibold uppercase tracking-wide">Pending</p>
              </div>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{analytics.pending}</p>
              <p className="text-xs text-yellow-700/70 dark:text-yellow-400/70 mt-2">In Review</p>
            </div>
          </div>

          {/* Rejected */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-red-50/50 to-pink-100/30 dark:from-red-900/20 dark:to-pink-800/10">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/8 via-transparent to-pink-500/8 group-hover:from-red-500/12 group-hover:to-pink-500/12 transition-colors duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-red-700 dark:text-red-400 font-semibold uppercase tracking-wide">Rejected</p>
              </div>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{analytics.rejected}</p>
              <p className="text-xs text-red-700/70 dark:text-red-400/70 mt-2">Needs Update</p>
            </div>
          </div>

          {/* Approval Rate - Premium Highlight */}
          <div className="glass-card border-2 border-primary/40 p-5 rounded-xl backdrop-blur-2xl hover:shadow-lg transition-all duration-300 group relative overflow-hidden bg-gradient-to-br from-primary/10 via-purple-500/5 to-secondary/10 dark:from-primary/20 dark:to-secondary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 group-hover:from-primary/15 group-hover:to-secondary/15 transition-colors duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 animate-pulse">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-primary font-semibold uppercase tracking-wide">Success Rate</p>
              </div>
              <p className="text-4xl font-bold text-primary">{aiInsights.approvalRate}%</p>
              <p className="text-xs text-primary/70 mt-2">Approval Rate</p>
            </div>
          </div>
        </div>

        {/* Animated Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Progress Bars */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Status Distribution</h3>
              </div>
              
              <div className="space-y-4">
                {/* Active Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-muted-foreground font-medium">Active</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.active} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.active / analytics.total) * 100 : 0}%`}}
                    ></div>
                  </div>
                </div>

                {/* Pending Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <span className="text-muted-foreground font-medium">Pending Review</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.pending} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.pending / analytics.total) * 100 : 0}%`, animationDelay: '0.2s'}}
                    ></div>
                  </div>
                </div>

                {/* Rejected Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span className="text-muted-foreground font-medium">Rejected</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.rejected} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.rejected / analytics.total) * 100 : 0}%`, animationDelay: '0.4s'}}
                    ></div>
                  </div>
                </div>

                {/* Inactive Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span className="text-muted-foreground font-medium">Inactive</span>
                    </div>
                    <span className="font-bold text-foreground">{analytics.inactive} / {analytics.total}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gray-500 to-slate-500 rounded-full transition-all duration-1000 ease-out animate-in slide-in-from-left"
                      style={{width: `${analytics.total > 0 ? (analytics.inactive / analytics.total) * 100 : 0}%`, animationDelay: '0.6s'}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Top Category */}
          <div className="glass-card border-2 border-white/30 p-5 rounded-2xl backdrop-blur-2xl hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Quick Insights</h3>
              </div>

              <div className="space-y-4">
                {/* Top Category */}
                <div className="glass-card border border-white/20 p-4 rounded-xl hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground font-medium">Top Category</p>
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-lg font-bold text-foreground capitalize">{aiInsights.topCategory.replace('-', ' ')}</p>
                </div>

                {/* Pending Alert */}
                {analytics.pending > 0 && (
                  <div className="glass-card border border-yellow-200/50 bg-yellow-50/30 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">Pending Approval</p>
                        <p className="text-xs text-yellow-700">{analytics.pending} product{analytics.pending > 1 ? 's' : ''} awaiting admin review</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Action Button */}
                <Button
                  onClick={() => navigate('/products/add')}
                  className="w-full bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold transition-all duration-300 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Automation Suite - Dynamic Tools */}
        <div className="glass-card border-2 border-white/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl p-8 backdrop-blur-3xl overflow-hidden relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
          <div className="relative z-10">
            {/* Header - Synced with RitzYard */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className=" text-gradient text-2xl font-bold text-foreground">Business Automation Suite</h3>
                  <p className="text-sm text-muted-foreground mt-1">Smart tools to save time, boost sales, and scale your business</p>
                </div>
              </div>
            </div>

            {/* Tools Grid */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tool 1: Auto Reply Manager - hidden */}

              {/* Tool 2: Lead Scoring */}
              <button
                onClick={() => navigate('/automation/lead-scoring')}
                className="glass-card border-2 border-white/30 rounded-2xl p-5 hover:border-green-500/50 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-xl bg-white/20 dark:bg-white/5 group cursor-pointer text-left w-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors flex-shrink-0">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Lead Scoring</h4>
                    <p className="text-xs text-muted-foreground mb-3">Identify high-value leads automatically</p>
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                      <span>↑ Conversion +45%</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Tool 3: Order Automation */}
              <button
                onClick={() => navigate('/automation/order-automation')}
                className="glass-card border-2 border-white/30 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-xl bg-white/20 dark:bg-white/5 group cursor-pointer text-left w-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Order Automation</h4>
                    <p className="text-xs text-muted-foreground mb-3">Auto-process & fulfill orders seamlessly</p>
                    <div className="flex items-center gap-1 text-xs text-purple-600 font-semibold">
                      <span>↓ Time -60%</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Tool 4: Inventory Management */}
              <button
                onClick={() => navigate('/automation/smart-inventory')}
                className="glass-card border-2 border-white/30 rounded-2xl p-5 hover:border-amber-500/50 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-xl bg-white/20 dark:bg-white/5 group cursor-pointer text-left w-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors flex-shrink-0">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground mb-1">Smart Inventory</h4>
                    <p className="text-xs text-muted-foreground mb-3">Real-time stock tracking & alerts</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                      <span>↑ Efficiency +55%</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Tool 5: Price Optimizer - hidden */}

              {/* Tool 6: Analytics Hub - hidden */}
            </div>
          </div>
        </div>

        {/* ─── YOUR LEADS ─── */}
        <div className="glass-card border-2 border-white/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl p-6 sm:p-8 backdrop-blur-3xl overflow-hidden relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>
          <div className="relative z-10">

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-gradient text-xl sm:text-2xl font-bold text-foreground">
                    Your Leads
                    {liveLeads.length > 0 && (
                      <span className="ml-2 text-sm font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: 'linear-gradient(135deg,#c1482b,#e05a38)' }}>
                        {liveLeads.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Buyer inquiries matched to your products — respond fast to win deals</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/products/inquiries')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c1482b 0%,#e05a38 100%)' }}
              >
                <MessageSquare className="w-4 h-4" />
                View All
              </button>
            </div>

            {/* Loading */}
            {leadsLoading && (
              <div className="flex items-center justify-center py-10 gap-3">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                <p className="text-muted-foreground text-sm">Loading your leads...</p>
              </div>
            )}

            {/* Empty State */}
            {!leadsLoading && liveLeads.length === 0 && (
              <div className="text-center py-12 px-4 rounded-2xl bg-white/30 border border-white/20">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ffe4d4' }}>
                  <Target className="w-8 h-8" style={{ color: '#c1482b' }} />
                </div>
                <p className="font-semibold text-foreground">No leads yet</p>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
                  When buyers submit inquiries matching your products, they’ll appear here as scored leads.
                </p>
                <button
                  onClick={() => navigate('/products/add')}
                  className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#c1482b 0%,#e05a38 100%)' }}
                >
                  + Add Products to Attract Buyers
                </button>
              </div>
            )}

            {/* Lead Cards Grid */}
            {!leadsLoading && liveLeads.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveLeads.map((inq, idx) => {
                    const score = scoreLead(inq);
                    const timeAgo = inq.createdAt
                      ? (() => {
                          const diff = Date.now() - new Date(inq.createdAt).getTime();
                          const h = Math.floor(diff / 3600000);
                          const d = Math.floor(diff / 86400000);
                          return h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : `${d}d ago`;
                        })()
                      : '';

                    return (
                      <div
                        key={inq._id || idx}
                        onClick={() => navigate('/products/inquiries')}
                        className="group cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                        style={{ borderColor: '#e8dcd0', backgroundColor: 'white' }}
                      >
                        {/* Gradient accent bar */}
                        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg,#c1482b,#e05a38)' }}></div>

                        {/* Top row: Score badge + time */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: score.bg, color: score.color }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: score.dot }}></span>
                              {score.label}
                            </span>
                          </span>
                          {timeAgo && <span className="text-[10px] text-muted-foreground">{timeAgo}</span>}
                        </div>

                        {/* Product name */}
                        <h4 className="font-bold text-sm text-foreground truncate mb-1 group-hover:text-primary transition-colors">
                          {inq.productName}
                        </h4>

                        {/* Buyer */}
                        <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                          <Star className="w-3 h-3 flex-shrink-0" style={{ color: '#c1482b' }} />
                          {inq.buyerName}{inq.buyerCompany && inq.buyerCompany !== 'Individual' ? ` · ${inq.buyerCompany}` : ''}
                        </p>

                        {/* Stats row */}
                        <div className="flex items-center gap-3 text-[11px] font-semibold mb-3">
                          {inq.quantity && (
                            <span className="flex items-center gap-1" style={{ color: '#1565c0' }}>
                              <BarChart3 className="w-3 h-3" />
                              {inq.quantity} {inq.unit || ''}
                            </span>
                          )}
                          {inq.budget && (
                            <span className="flex items-center gap-1" style={{ color: '#2e7d32' }}>
                              <TrendingUp className="w-3 h-3" />
                              ₹{inq.budget}
                            </span>
                          )}
                          {inq.deliveryLocation && (
                            <span className="text-muted-foreground truncate max-w-[80px]">
                              📍 {inq.deliveryLocation}
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        <div
                          className="w-full py-1.5 rounded-xl text-[11px] font-bold text-white text-center group-hover:opacity-90 transition-all"
                          style={{ background: 'linear-gradient(135deg,#c1482b 0%,#e05a38 100%)' }}
                        >
                          <MessageSquare className="w-3 h-3 inline mr-1 -mt-0.5" />
                          Open Chat & Quote
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile View All */}
                <div className="mt-4 sm:hidden">
                  <button
                    onClick={() => navigate('/products/inquiries')}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#c1482b 0%,#e05a38 100%)' }}
                  >
                    View All Leads →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RitzYard AI Recommendations - Recommended by AI Products */}
        <div className="glass-card border-2 border-white/30 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl p-6 md:p-8 backdrop-blur-3xl overflow-hidden relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5"></div>
          <div className="relative z-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className=" text-gradient text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">Recommended by AI <span className="text-lg sm:text-xl text-yellow">✨</span></h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">AI-powered recommendations based on your product additions</p>
                </div>
              </div>
            </div>

            {/* Content Section */}
            {loadingAI ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm sm:text-base">Analyzing your products for AI recommendations...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in">
                {getRecommendedProducts().map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleAddProductWithAutofill(product)}
                    className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full bg-white"
                    style={{ border: '2px solid #e8dcd0' }}
                  >
                    {/* Image Container */}
                    <div className="relative w-full overflow-hidden flex-shrink-0" style={{ height: '200px' }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/400x200?text=${encodeURIComponent(product.name.substring(0, 20))}`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#f3f0ec' }}>
                          <Package className="w-12 h-12 sm:w-14 sm:h-14" style={{ color: '#c1482b' }} />
                        </div>
                      )}
                    </div>
                    {/* Content Section */}
                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <h4 className="font-bold text-sm sm:text-base text-foreground mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 flex-grow">
                        {product.description}
                      </p>
                      {product.category && (
                        <span className="text-xs px-3 py-1 rounded-lg mb-3 inline-block font-medium" style={{ backgroundColor: '#e8dcd0', color: '#6b5d54' }}>
                          {product.category.replace('-', ' ')}
                        </span>
                      )}
                      <button
                        className=" bg-gradient-to-r from-primary via-primary-glow to-secondary  mt-auto text-xs sm:text-sm font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all w-full text-white hover:shadow-lg"
                       
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a53019'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#c1482b'; }}
                      >
                        + Add Product
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4 sm:px-6 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-muted-foreground font-medium text-sm sm:text-base">No products yet to get recommendations</p>
                <p className="text-xs text-muted-foreground mt-2">Add your first product to receive AI-powered recommendations and insights</p>
              </div>
            )}
          </div>
        </div>


        {/* Tabs */}
        <div className="space-y-6">
            <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b border-white/20 p-6 rounded-t-3xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className=" text-gradient text-3xl font-bold text-foreground mb-2">
                      Product Management
                    </h2>
                    <p className="text-muted-foreground text-base">Manage your product listings and track performance</p>
                  </div>
                  <Button
                    onClick={() => navigate('/products/add')}
                    className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-6 py-5 transition-all duration-300 rounded-xl text-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                  </Button>
                </div>
                
                {/* Search Bar */}
                <div className="relative mt-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-white/30 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-xl"
                  />
                </div>

                {/* Filter Options */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Filter by Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-10 border-2 border-white/30 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-2 border-white/30 rounded-lg">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Filter by Category</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-10 border-2 border-white/30 bg-white/50 dark:bg-black/30 backdrop-blur-xl rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-900 border-2 border-white/30 rounded-lg">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="mild-steel">Mild Steel</SelectItem>
                        <SelectItem value="stainless-steel">Stainless Steel</SelectItem>
                        <SelectItem value="construction">Construction Materials</SelectItem>
                        <SelectItem value="electrical">Electrical Materials</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-6 shadow-xl animate-float">
                      <Package className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">No products yet</h3>
                    <p className="text-muted-foreground text-base mb-6 max-w-md mx-auto">Add your first product to showcase your offerings to potential customers!</p>
                    <Button
                      onClick={() => navigate('/products/add')}
                      className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-8 py-6 rounded-xl transition-all duration-300 text-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      // Get the image URL and check if it exists
                      const rawImage = product.image;
                      const hasImage = rawImage && typeof rawImage === 'string' && rawImage.trim().length > 0;
                      const userImage = hasImage ? getFixedImageUrl(rawImage) : '';
                      const displayImage = (userImage && userImage.length > 0) ? userImage : '';
                      
                      console.log(`\n--- Rendering Product: ${product.name} ---`);
                      console.log(`Raw image: "${rawImage}"`);
                      console.log(`Has image: ${hasImage}`);
                      console.log(`User image: "${userImage}"`);
                      console.log(`Display image: "${displayImage}"`);

                      return (
                        <div
                          key={product._id}
                          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group relative"
                        >
                          {/* Product Image - Show placeholder if no image */}
                          <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 overflow-hidden relative">
                            {displayImage ? (
                              <img
                                src={displayImage}
                                data-src={displayImage}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                crossOrigin="anonymous"
                                data-retry="0"
                                onError={(e) => {
                                  console.error(`❌ Product image failed: ${displayImage}`);
                                  handleImageErrorWithRetry(e);
                                }}
                                onLoad={() => console.log(`✅ Image loaded: ${product.name}`)}
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                                <Package className="w-16 h-16 text-primary/40 mb-2" />
                                <span className="text-sm text-muted-foreground">No image uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Card Content */}
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                  {product.name}
                                </h3>
                                <div className="inline-block mb-4">
                                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
                                    {product.category.replace('-', ' ')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                {getStatusBadge(product.status)}
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                              {product.description}
                            </p>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6 py-4 border-t border-b border-gray-200 dark:border-gray-700">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Status</p>
                                <p className="text-sm font-bold text-foreground capitalize">{product.status}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide mb-1">Added</p>
                                <p className="text-sm font-bold text-foreground">Recently</p>
                              </div>
                            </div>

                            {/* Action Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-2 border-red-300/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-all duration-300 rounded-lg font-medium"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                              Remove Product
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct as any}
            open={showProductDetail}
            onOpenChange={setShowProductDetail}
            onEdit={(product) => {
              setSelectedProduct(product);
              toast({ title: 'Edit', description: `Now editing: ${product.name}` });
            }}
          />
        )}
              </div>
            </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-2 border-white/30 rounded-3xl bg-white/70 dark:bg-black/40 backdrop-blur-3xl shadow-4xl">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl animate-glow-pulse transform transition-transform hover:scale-105">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Add New Product</DialogTitle>
                <DialogDescription className="text-muted-foreground mt-1 text-sm">Submit your product for admin review and approval</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleAddProduct} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gradient border-b-2 border-primary/20 pb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Basic Information
              </h3>
              <div className="relative" ref={productInputRef}>
                <Label htmlFor="name">Product Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., MS Round Bars IS 2062"
                    value={productForm.name}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    required
                    className="h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                  <Package className="w-3 h-3" />
                  Start typing to see product suggestions with pre-filled data
                </p>
                
                {/* Autocomplete Suggestions Dropdown */}
                {showProductSuggestions && productSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 max-h-80 overflow-y-auto bg-white dark:bg-gray-900 border-2 border-primary/30 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-border/50 bg-primary/5">
                      <p className="text-xs font-semibold text-primary flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {productSuggestions.length} Products Found - Click to auto-fill
                      </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {productSuggestions.slice(0, 10).map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSelectPredefinedProduct(product)}
                          className="w-full p-3 hover:bg-primary/10 border-b border-border/30 last:border-0 text-left transition-all duration-200 flex items-start gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-primary/20 flex-shrink-0 group-hover:border-primary/50 transition-all">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                // Fallback to a placeholder if image fails to load
                                target.src = 'https://placehold.co/100x100/6366f1/ffffff?text=Product';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                              {product.category.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                    {productSuggestions.length > 10 && (
                      <div className="p-2 border-t border-border/50 bg-muted/50">
                        <p className="text-xs text-center text-muted-foreground">
                          Showing 10 of {productSuggestions.length} results. Type more to refine search.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Category Selection as Chips */}
              <div>
                <Label className="font-semibold text-foreground mb-2 block">Category *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      className={`px-4 py-2 rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${productForm.category === cat.slug
                        ? 'border-primary bg-primary/10 text-primary font-semibold' 
                        : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
                      onClick={() => setProductForm({ ...productForm, category: cat.slug, subcategory: '', customSubcategory: '' })}
                    >
                      <span>{cat.icon || '📦'}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowCustomCategory(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>
                                
              {/* Custom Category Input */}
              {showCustomCategory && (
                <div className="mt-2 p-4 border-2 border-primary/30 rounded-xl bg-primary/5">
                  <Label className="font-semibold text-foreground mb-2 block">Request New Category</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new category name"
                      value={productForm.customCategory}
                      onChange={(e) => setProductForm({ ...productForm, customCategory: e.target.value })}
                      className="flex-1 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        if (productForm.customCategory.trim()) {
                          setProductForm({ ...productForm, category: 'custom' });
                        }
                      }}
                    >
                      Request
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomCategory(false);
                        setProductForm({ ...productForm, customCategory: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Your category will be reviewed by admin before it becomes available.</p>
                </div>
              )}
                                
              {/* Subcategory Selection */}
              {productForm.category && productForm.category !== 'custom' && !showCustomCategory && (
                <div>
                  <Label className="font-semibold text-foreground mb-2 block">Subcategory (Optional)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableSubcategories.map((sub) => (
                      <button
                        key={sub.slug}
                        type="button"
                        className={`px-4 py-2 rounded-full border-2 transition-all duration-300 ${productForm.subcategory === sub.slug
                          ? 'border-primary bg-primary/10 text-primary font-semibold' 
                          : 'border-border/50 hover:border-primary/50 hover:bg-primary/5'}`}
                        onClick={() => setProductForm({ ...productForm, subcategory: sub.slug, customSubcategory: '' })}
                      >
                        <span>{sub.name}</span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className="px-4 py-2 rounded-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCustomSubcategory(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Subcategory</span>
                    </button>
                  </div>
                </div>
              )}
                                
              {/* Custom Subcategory Input */}
              {showCustomSubcategory && (
                <div className="mt-2 p-4 border-2 border-primary/30 rounded-xl bg-primary/5">
                  <Label className="font-semibold text-foreground mb-2 block">Request New Subcategory</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter new subcategory name"
                      value={productForm.customSubcategory}
                      onChange={(e) => setProductForm({ ...productForm, customSubcategory: e.target.value })}
                      className="flex-1 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <Button 
                      type="button"
                      className="bg-gradient-to-r from-primary to-secondary text-white"
                      onClick={() => {
                        if (productForm.customSubcategory.trim()) {
                          setProductForm({ ...productForm, subcategory: 'custom' });
                        }
                      }}
                    >
                      Request
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCustomSubcategory(false);
                        setProductForm({ ...productForm, customSubcategory: '' });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Your subcategory will be reviewed by admin before it becomes available.</p>
                </div>
              )}
                                
              {/* Image Upload */}
              <div>
                <Label className="font-semibold text-foreground mb-2 block">Product Image (Optional)</Label>
                <div className="mt-2 flex items-center gap-4">
                  {productForm.imagePreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/30">
                      <img 
                        src={productForm.imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageFile: null, imagePreview: '' })}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProductForm({ 
                            ...productForm, 
                            imageFile: e.target.files[0],
                            imagePreview: URL.createObjectURL(e.target.files[0])
                          });
                        }
                      }}
                      className="h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Upload product image or it will use a default placeholder
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description" className="font-semibold text-foreground mb-2 block">AI Recommended Summary</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description including key features and specifications"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={4}
                  className="border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg transition-all duration-300"
                />
              </div>

              {/* Auto-filled Features */}
              {productForm.features.length > 0 && (
                <div className="mt-6 p-4 border-2 border-green-500/30 rounded-xl bg-green-50/50 dark:bg-green-900/10 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <Label className="font-bold text-green-700 dark:text-green-400 text-base">Features (Auto-filled)</Label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {productForm.features.map((feature, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-sm font-medium text-green-800 dark:text-green-300 flex items-center gap-1.5"
                      >
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-filled Applications */}
              {productForm.applications.length > 0 && (
                <div className="mt-4 p-4 border-2 border-blue-500/30 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-blue-600" />
                    <Label className="font-bold text-blue-700 dark:text-blue-400 text-base">Applications (Auto-filled)</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {productForm.applications.map((app, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg text-sm text-blue-800 dark:text-blue-300"
                      >
                        • {app}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Auto-filled Specifications */}
              {productForm.specifications && Object.keys(productForm.specifications).length > 0 && (
                <div className="mt-4 p-4 border-2 border-purple-500/30 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-purple-600" />
                    <Label className="font-bold text-purple-700 dark:text-purple-400 text-base">Product Specifications (Auto-filled)</Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(productForm.specifications).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase mt-0.5">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                        <span className="text-sm text-purple-900 dark:text-purple-200 flex-1">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
              <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)} className="border-2 border-border/50">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-105 text-white font-semibold px-8 transition-all duration-300 rounded-xl">
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit Product
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Popup - Glass Style */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="glass-card border-2 border-white/20 rounded-3xl p-8 max-w-md w-full bg-white/60 dark:bg-black/40 backdrop-blur-2xl shadow-3xl animate-scale-in relative overflow-hidden">
            {/* Animated background orbs */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl animate-glow-pulse">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">Product Submitted!</h3>
              <p className="text-muted-foreground mb-6">Your product listing is under admin review. You will be notified once approved.</p>
              
              <Button 
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-6 rounded-xl hover:shadow-xl transition-all duration-300"
                onClick={() => {
                  setShowSuccessPopup(false);
                }}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Reply Manager Chatbox */}
      {showAutoReplyChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleAutoReplyClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-400/30 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Auto Reply Manager</h3>
                  <p className="text-xs text-blue-100">Set up auto-responses</p>
                </div>
              </div>
              <button
                onClick={handleAutoReplyClose}
                className="p-2 hover:bg-blue-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {autoReplyMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}            
            {/* Quick Action Buttons for Menu */}
            {autoReplyStep === 'menu' && autoReplyMessages.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  onClick={() => handleAutoReplyAction('Create Auto-Reply')}
                  className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 text-white rounded-2xl text-sm py-3 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border border-blue-400/30"
                >
                  <span className="text-lg">✨</span>
                  <span>Create Auto-Reply</span>
                </Button>
                <Button
                  onClick={() => handleAutoReplyAction('View Saved Replies')}
                  className="w-full bg-transparent hover:bg-white/10 text-foreground rounded-2xl text-sm py-3 font-semibold transition-all shadow-none hover:shadow-md flex items-center justify-center gap-2 border-2 border-dashed border-foreground/30 hover:border-foreground/50"
                >
                  <span className="text-lg">📋</span>
                  <span>View Saved Replies</span>
                </Button>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleAutoReplySubmit} className="flex gap-2">
              <Input
                ref={chatInputRef}
                type="text"
                placeholder="Type your message..."
                value={autoReplyInput}
                onChange={(e) => setAutoReplyInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Lead Scoring Chatbox */}
      {showLeadScoringChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleLeadScoringClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            <div className="bg-gradient-to-r from-green-500 to-green-600 border-b border-green-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-400/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Lead Scoring</h3>
                  <p className="text-xs text-green-100">Identify high-value leads</p>
                </div>
              </div>
              <button
                onClick={handleLeadScoringClose}
                className="p-2 hover:bg-green-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {leadScoringMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-green-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleLeadScoringSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about lead scoring..."
                value={leadScoringInput}
                onChange={(e) => setLeadScoringInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Order Automation Chatbox */}
      {showOrderAutomationChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleOrderAutomationClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-400/30 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Order Automation</h3>
                  <p className="text-xs text-purple-100">Auto-process & fulfill orders</p>
                </div>
              </div>
              <button
                onClick={handleOrderAutomationClose}
                className="p-2 hover:bg-purple-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {orderAutomationMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-purple-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleOrderAutomationSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about order automation..."
                value={orderAutomationInput}
                onChange={(e) => setOrderAutomationInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Smart Inventory Chatbox */}
      {showSmartInventoryChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleSmartInventoryClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 border-b border-amber-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-400/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Smart Inventory</h3>
                  <p className="text-xs text-amber-100">Real-time stock tracking</p>
                </div>
              </div>
              <button
                onClick={handleSmartInventoryClose}
                className="p-2 hover:bg-amber-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {smartInventoryMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-amber-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleSmartInventorySubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about inventory..."
                value={smartInventoryInput}
                onChange={(e) => setSmartInventoryInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Price Optimizer Chatbox */}
      {showPriceOptimizerChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handlePriceOptimizerClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 border-b border-rose-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-400/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Price Optimizer</h3>
                  <p className="text-xs text-rose-100">Dynamic pricing engine</p>
                </div>
              </div>
              <button
                onClick={handlePriceOptimizerClose}
                className="p-2 hover:bg-rose-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {priceOptimizerMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-rose-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handlePriceOptimizerSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about pricing..."
                value={priceOptimizerInput}
                onChange={(e) => setPriceOptimizerInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
          </div>
        </div>
        </>
      )}

      {/* Analytics Hub Chatbox */}
      {showAnalyticsHubChatbox && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleAnalyticsHubClose}></div>
          <div className="fixed bottom-0 right-0 w-full sm:w-96 h-screen sm:h-[600px] sm:rounded-t-3xl sm:rounded-br-none rounded-none glass-card border-2 border-white/30 bg-white dark:bg-slate-950 backdrop-blur-3xl overflow-hidden flex flex-col shadow-2xl z-50">
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 border-b border-cyan-400/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-400/30 flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Analytics Hub</h3>
                  <p className="text-xs text-cyan-100">Business insights & reports</p>
                </div>
              </div>
              <button
                onClick={handleAnalyticsHubClose}
                className="p-2 hover:bg-cyan-400/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {analyticsHubMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl whitespace-pre-wrap transition-all ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-white rounded-br-none shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-foreground rounded-bl-none shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs mt-1 opacity-70">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
            <form onSubmit={handleAnalyticsHubSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask about analytics..."
                value={analyticsHubInput}
                onChange={(e) => setAnalyticsHubInput(e.target.value)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-foreground"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:shadow-lg transition-all"
              >
                <span className="text-lg">↑</span>
              </Button>
            </form>
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

export default SupplierProductDashboard;
