import { useState, useEffect, useRef } from "react";
import { Button } from "./components/ui/button";
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Badge } from "./components/ui/badge";

interface Message {
  role: "user" | "milo";
  content: string;
  timestamp: Date;
}

interface MiloContextData {
  hotProducts?: Record<string, unknown>[];
  marketInsights?: Record<string, unknown>;
  suppliers?: Record<string, unknown>[];
  trainingData?: Record<string, unknown>;
}

interface MarketAnalysis {
  hotProducts: string[];
  priceTrends: Record<string, {trend: string, change: number}>;
  supplierInsights: {count: number, topSuppliers: string[], avgRating: number};
  demandMetrics: {highDemand: string[], mediumDemand: string[], lowDemand: string[]};
}

interface NotificationData {
  type: 'market_alert' | 'price_drop' | 'supplier_update';
  title: string;
  message: string;
  timestamp: Date;
}

interface ConversationContext {
  userType: 'buyer' | 'supplier' | 'unknown';
  materialOfInterest: string[];
  recentQueries: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const MiloAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<"en-IN" | "hi-IN">("hi-IN");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [contextData, setContextData] = useState<MiloContextData>({})
  const [hasGreeted, setHasGreeted] = useState(false);
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    userType: 'unknown',
    materialOfInterest: [],
    recentQueries: [],
    sentiment: 'neutral'
  });
  const [responseCache, setResponseCache] = useState<Map<string, string[]>>(new Map());
  const [lastQueryHash, setLastQueryHash] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionConstructor = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognitionConstructor();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        // Auto-detect Hindi from transcribed text and switch language
        if (/[\u0900-\u097F]/.test(transcript)) {
          setLanguage("hi-IN");
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Sync speech recognition language when language toggle changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Load training data on mount
  useEffect(() => {
    const loadMiloTrainingData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/ai/milo/training-data`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setContextData(data.data);
            console.log('✅ Milo training data loaded:', data.data);
          }
        }
      } catch (error) {
        console.log('Training data fetch failed, using fallback responses');
      }
    };
    
    loadMiloTrainingData();
  }, []);

  // Greeting on mount - with language switching support AND voice
  useEffect(() => {
    if (!hasGreeted) {
      setTimeout(() => {
        const greetingText = language === "en-IN" 
          ? "Hello! I'm Milo, your smart procurement assistant at RitzYard. How may I help you today?"
          : "नमस्ते! मैं मिलो हूं, RitzYard में आपका स्मार्ट खरीद सहायक। मैं आज आपकी कैसे मदद कर सकता हूं?";
        
        const greeting: Message = {
          role: "milo",
          content: greetingText,
          timestamp: new Date(),
        };
        setMessages([greeting]);
        
        // Speak greeting with slight delay to ensure voice is ready
        setTimeout(() => {
          if (soundEnabled) {
            speakText(greetingText, language);
          }
        }, 500);
        
        setHasGreeted(true);
      }, 1000);
    }
  }, [hasGreeted, language, soundEnabled]);

  // Handle language switching - speak confirmation
  useEffect(() => {
    if (hasGreeted) {
      // Stop any current speech when switching language
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // Re-greet in the new language so user hears proper Hindi/English
      const langGreeting = language === "en-IN"
        ? "Hello! I'm Milo. Switched to English. How can I help you?"
        : "नमस्ते! मैं मिलो हूं। हिंदी में आ गया। मैं आपकी कैसे मदद कर सकता हूं?";
      
      const greetMsg: Message = {
        role: "milo",
        content: langGreeting,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, greetMsg]);
      
      setTimeout(() => {
        speakText(langGreeting, language);
      }, 300);
    }
  }, [language]);

  // Toggle voice listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // ── MALE VOICE SELECTOR ── picks best male voice for given lang code
  const pickMaleVoice = (langCode: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    // Known male voice names by priority (browser-agnostic)
    const MALE_HINDI  = ['rishi', 'hemant', 'deepak', 'google हिन्दी', 'google hindi', 'hindi male', 'hi-in male'];
    const MALE_ENGLISH = ['david', 'mark', 'daniel', 'james', 'richard', 'george', 'alex', 'fred', 'tom', 'google us english', 'microsoft david', 'microsoft mark', 'en-in male', 'en-us male'];
    const FEMALE_NAMES = ['aditi', 'kalpana', 'lekha', 'priya', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'female', 'woman', 'girl'];

    const isFemale = (name: string) => FEMALE_NAMES.some(f => name.toLowerCase().includes(f));
    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode));

    // Pass 1: exact known male name match
    const maleNames = langCode === 'hi' ? MALE_HINDI : MALE_ENGLISH;
    let pick = langVoices.find(v => maleNames.some(m => v.name.toLowerCase().includes(m)));
    if (pick) return pick;

    // Pass 2: name contains 'male' keyword
    pick = langVoices.find(v => v.name.toLowerCase().includes('male'));
    if (pick) return pick;

    // Pass 3: not a known female name
    pick = langVoices.find(v => !isFemale(v.name));
    if (pick) return pick;

    // Pass 4: fallback to first available voice for that language
    return langVoices[0] || null;
  };

  // Speak text using Web Speech API with MALE voice for both Hindi & English
  const speakText = (text: string, lang: string) => {
    if (!soundEnabled) return;

    window.speechSynthesis.cancel();

    const langCode = lang.split('-')[0]; // 'hi' or 'en'

    const doSpeak = () => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = lang;
      utt.rate  = langCode === 'hi' ? 0.82 : 0.92;  // Hindi needs slower pace
      utt.pitch = 0.55;   // deep male pitch
      utt.volume = 1.0;

      const voice = pickMaleVoice(langCode);
      if (voice) {
        utt.voice = voice;
        console.log(`✅ Milo voice [${lang}]: ${voice.name} (${voice.lang})`);
      } else {
        console.warn(`⚠️ No voice found for lang: ${lang}`);
      }

      utt.onstart = () => setIsSpeaking(true);
      utt.onend   = () => { setIsSpeaking(false); window.speechSynthesis.cancel(); };
      utt.onerror = () => { setIsSpeaking(false); window.speechSynthesis.cancel(); };

      synthesisRef.current = utt;
      window.speechSynthesis.speak(utt);
    };

    // Voices may not be loaded yet on first call — wait for them
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setTimeout(doSpeak, 80);  // tiny delay prevents Chrome clipping
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null; // fire only once
        setTimeout(doSpeak, 80);
      };
    }
  };

  // Smart hash generator for detecting similar queries (supports Hindi)
  const generateQueryHash = (query: string): string => {
    // Normalize query: lowercase, remove punctuation but KEEP Hindi (Devanagari) chars, trim
    const normalized = query.toLowerCase()
      .replace(/[^a-z0-9\s\u0900-\u097F]/g, '') // keep Devanagari (\u0900-\u097F)
      .trim()
      .split(/\s+/)
      .sort() // Sort words to catch reordered questions
      .join(' ');
    return normalized;
  };

  // ─── FULL RITZYARD PLATFORM KNOWLEDGE BASE ───────────────────────────────
  const getMiloResponse = async (userMessage: string): Promise<string> => {
    const queryHash = generateQueryHash(userMessage);
    setLastQueryHash(queryHash);
    const m = userMessage.toLowerCase();
    const isHindi = /[\u0900-\u097F]/.test(userMessage) || language === 'hi-IN';

    // ── GREETINGS ──
    if (/^(hello|hi|hey|helo|namaste|namaskar|नमस्ते|हाय|हेलो)\b/.test(m)) {
      return isHindi
        ? "नमस्ते! मैं मिलो हूं — RitzYard का आवाज़ सहायक। 🙏\n\nमैं दोनों — खरीदार (Buyer) और आपूर्तिकर्ता (Supplier) — की मदद करता हूं।\n\nआप बताइए:\n• क्या आप सामग्री खरीदना चाहते हैं? → 'मैं खरीदार हूं' कहें\n• क्या आप अपना सामान बेचना चाहते हैं? → 'मैं सप्लायर हूं' कहें\n\nया सीधे पूछें — मैं हिंदी में जवाब दूंगा! 😊"
        : "Hello! I'm Milo — RitzYard's voice AI assistant. 👋\n\nI guide both Buyers and Suppliers on this platform.\n\nTell me:\n• Are you looking to BUY materials? Say 'I am a buyer'\n• Do you want to SELL your products? Say 'I am a supplier'\n\nOr just ask your question — I'll help you step by step!";
    }

    // ── WHAT IS RITZYARD ──
    if (/ritzyard|platform|what is|kya hai|क्या है|यह क्या|what does/.test(m)) {
      return isHindi
        ? "🏗️ RitzYard एक B2B procurement marketplace है — यानी एक ऐसा platform जहाँ:\n\n🛒 खरीदार (Buyer): निर्माण सामग्री जैसे सीमेंट, स्टील, TMT बार, ईंट, आदि के लिए quotation मांग सकते हैं।\n\n🏭 आपूर्तिकर्ता (Supplier): अपने products list करके buyers को quote दे सकते हैं और orders पा सकते हैं।\n\n🔒 RitzYard middleman की तरह काम करता है — दोनों का contact safe रहता है, सब chat platform के through होता है।\n\nआप buyer हैं या supplier? 😊"
        : "🏗️ RitzYard is a B2B Procurement Marketplace — a trusted platform where:\n\n🛒 Buyers: Search and request quotes for construction materials (Cement, Steel, TMT, Bricks, etc.)\n\n🏭 Suppliers: List their products, receive buyer inquiries, and respond with quotes.\n\n🔒 RitzYard acts as a secure middleman — both sides communicate only through our chat. No direct contact sharing!\n\nAre you a Buyer or Supplier? I'll guide you from there!";
    }

    // ── BUYER FLOW — HOW TO BUY ──
    if (/buyer|buy|purchase|kharidna|khareedna|खरीदना|खरीदार|मुझे.*चाहिए|i .*buy|i am.*buyer|i want.*buy|material.*need|need.*material/.test(m)) {
      return isHindi
        ? "🛒 खरीदार के लिए RitzYard पर खरीदारी कैसे करें:\n\n📍 Step 1 — Products देखें\nWebsite: ritzyard.com पर जाएं → 'Products' या 'Categories' पर click करें → अपनी सामग्री खोजें (सीमेंट, स्टील, आदि)\n\n📝 Step 2 — Inquiry भेजें\nProduct page पर 'Get Quote' या 'Send Inquiry' button दबाएं → अपना नाम, मोबाइल, quantity, delivery location भरें → Submit करें\n\n🔔 Step 3 — Notification मिलेगी\nआपकी inquiry system में save होगी। RitzYard matched suppliers को alert भेजता है।\n\n💬 Step 4 — Supplier से Chat करें\nSupplier आपको quote देगा — आप platform के chat में उनसे बात कर सकते हैं। आपका contact number safe रहता है।\n\n✅ Step 5 — Best Quote चुनें\nकई suppliers के quotes compare करें और best deal लें!\n\nकोई step में problem है? बताइए! 🙏"
        : "🛒 How to BUY on RitzYard — Step by Step:\n\n📍 Step 1 — Browse Products\nVisit ritzyard.com → Click 'Products' or browse 'Categories' → Find your material (Cement, Steel, TMT, etc.)\n\n📝 Step 2 — Send an Inquiry / RFQ\nOn the product page, click 'Get Quote' or 'Send Inquiry' → Fill your name, phone, quantity, delivery location → Submit\n\n🔔 Step 3 — You Get Notified\nYour inquiry is saved in the system. RitzYard automatically matches it with verified suppliers.\n\n💬 Step 4 — Chat with Suppliers\nSuppliers respond with quotes via RitzYard chat. Your phone number stays private — all communication is safe.\n\n✅ Step 5 — Choose Best Quote\nCompare quotes from multiple suppliers and pick the best deal!\n\nStuck at any step? Just ask me! 😊";
    }

    // ── BUYER — HOW TO SUBMIT INQUIRY / RFQ ──
    if (/inquiry|rfq|quote|quotation|inquiry.*submit|inquiry.*kaise|inquiry.*bhejo|inquiry.*send|इंक्वायरी|inquiry कैसे|quotation.*kaise/.test(m)) {
      return isHindi
        ? "📝 Inquiry / RFQ कैसे भेजें:\n\n1️⃣ ritzyard.com पर जाएं\n2️⃣ कोई भी product page खोलें\n3️⃣ 'Get Quote' या 'Send Inquiry' button दबाएं\n4️⃣ यह जानकारी भरें:\n   • आपका नाम\n   • मोबाइल नंबर\n   • कंपनी का नाम (optional)\n   • सामग्री का नाम\n   • Quantity (कितना चाहिए)\n   • Delivery का पता\n5️⃣ Submit दबाएं ✅\n\nआपकी inquiry तुरंत save होगी और matched suppliers को WhatsApp alert भेजा जाएगा!\n\nध्यान रहे: आपका mobile number suppliers को नहीं दिखता — सब RitzYard chat के through होता है। 🔒"
        : "📝 How to Submit an Inquiry / RFQ:\n\n1️⃣ Go to ritzyard.com\n2️⃣ Open any product page\n3️⃣ Click 'Get Quote' or 'Send Inquiry'\n4️⃣ Fill in:\n   • Your name\n   • Mobile number\n   • Company name (optional)\n   • Material name\n   • Quantity needed\n   • Delivery address\n5️⃣ Click Submit ✅\n\nYour inquiry is instantly saved and matched suppliers get WhatsApp alerts!\n\nNote: Your mobile number is NEVER shown to suppliers — all communication is through RitzYard chat. 🔒";
    }

    // ── SUPPLIER FLOW — HOW TO REGISTER ──
    if (/supplier.*register|register.*supplier|sign up|signup|join.*supplier|supplier.*join|सप्लायर.*रजिस्टर|रजिस्ट्रेशन|supplier banna|सप्लायर बनना|how.*supplier|supplier.*kaise/.test(m)) {
      return isHindi
        ? "🏭 Supplier बनने के लिए RitzYard पर Registration कैसे करें:\n\n📍 Step 1 — Sign Up\nSupplier Portal: supplierportal.ritzyard.com → 'Register' button दबाएं\n\n📋 Step 2 — Company Details भरें\n• Company का नाम\n• GST Number\n• Business Type\n• आप कौन-कौन से products बेचते हैं (categories)\n• Contact details\n\n📄 Step 3 — Documents Upload करें\n• GST Certificate\n• PAN Card\n• Bank Proof\n\n⏳ Step 4 — Admin Approval का इंतज़ार करें\nRitzYard admin 24 घंटे में आपकी application verify करेगा।\n\n✅ Step 5 — Approved!\nApproval के बाद आप:\n→ Products add कर सकते हैं\n→ Buyer inquiries देख सकते हैं\n→ Chat कर के quotes दे सकते हैं\n\nRegistration में कोई problem है? बताइए! 🙏"
        : "🏭 How to Register as a Supplier on RitzYard:\n\n📍 Step 1 — Sign Up\nGo to Supplier Portal → Click 'Register / Join as Supplier'\n\n📋 Step 2 — Fill Company Details\n• Company name\n• GST Number\n• Business Type\n• What products you sell (categories)\n• Contact details\n\n📄 Step 3 — Upload Documents\n• GST Certificate\n• PAN Card\n• Bank Proof\n\n⏳ Step 4 — Wait for Admin Approval\nRitzYard admin verifies your application within 24 hours.\n\n✅ Step 5 — You're Approved!\nAfter approval you can:\n→ Add your products\n→ See buyer inquiries\n→ Chat and send quotes to buyers\n\nStuck at any step? Just tell me! 😊";
    }

    // ── SUPPLIER — HOW TO ADD PRODUCT ──
    if (/add.*product|product.*add|apna.*product|list.*product|product.*list|product.*kaise.*add|प्रोडक्ट.*add|add.*karo|product.*daalo/.test(m)) {
      return isHindi
        ? "📦 Product कैसे Add करें (Supplier के लिए):\n\n1️⃣ Supplier Portal में Login करें\n2️⃣ Left menu में 'Products' → '+ Add Product' click करें\n3️⃣ Product form भरें:\n   • Product का नाम (e.g., TMT Bars Fe 500)\n   • Category select करें (Steel, Cement, etc.)\n   • Description लिखें\n   • Price, Minimum Order, Delivery Time\n   • Grades, Brands, Certifications\n   • Product की photo upload करें\n4️⃣ 'Add to Account' button दबाएं\n5️⃣ Admin 24 घंटे में approve करेगा, फिर product live हो जाएगा!\n\n💡 Pro Tip: जब आप product add करते हैं, Right side में 'Recommended Buyers' दिखता है — वो buyers जो पहले से वैसा product ढूंढ रहे हैं! उनसे chat करें और deal करें। 🎯"
        : "📦 How to Add a Product (For Suppliers):\n\n1️⃣ Login to Supplier Portal\n2️⃣ Click 'Products' → '+ Add Product' in the menu\n3️⃣ Fill the product form:\n   • Product name (e.g., TMT Bars Fe 500)\n   • Select Category (Steel, Cement, etc.)\n   • Write Description\n   • Price, Min Order, Delivery Time\n   • Grades, Brands, Certifications\n   • Upload product photo\n4️⃣ Click 'Add to Account'\n5️⃣ Admin approves within 24 hours → Product goes LIVE!\n\n💡 Pro Tip: While adding a product, the right side shows 'Recommended Buyers' — buyers already searching for that product! Chat with them directly. 🎯";
    }

    // ── SUPPLIER — HOW TO SEE INQUIRIES ──
    if (/see.*inquiry|view.*inquiry|inquiry.*kahan|inquiry.*dekhe|inquiry.*kaise|buyer.*inquiry|inquiries.*supplier|notification|unread|badge|इंक्वायरी.*कहाँ|notification.*kaise/.test(m)) {
      return isHindi
        ? "🔔 Buyer की Inquiries कैसे देखें (Supplier के लिए):\n\n1️⃣ Supplier Portal में Login करें\n2️⃣ Menu में 'Products' → 'Buyer Inquiries' click करें\n3️⃣ आपको सभी inquiries दिखेंगी:\n   • 🔴 NEW — जो अभी तक नहीं देखी\n   • 🟡 RESPONDED — जिन पर reply दे दिया\n   • 🟣 QUOTED — जिन्हें quote दे दिया\n   • 🟢 CONVERTED — जो order बन गए\n\n🔢 Unread Badge: जब नई inquiry आती है, Menu icon पर लाल नंबर दिखता है।\n\n📱 WhatsApp Alert: जब buyer inquiry submit करता है, RitzYard आपको WhatsApp पर automatically notify करता है!\n\nChat खोलने के लिए 'Open Chat & Quote' button दबाएं। 💬"
        : "🔔 How to See Buyer Inquiries (For Suppliers):\n\n1️⃣ Login to Supplier Portal\n2️⃣ Click 'Products' → 'Buyer Inquiries' in menu\n3️⃣ You see all inquiries:\n   • 🔴 NEW — Not responded yet\n   • 🟡 RESPONDED — You replied\n   • 🟣 QUOTED — You sent a quote\n   • 🟢 CONVERTED — Became an order\n\n🔢 Unread Badge: Red number on menu icon shows new unread inquiries.\n\n📱 WhatsApp Alert: When a buyer submits an inquiry, RitzYard automatically alerts you on WhatsApp!\n\nClick 'Open Chat & Quote' to start chatting with the buyer. 💬";
    }

    // ── HOW CHAT WORKS ──
    if (/chat|message|contact|buyer.*contact|supplier.*contact|baat.*karna|communicate|chat.*kaise|chat कैसे/.test(m)) {
      return isHindi
        ? "💬 RitzYard Chat कैसे काम करता है:\n\n🔒 Privacy-First Design:\n• Buyer का phone number suppliers को नहीं दिखता\n• Supplier का phone number buyers को नहीं दिखता\n• सब कुछ RitzYard के secure chat से होता है\n\n📩 Buyer के लिए:\nInquiry submit करने के बाद आपको एक chat link मिलेगी जहाँ आप supplier के quotes देख सकते हैं।\n\n🏭 Supplier के लिए:\n1. 'Buyer Inquiries' page पर जाएं\n2. Inquiry card पर 'Open Chat & Quote' दबाएं\n3. Chat panel खुलेगा — Buyer की पूरी requirement दिखेगी (product, quantity, budget, location)\n4. अपना quote type करें → Enter दबाएं → भेज दिया! ✅\n\nChat में messages automatically refresh होते हैं हर 8 seconds! 🔄"
        : "💬 How RitzYard Chat Works:\n\n🔒 Privacy-First:\n• Buyer's phone is NEVER visible to suppliers\n• Supplier's contact is NEVER visible to buyers\n• All communication is through RitzYard's secure chat\n\n📩 For Buyers:\nAfter submitting inquiry, you get a chat link where you see supplier quotes.\n\n🏭 For Suppliers:\n1. Go to 'Buyer Inquiries' page\n2. Click 'Open Chat & Quote' on any inquiry card\n3. Chat panel opens — shows full buyer requirement (product, qty, budget, location)\n4. Type your quote → Press Enter → Sent! ✅\n\nMessages auto-refresh every 8 seconds! 🔄";
    }

    // ── SUPPLIER APPROVAL / STATUS ──
    if (/approv|status|pending|rejected|verify|verified|application|approve.*kab|approve.*kaise|status.*kaise|application.*status|अप्रूवल|स्टेटस/.test(m)) {
      return isHindi
        ? "⏳ Application Status कैसे Check करें:\n\n1️⃣ Supplier Portal पर जाएं\n2️⃣ 'Check Status' या 'Supplier Status' page पर click करें\n3️⃣ अपना registered email डालें → Status check करें\n\nStatus के मतलब:\n🟡 Pending — Admin review कर रहा है (24 घंटे)\n✅ Approved — आप login कर सकते हैं!\n❌ Rejected — Reason देखें और documents ठीक करें\n\nApproval के बाद:\n• Products add करें\n• Buyer inquiries देखें\n• Chat से orders पाएं\n\nKoi problem hai? Mujhe batao! 🙏"
        : "⏳ How to Check Your Application Status:\n\n1️⃣ Go to Supplier Portal\n2️⃣ Click 'Check Status' or 'Supplier Status'\n3️⃣ Enter your registered email → View status\n\nStatus meanings:\n🟡 Pending — Admin is reviewing (within 24 hours)\n✅ Approved — You can login!\n❌ Rejected — Check reason and fix your documents\n\nAfter approval:\n• Add your products\n• View buyer inquiries\n• Get orders through chat\n\nAny issue? Just ask! 😊";
    }

    // ── HOW RITZYARD MATCHES BUYER → SUPPLIER ──
    if (/match|how.*work|kaise.*kaam|kaam.*kaise|routing|automatic|system.*kaise|platform.*kaise|यह कैसे|काम कैसे/.test(m)) {
      return isHindi
        ? "⚙️ RitzYard का System कैसे काम करता है:\n\n1️⃣ Buyer एक inquiry submit करता है (product + quantity + location)\n\n2️⃣ RitzYard का AI system automatically उन suppliers को ढूंढता है जो उस category के products बेचते हैं\n\n3️⃣ Matched suppliers को:\n   • Supplier Portal में नई inquiry दिखती है (red badge)\n   • WhatsApp पर automatic alert आता है\n\n4️⃣ Supplier portal में login करके:\n   • Inquiry details देखें\n   • Chat खोलें\n   • Quote भेजें\n\n5️⃣ Buyer को quote मिलता है → वो best deal choose करता है\n\n🔒 पूरे process में दोनों का contact number protected रहता है। सब safe है! ✅"
        : "⚙️ How RitzYard's System Works:\n\n1️⃣ Buyer submits an inquiry (product + quantity + location)\n\n2️⃣ RitzYard's AI automatically finds suppliers who sell products in that category\n\n3️⃣ Matched suppliers receive:\n   • New inquiry in Supplier Portal (red badge)\n   • Automatic WhatsApp alert\n\n4️⃣ Supplier logs in → Views inquiry details → Opens chat → Sends quote\n\n5️⃣ Buyer receives the quote → Chooses the best deal\n\n🔒 Throughout this entire process, both buyer and supplier contact info stays completely protected. 100% safe! ✅";
    }

    // ── FORGOT PASSWORD / LOGIN ISSUES ──
    if (/forgot.*password|password.*forgot|login.*problem|login.*issue|can't.*login|password.*reset|पासवर्ड.*भूल|login.*nahi|password.*change/.test(m)) {
      return isHindi
        ? "🔑 Password भूल गए? ऐसे reset करें:\n\n1️⃣ Login page पर जाएं\n2️⃣ 'Forgot Password' link दबाएं\n3️⃣ अपना registered email डालें\n4️⃣ Email में reset link आएगा\n5️⃣ Link दबाएं → नया password set करें\n\nAbhi bhi problem hai? Support से contact करें:\n📧 Email: support@ritzyard.com\n📱 WhatsApp: +91 95592 62525"
        : "🔑 Forgot Password? Here's how to reset:\n\n1️⃣ Go to Login page\n2️⃣ Click 'Forgot Password'\n3️⃣ Enter your registered email\n4️⃣ You'll receive a reset link by email\n5️⃣ Click link → Set new password\n\nStill having issues? Contact support:\n📧 Email: support@ritzyard.com\n📱 WhatsApp: +91 95592 62525";
    }

    // ── MATERIALS — CEMENT ──
    if (/cement|सीमेंट/.test(m)) {
      return isHindi
        ? "🏗️ Cement के बारे में जानकारी:\n\nTypes:\n• OPC 43 Grade — सामान्य निर्माण के लिए ₹340-380/बैग\n• OPC 53 Grade — High strength के लिए ₹360-420/बैग\n• PPC — Road & bridges के लिए ₹320-400/बैग\n\nTop Brands: UltraTech, ACC, Ambuja, JK Cement, Shree Cement\n\nBulk (50+ bags) पर 5-12% discount!\n\nRitzYard पर cement के लिए inquiry कैसे दें? बताइए! 🙏"
        : "🏗️ Cement Information:\n\nTypes:\n• OPC 43 Grade — General construction ₹340-380/bag\n• OPC 53 Grade — High strength ₹360-420/bag\n• PPC — Roads & bridges ₹320-400/bag\n\nTop Brands: UltraTech, ACC, Ambuja, JK Cement, Shree Cement\n\n5-12% discount on bulk orders (50+ bags)!\n\nWant to buy cement on RitzYard? I'll guide you!";
    }

    // ── MATERIALS — STEEL / TMT ──
    if (/steel|tmt|स्टील|टीएमटी/.test(m)) {
      return isHindi
        ? "⚙️ TMT Steel Bars की जानकारी:\n\nGrades:\n• Fe 415 — ₹50-55/kg\n• Fe 500 — ₹52-57/kg\n• Fe 550 — ₹54-59/kg\n\nSizes: 8mm, 10mm, 12mm, 16mm, 20mm, 25mm\n\nTop Brands: Tata Tiscon, JSW Neosteel, SAIL, Jindal, Kamdhenu\n\nDelivery: 3-5 दिन pan-India\nBulk (10+ tons): 3-5% extra discount\n\nRitzYard पर steel inquiry submit करें? 🔧"
        : "⚙️ TMT Steel Bars Information:\n\nGrades:\n• Fe 415 — ₹50-55/kg\n• Fe 500 — ₹52-57/kg\n• Fe 550 — ₹54-59/kg\n\nSizes: 8mm, 10mm, 12mm, 16mm, 20mm, 25mm\n\nTop Brands: Tata Tiscon, JSW Neosteel, SAIL, Jindal, Kamdhenu\n\nDelivery: 3-5 days pan-India\nBulk (10+ tons): 3-5% extra discount\n\nWant to submit a steel inquiry on RitzYard? 🔧";
    }

    // ── MATERIALS — BRICKS ──
    if (/brick|ईंट/.test(m)) {
      return isHindi
        ? "🧱 Bricks की जानकारी:\n\n• Red Clay Bricks — ₹6-9/piece\n• Fly Ash Bricks — ₹3.5-5.5/piece (eco-friendly)\n• AAC Blocks — ₹45-70/block (lightweight)\n• Concrete Blocks — ₹18-35/piece\n\nMin Order: 5,000 pieces\nFree delivery: ₹50,000+ orders पर\n\nRitzYard पर brick suppliers ढूंढें! 🏗️"
        : "🧱 Bricks Information:\n\n• Red Clay Bricks — ₹6-9/piece\n• Fly Ash Bricks — ₹3.5-5.5/piece (eco-friendly)\n• AAC Blocks — ₹45-70/block (lightweight)\n• Concrete Blocks — ₹18-35/piece\n\nMin Order: 5,000 pieces\nFree delivery on orders above ₹50,000\n\nFind brick suppliers on RitzYard! 🏗️";
    }

    // ── ORDERS ──
    if (/order|track.*order|order.*track|order.*kahan|order.*status|ऑर्डर/.test(m)) {
      return isHindi
        ? "📦 Orders RitzYard पर कैसे काम करते हैं:\n\nBuyer के लिए:\n• Supplier quote accept करने के बाद order create होता है\n• Supplier Portal → Orders page पर सब दिखता है\n\nSupplier के लिए:\n1. Portal में 'Orders' menu पर click करें\n2. Pending, Processing, Delivered — सब status दिखेगी\n3. Delivery details update करें\n\nOrder tracking और updates RitzYard chat के through होते हैं। 🚚"
        : "📦 How Orders Work on RitzYard:\n\nFor Buyers:\n• Order is created after accepting a supplier quote\n• Track via Supplier Portal → Orders page\n\nFor Suppliers:\n1. Click 'Orders' in portal menu\n2. See Pending, Processing, Delivered statuses\n3. Update delivery details\n\nAll order tracking and updates happen through RitzYard chat. 🚚";
    }

    // ── HELP / SUPPORT ──
    if (/help|support|problem|issue|stuck|samajh.*nahi|samajh.*na|problem.*hai|kuch.*samajh|मदद|मैं.*फंस|मुझे.*मदद/.test(m)) {
      return isHindi
        ? "🆘 मैं आपकी मदद के लिए यहाँ हूं! बताइए:\n\n• 'मैं खरीदार हूं' — अगर आप कुछ खरीदना चाहते हैं\n• 'मैं सप्लायर हूं' — अगर आप बेचना चाहते हैं\n• 'Registration' — कैसे join करें\n• 'Inquiry' — Quote कैसे मांगें\n• 'Chat' — Suppliers से कैसे बात करें\n• 'Product add' — अपना product कैसे list करें\n• 'Status check' — Application status\n\nया सीधे अपनी problem बताइए — मैं step by step guide करूंगा! 🙏"
        : "🆘 I'm here to help! Tell me what you need:\n\n• 'I am a buyer' — If you want to purchase materials\n• 'I am a supplier' — If you want to sell\n• 'Registration' — How to join\n• 'Inquiry' — How to request a quote\n• 'Chat' — How to talk to suppliers\n• 'Add product' — How to list your product\n• 'Status' — Check application status\n\nOr just describe your problem — I'll guide you step by step! 😊";
    }

    // ── GREETINGS (thank you, etc.) ──
    if (/thank|thanks|shukriya|dhanyawad|धन्यवाद|शुक्रिया/.test(m)) {
      return isHindi
        ? "आपका स्वागत है! 🙏 RitzYard पर खुशी से काम करने के लिए मैं हमेशा यहाँ हूं। कोई और सवाल हो तो बताइए!"
        : "You're welcome! 😊 I'm always here to help you on RitzYard. Feel free to ask anything anytime!";
    }

    if (/how are you|kaisa ho|aap kaise|आप कैसे/.test(m)) {
      return isHindi
        ? "मैं बिल्कुल ठीक हूं और आपकी मदद के लिए तैयार! 😊 RitzYard platform के बारे में कुछ जानना है?"
        : "I'm doing great and ready to help! 😊 What would you like to know about RitzYard?";
    }

    // ── DEFAULT — SMART FALLBACK ──
    return isHindi
      ? `मैं समझ रहा हूं आप "${userMessage}" के बारे में पूछ रहे हैं। 🤔\n\nमैं इन topics में मदद कर सकता हूं:\n\n🛒 खरीदारी के लिए → 'मैं खरीदार हूं'\n🏭 बेचने के लिए → 'मैं सप्लायर हूं'\n📝 Inquiry कैसे दें\n💬 Chat कैसे करें\n📦 Product कैसे add करें\n✅ Approval status\n🔑 Login / Password help\n\nकृपया थोड़ा और detail में बताएं — मैं पूरा step-by-step guide करूंगा! 🙏`
      : `I see you're asking about "${userMessage}". 🤔\n\nI can help with:\n\n🛒 Buying materials → Say 'I am a buyer'\n🏭 Selling products → Say 'I am a supplier'\n📝 How to submit an inquiry\n💬 How chat works\n📦 How to add a product\n✅ Approval status check\n🔑 Login / Password help\n\nPlease tell me a bit more and I'll guide you step by step! 😊`;
  };

  // ENHANCEMENT 1: Analyze market trends and generate recommendations
  const analyzeMarketTrends = (): MarketAnalysis => {
    const hotProducts = (contextData.hotProducts?.slice(0, 5).map((p: Record<string, unknown>) => String(p.category)) || [
      'Cement', 'Steel/TMT', 'Bricks'
    ]) as string[];
    
    const priceTrends: Record<string, {trend: string, change: number}> = {
      'Cement': { trend: 'Stable', change: 0 },
      'Steel': { trend: 'Declining', change: -2.5 },
      'TMT Bars': { trend: 'Stable', change: 0 },
      'Bricks': { trend: 'Rising', change: 1.2 }
    };
    
    const supplierInsights = {
      count: (contextData.marketInsights?.suppliersCount as number) || 500,
      topSuppliers: ['Tata Steel', 'ACC Cement', 'UltraTech', 'JSW Steel', 'Ambuja'],
      avgRating: 4.6
    };
    
    const demandMetrics = {
      highDemand: ['Cement', 'Steel/TMT', 'Bricks'],
      mediumDemand: ['Paint', 'Electrical'],
      lowDemand: ['Specialty Materials']
    };
    
    return {
      hotProducts,
      priceTrends,
      supplierInsights,
      demandMetrics
    };
  };

  // ENHANCEMENT 2: Get better supplier recommendations based on context
  const getSupplierRecommendations = (material: string, quantity: number, location: string): string => {
    const recommendations: Record<string, string> = {
      'Cement': 'For cement in bulk, I recommend UltraTech or ACC. Both offer competitive pricing (₹340-420/bag), certified quality, and deliver within 3-5 days pan-India. Bulk discounts available for 100+ bags.',
      'Steel': 'Top steel suppliers: Tata Tiscon and JSW Neosteel. Current rates: Fe 415 ₹52-58/kg. For bulk orders (5+ tons), expect 2-5% discount. Both brands guarantee quality certifications.',
      'TMT Bars': 'Best TMT suppliers: Tata Tiscon, JSW, SAIL. Grades Fe 500/550 available. Competitive pricing: ₹50-57/kg depending on grade. Priority delivery in metros (24-48 hours).',
      'Bricks': 'Local suppliers recommended for bricks. Red clay (₹6-9/pc), Fly Ash (₹3.5-5.5/pc), AAC Blocks (₹45-70/block). Min order 5000 pcs for free delivery.'
    };
    
    return recommendations[material] || 
      `For ${material}, I recommend requesting quotes from 3-5 suppliers to compare pricing and delivery terms. Our platform has 500+ verified suppliers.`;
  };

  // ENHANCEMENT 3: Send real-time notifications
  const sendNotification = (type: NotificationData['type'], title: string, message: string) => {
    const notification: NotificationData = {
      type,
      title,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep last 5
  };

  // ENHANCEMENT 4: Analyze user conversation for better context
  const updateConversationContext = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Detect user type
    if (lowerMessage.includes('sell') || lowerMessage.includes('supplier')) {
      setConversationContext(prev => ({...prev, userType: 'supplier'}));
    } else if (lowerMessage.includes('buy') || lowerMessage.includes('need')) {
      setConversationContext(prev => ({...prev, userType: 'buyer'}));
    }
    
    // Track materials of interest
    const materials = ['cement', 'steel', 'tmt', 'brick', 'sand', 'paint', 'electrical'];
    const mentioned = materials.filter(m => lowerMessage.includes(m));
    if (mentioned.length > 0) {
      setConversationContext(prev => ({
        ...prev,
        materialOfInterest: Array.from(new Set([...prev.materialOfInterest, ...mentioned]))
      }));
    }
    
    // Track recent queries
    setConversationContext(prev => ({
      ...prev,
      recentQueries: [message, ...prev.recentQueries].slice(0, 5)
    }));
  };

  // ENHANCEMENT 5: Generate more conversational follow-up questions
  const generateFollowUpQuestion = (topic: string): string => {
    const followUps: Record<string, string[]> = {
      'cement': [
        'Would you like to know about different cement grades and their uses?',
        'Are you interested in bulk pricing for large quantities?',
        'Do you need delivery to a specific location?'
      ],
      'steel': [
        'Which steel grade interests you most - Fe 415, Fe 500, or Fe 550?',
        'What quantity are you planning to order?',
        'Do you prefer any specific steel supplier/brand?'
      ],
      'supplier': [
        'Would you like me to compare quotes from multiple suppliers?',
        'Are you looking for suppliers in a specific region?',
        'Do you have any special requirements or certifications needed?'
      ]
    };
    
    const questions = followUps[topic] || [
      'Would you like more details about this?',
      'Can you provide any specific requirements?',
      'Would you like to compare options?'
    ];
    
    return questions[Math.floor(Math.random() * questions.length)];
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: inputText,
      timestamp: new Date(),
    };

    // Update conversation context with this message
    updateConversationContext(inputText);

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsProcessing(true);

    // Get AI response
    try {
      const miloResponseText = await getMiloResponse(currentInput);
      
      setTimeout(() => {
        const miloMessage: Message = {
          role: "milo",
          content: miloResponseText,
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, miloMessage]);
        setIsProcessing(false);
        
        // Speak response
        speakText(miloResponseText, language);
      }, 800);
    } catch (error) {
      setIsProcessing(false);
      const errorMessage: Message = {
        role: "milo",
        content: "I apologize, I'm having trouble processing that. Please try again or rephrase your question.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Reset conversation
  const resetConversation = () => {
    setMessages([]);
    setHasGreeted(false);
    window.speechSynthesis.cancel();
  };

  // Quick material actions
  const quickActions = language === 'hi-IN' ? [
    { label: "मैं खरीदार हूं", icon: "🛒", query: "मैं खरीदार हूं — मुझे सामग्री खरीदनी है" },
    { label: "मैं सप्लायर हूं", icon: "🏭", query: "मैं सप्लायर हूं — मुझे join करना है" },
    { label: "Inquiry कैसे दें", icon: "📝", query: "Inquiry या RFQ कैसे submit करें" },
    { label: "Chat कैसे करें", icon: "💬", query: "Buyer और Supplier chat कैसे करते हैं" },
    { label: "Product Add करें", icon: "📦", query: "Supplier product कैसे add करें" },
    { label: "RitzYard क्या है", icon: "🏗️", query: "RitzYard platform क्या है और कैसे काम करता है" },
  ] : [
    { label: "I'm a Buyer", icon: "🛒", query: "I am a buyer — how do I buy materials on RitzYard?" },
    { label: "I'm a Supplier", icon: "🏭", query: "I am a supplier — how do I register and sell on RitzYard?" },
    { label: "Submit Inquiry", icon: "📝", query: "How do I submit an inquiry or RFQ?" },
    { label: "How Chat Works", icon: "💬", query: "How does the buyer-supplier chat work?" },
    { label: "Add Product", icon: "📦", query: "How does a supplier add a product?" },
    { label: "What is RitzYard", icon: "🏗️", query: "What is RitzYard and how does it work?" },
  ];

  const handleQuickAction = (query: string) => {
    setInputText(query);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle relative overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-10 left-5 md:top-20 md:left-10 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-primary/20 to-primary-glow/10 rounded-full blur-3xl opacity-50 animate-float"></div>
        <div className="absolute bottom-10 right-5 md:bottom-20 md:right-20 w-80 h-80 md:w-[500px] md:h-[500px] bg-gradient-to-br from-secondary/15 to-primary/10 rounded-full blur-3xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 md:left-1/3 w-60 h-60 md:w-80 md:h-80 bg-gradient-to-br from-primary-glow/20 to-secondary/10 rounded-full blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Main Content - Scrollable */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-5xl mx-auto">
          
          {/* Chat Window - Scrollable Design */}
          <div className="glass-card shadow-2xl overflow-hidden rounded-2xl md:rounded-3xl flex flex-col" style={{ 
            minHeight: '80vh',
            maxHeight: '85vh'
          }}>
            
            {/* Header - Elegant Responsive Design */}
            <div className="relative overflow-hidden flex-shrink-0">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-glow to-secondary opacity-95"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              
              <div className="relative p-3 sm:p-4 md:p-4 lg:p-5">
                <div className="flex items-center justify-between flex-wrap gap-3 md:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <div className="relative group">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-white/95 flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 ${
                        isSpeaking ? 'ring-4 ring-white/60 scale-110' : ''
                      }`}>
                        <span className="text-2xl sm:text-3xl md:text-4xl">🤖</span>
                      </div>
                      {isSpeaking && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-green-400 rounded-full animate-pulse border-2 sm:border-3 border-white shadow-lg" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg md:text-xl lg:text-2xl flex items-center gap-1 sm:gap-2">
                        {language === "en-IN" ? "Milo AI" : "मिलो एआई"}
                        
                      </h3>
                      <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium">
                        {language === "en-IN" ? "RitzYard Procurement Expert" : "RitzYard खरीद विशेषज्ञ"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* Language Switcher - Responsive Glass Design */}
                    <div className="flex bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl p-1 sm:p-1.5 gap-1 sm:gap-1.5 border border-white/20">
                      <button
                        onClick={() => setLanguage("en-IN")}
                        className={`px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                          language === "en-IN" 
                            ? 'bg-white text-primary shadow-xl scale-105' 
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage("hi-IN")}
                        className={`px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 ${
                          language === "hi-IN" 
                            ? 'bg-white text-primary shadow-xl scale-105' 
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        हिंदी
                      </button>
                    </div>
                    
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="p-2 sm:p-2.5 md:p-3 hover:bg-white/20 rounded-lg sm:rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                      ) : (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/50" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Status Indicators - Responsive */}
                <div className="flex items-center gap-2 sm:gap-3 md:gap-3 mt-2 sm:mt-3 md:mt-3 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-3 py-1 sm:py-1.5 md:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] sm:text-xs md:text-xs font-medium">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
                    <span className="hidden sm:inline">
                      {isSpeaking 
                        ? (language === "en-IN" ? '🔊 Speaking...' : '🔊 बोल रहा है...') 
                        : isProcessing 
                        ? (language === "en-IN" ? '💭 Thinking...' : '💭 सोच रहा है...') 
                        : (language === "en-IN" ? '✨ Online & Ready' : '✨ ऑनलाइन और तैयार')
                      }
                    </span>
                    <span className="sm:hidden">
                      {isSpeaking ? '🔊' : isProcessing ? '💭' : '✨'}
                    </span>
                  </div>
                  {soundEnabled && (
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] sm:text-xs md:text-sm font-medium">
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{language === "en-IN" ? "Voice Active" : "आवाज़ सक्रिय"}</span>
                      <span className="sm:hidden">{language === "en-IN" ? "Voice" : "आवाज़"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages Area - Fully Responsive */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 lg:p-6 space-y-3 sm:space-y-4 md:space-y-4 bg-gradient-to-br from-background/30 via-muted/20 to-accent/10"
              style={{ maxHeight: 'calc(80vh - 280px)', minHeight: '300px' }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="relative mb-6 md:mb-8">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-primary/20 via-primary-glow/15 to-secondary/10 flex items-center justify-center backdrop-blur-xl border border-primary/30 shadow-2xl animate-float">
                      <span className="text-5xl md:text-6xl">🤖</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
                    <span className="text-gradient">
                      {language === "en-IN" ? "Hello! I'm Milo" : "नमस्ते! मैं मिलो हूं"}
                    </span>
                  </h3>
                  <p className="text-muted-foreground mb-6 md:mb-8 max-w-lg text-base md:text-lg leading-relaxed">
                    {language === "en-IN" 
                      ? "Your intelligent AI assistant for construction materials, real-time pricing, supplier matching, and procurement insights!" 
                      : "आपका बुद्धिमान AI सहायक निर्माण सामग्री, रीयल-टाइम मूल्य, आपूर्तिकर्ता मिलान और खरीद जानकारी के लिए!"}
                  </p>
                  
                  {/* Quick Action Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.query)}
                        className="group glass-card-hover p-4 md:p-5 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                            <span className="text-3xl md:text-4xl">{action.icon}</span>
                          </div>
                          <span className="text-xs md:text-sm font-semibold text-foreground group-hover:text-primary transition-colors text-center leading-tight">
                            {action.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] ${message.role === "user" ? "" : "flex items-start gap-3"}`}>
                      {message.role === "milo" && (
                        <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary/90 to-secondary shadow-xl flex items-center justify-center shrink-0 border-2 border-white/50">
                          <span className="text-xl md:text-2xl">🤖</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div
                          className={`px-5 py-4 rounded-3xl shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-primary via-primary-glow to-secondary text-white border border-white/20"
                              : "glass-card text-foreground"
                          }`}
                        >
                          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-3">
                          <span className="text-xs text-muted-foreground font-medium">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {isProcessing && (
                <div className="flex justify-start animate-slide-up">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary/90 to-secondary shadow-xl flex items-center justify-center border-2 border-white/50">
                      <span className="text-xl md:text-2xl">🤖</span>
                    </div>
                    <div className="glass-card px-6 py-4 rounded-3xl shadow-lg">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-glow rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Fully Responsive Modern Glass Design */}
            <div className="relative flex-shrink-0">
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary-glow/5 to-secondary/5"></div>
              
              <div className="relative p-3 sm:p-4 md:p-4 lg:p-5 border-t border-primary/10">
                <div className="flex gap-2 sm:gap-3 md:gap-4">
                  {/* Microphone Button - Responsive */}
                  <button
                    onClick={toggleListening}
                    className={`group shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl ${
                      isListening 
                        ? 'bg-gradient-to-br from-primary via-primary-glow to-secondary scale-105 shadow-2xl' 
                        : 'glass-card hover:scale-105 hover:shadow-2xl'
                    }`}
                  >
                    {isListening ? (
                      <div className="relative">
                        <MicOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </button>

                  {/* Input Field - Responsive */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={language === "en-IN" ? "Ask me anything..." : "मुझसे कुछ भी पूछें..."}
                      className="w-full px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-4 md:py-5 glass-card rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 text-xs sm:text-sm md:text-base font-medium placeholder:text-muted-foreground/60 shadow-lg hover:shadow-xl transition-all duration-300"
                    />
                  </div>

                  {/* Send Button - Responsive */}
                  <button
                    onClick={sendMessage}
                    disabled={!inputText.trim() || isProcessing}
                    className="group shrink-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:hover:shadow-xl"
                  >
                    <Send className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
                
                {/* Status Footer - Responsive */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-3 sm:mt-4 md:mt-5 text-[10px] sm:text-xs md:text-sm flex-wrap">
                  <div className="flex items-center gap-1 sm:gap-2 text-muted-foreground">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                    <span className="font-medium">{language === "en-IN" ? "Secure" : "सुरक्षित"}</span>
                  </div>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-muted-foreground font-medium hidden sm:inline">{language === "en-IN" ? "24/7 Available" : "24/7 उपलब्ध"}</span>
                  <span className="sm:hidden text-muted-foreground font-medium">24/7</span>
                  <span className="text-muted-foreground/50">•</span>
                  <span className="text-gradient font-semibold">
                    {language === "en-IN" ? "🌐 EN" : "🌐 हि"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiloAI;
