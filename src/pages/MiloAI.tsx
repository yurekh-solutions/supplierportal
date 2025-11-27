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
  const [language, setLanguage] = useState<"en-IN" | "hi-IN">("en-IN");
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
      
      // Announce language change
      const langChangeText = language === "en-IN"
        ? "Switched to English. How can I help you?"
        : "हिंदी में बदल गया। मैं आपकी कैसे मदद कर सकता हूं?";
      
      setTimeout(() => {
        speakText(langChangeText, language);
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

  // Speak text using Web Speech API with MALE voice ONLY
  const speakText = (text: string, lang: string) => {
    if (!soundEnabled) return;
    
    // Cancel any ongoing speech to prevent looping
    window.speechSynthesis.cancel();
    
    synthesisRef.current = new SpeechSynthesisUtterance(text);
    synthesisRef.current.lang = lang;
    synthesisRef.current.rate = 0.95;
    synthesisRef.current.pitch = 0.6; // Lower pitch for male voice
    synthesisRef.current.volume = 1.0;
    
    // FORCE male voice selection - enhanced for Hindi support
    const setMaleVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const langCode = lang.split("-")[0]; // 'en' or 'hi'
      
      console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
      
      // Priority 1: Find explicit male voice for the language
      let maleVoice = voices.find(voice => {
        const nameLower = voice.name.toLowerCase();
        const langMatch = voice.lang.toLowerCase().startsWith(langCode);
        
        // Male voice indicators (expanded for Hindi)
        const isMale = nameLower.includes('male') || 
                       nameLower.includes('man') ||
                       nameLower.includes('rishi') || // Hindi male
                       nameLower.includes('david') ||
                       nameLower.includes('james') ||
                       nameLower.includes('daniel') ||
                       nameLower.includes('tom') ||
                       nameLower.includes('alex') ||
                       nameLower.includes('google हिन्दी') || // Google Hindi (usually male)
                       (langCode === 'hi' && nameLower.includes('hindi') && !nameLower.includes('female'));
        
        return langMatch && isMale;
      });
      
      // Priority 2: Exclude female voices
      if (!maleVoice) {
        maleVoice = voices.find(voice => {
          const nameLower = voice.name.toLowerCase();
          const langMatch = voice.lang.toLowerCase().startsWith(langCode);
          
          const isFemale = nameLower.includes('female') || 
                          nameLower.includes('woman') ||
                          nameLower.includes('lekha') || // Hindi female
                          nameLower.includes('samantha') ||
                          nameLower.includes('victoria') ||
                          nameLower.includes('kate') ||
                          nameLower.includes('siri') ||
                          nameLower.includes('zira');
          
          return langMatch && !isFemale;
        });
      }
      
      // Priority 3: Any voice matching language
      if (!maleVoice) {
        maleVoice = voices.find(v => v.lang.toLowerCase().startsWith(langCode));
      }
      
      if (maleVoice) {
        synthesisRef.current!.voice = maleVoice;
        console.log('✅ Selected voice:', maleVoice.name, '(', maleVoice.lang, ')');
      } else {
        console.warn('⚠️ No suitable voice found for', lang);
      }
    };

    // Handle voice loading with proper initialization
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setMaleVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setMaleVoice();
      };
    }

    synthesisRef.current.onstart = () => setIsSpeaking(true);
    synthesisRef.current.onend = () => {
      setIsSpeaking(false);
      // Ensure speech is fully stopped
      window.speechSynthesis.cancel();
    };
    synthesisRef.current.onerror = () => {
      setIsSpeaking(false);
      window.speechSynthesis.cancel();
    };
    
    // Small delay to ensure voice is set
    setTimeout(() => {
      window.speechSynthesis.speak(synthesisRef.current!);
    }, 100);
  };

  // Smart hash generator for detecting similar queries
  const generateQueryHash = (query: string): string => {
    // Normalize query: lowercase, remove punctuation, trim
    const normalized = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .sort() // Sort words to catch reordered questions
      .join(' ');
    return normalized;
  };

  // Get AI response - Smart intelligent fallback system
  const getMiloResponse = async (userMessage: string): Promise<string> => {
    // Generate hash for this query
    const queryHash = generateQueryHash(userMessage);
    
    // Check if this is a repeated question
    const isRepeatedQuery = queryHash === lastQueryHash;
    
    console.log('🚀 RitzYard AI processing:', userMessage);
    
    // Build smart context for better responses
    const conversationHistory = messages.slice(-3)
      .map(m => `${m.role === 'user' ? 'User' : 'Milo'}: ${m.content}`)
      .join('\n');
    
    setLastQueryHash(queryHash);
    
    // Smart contextual responses based on keywords (instant, no API needed)
    const lowerMessage = userMessage.toLowerCase();
    
    // Geography questions
    if (lowerMessage.includes('china')) {
      const responses = [
        "China is the world's most populous country and second-largest economy. It's located in East Asia and is known for its rich history, manufacturing prowess, and as a major exporter of construction materials like cement, steel, and TMT bars to countries like India.",
        "China, officially the People's Republic of China, is a major global economic power. Key cities include Beijing (capital), Shanghai (financial hub), and Shenzhen (tech center). It's also a leading supplier of construction materials worldwide.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('dubai')) {
      const responses = [
        "Dubai is the most populous city in the United Arab Emirates (UAE). Famous for the Burj Khalifa (world's tallest building), luxury shopping, and modern architecture. It's a major business and tourism hub in the Middle East.",
        "Dubai is a global city and business hub in the UAE, known for innovation in construction and real estate. Home to landmarks like Palm Jumeirah, Burj Al Arab, and Dubai Mall. A key center for international trade and commerce.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('india')) {
      const responses = [
        "India is the world's largest democracy and seventh-largest country by area. With 1.4+ billion people, it's incredibly diverse with 28 states, multiple languages, and a rapidly growing economy focused on services, manufacturing, and agriculture.",
        "India is a South Asian nation with rich cultural heritage and diversity. Major cities include New Delhi (capital), Mumbai (financial capital), and Bangalore (tech hub). Known for its IT industry, construction boom, and growing infrastructure projects.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerMessage.includes('ss') || lowerMessage.includes('stainless steel')) {
      return "SS (Stainless Steel) is a corrosion-resistant alloy containing chromium. Common grades: SS 304 (₹180-220/kg) for general use, SS 316 (₹250-300/kg) for marine/chemical environments. Used in pipes, tanks, utensils, and construction. RitzYard can help source verified SS suppliers. Need a specific grade?";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('मूल्य') || lowerMessage.includes('कीमत')) {
      return "मैं निर्माण सामग्री के लिए रीयल-टाइम मूल्य निर्धारण प्रदान कर सकता हूं। RitzYard 500+ सत्यापित आपूर्तिकर्ताओं से प्रतिस्पर्धी उद्धरण प्रदान करता है। आप किन सामग्रियों के लिए मूल्य निर्धारण की आवश्यकता है? (सीमेंट, स्टील, टीएमटी बार, ईंटें, आदि)";
    }
    
    if (lowerMessage.includes('cement') || lowerMessage.includes('सीमेंट')) {
      return "सीमेंट कई प्रकारों में उपलब्ध है: ओपीसी 43/53 ग्रेड ₹340-420/बैग, पीपीसी ₹320-400/बैग, पीएससी ₹330-410/बैग। ब्रांड: UltraTech, ACC, Ambuja, JK Cement। बल्क ऑर्डर पर 5-12% छूट। विस्तृत उद्धरण चाहिए?";
    }

    if (lowerMessage.includes("steel") || lowerMessage.includes("tmt") || lowerMessage.includes("स्टील")) {
      return "टीएमटी स्टील बार Fe 415, Fe 500, Fe 550 ग्रेड में उपलब्ध हैं। वर्तमान बाजार दरें: 8मिमी ₹52-58/किग्रा, 10मिमी ₹51-57/किग्रा, 12मिमी ₹50-56/किग्रा। शीर्ष ब्रांड: Tata Tiscon, JSW, SAIL। 3-5 दिन में डिलीवरी। उद्धरण चाहिए?";
    }

    if (lowerMessage.includes("brick") || lowerMessage.includes("ईंट")) {
      return "हम आपूर्ति करते हैं: लाल मिट्टी की ईंटें (₹6-9/पीस), फ्लाई एश ईंटें (₹3.5-5.5/पीस), AAC ब्लॉक (₹45-70/ब्लॉक)। न्यूनतम आदेश 5000 पीस, मुफ्त डिलीवरी। कौन सी प्रकार की ईंटें आप चाहते हैं?";
    }

    if (lowerMessage.includes("supplier") || lowerMessage.includes("आपूर्तिकर्ता")) {
      return "RitzYard के पास 28 राज्यों में 500+ सत्यापित आपूर्तिकर्ता हैं। सभी गुणवत्ता जांच से गुजरते हैं, सत्यापित जीएसटी हैं, और 98% समय पर डिलीवरी बनाए रखते हैं। आप क्या सामग्री खरीद रहे हैं?";
    }

    if (lowerMessage.includes("rfq") || lowerMessage.includes("quotation") || lowerMessage.includes("अनुरोध")) {
      return "मैं तुरंत एक RFQ बना सकता हूं! बस मुझे बताएं: 1) सामग्री का प्रकार, 2) आवश्यक मात्रा, 3) डिलीवरी स्थान, 4) समयसीमा। आपको 2 घंटे में कई आपूर्तिकर्ताओं से प्रतिस्पर्धी उद्धरण मिलेंगे।";
    }

    if (lowerMessage.includes("delivery") || lowerMessage.includes("shipping") || lowerMessage.includes("डिलीवरी")) {
      return "RitzYard पूरे भारत में डिलीवरी प्रदान करता है रीयल-टाइम ट्रैकिंग के साथ। मानक डिलीवरी: 3-7 दिन, एक्सप्रेस: 24-48 घंटे (मेट्रो शहर)। ₹50,000 से ऊपर के ऑर्डर पर मुफ्त डिलीवरी। बीमा और गुणवत्ता जांच शामिल। हमें कहां डिलीवर करना चाहिए?";
    }

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("नमस्ते")) {
      return "नमस्ते! मैं Milo हूं, आपका एआई खरीद विशेषज्ञ। मैं सामग्री मूल्य निर्धारण, आपूर्तिकर्ता चयन, RFQ निर्माण, डिलीवरी ट्रैकिंग और बाजार बुद्धिमत्ता में आपकी मदद कर सकता हूं। आज आप कौन सी निर्माण सामग्री खोज रहे हैं?";
    }

    if (lowerMessage.includes("thank") || lowerMessage.includes("धन्यवाद")) {
      return "आपका स्वागत है! निर्माण सामग्री, मूल्य निर्धारण, या आपूर्तिकर्ताओं के बारे में कुछ भी पूछने के लिए स्वतंत्र महसूस करें। मैं आपकी खरीद आवश्यकताओं में मदद करने के लिए 24/7 यहां हूं!";
    }

    if (lowerMessage.includes("how are you") || lowerMessage.includes("आप कैसे हैं")) {
      return "मैं बिल्कुल ठीक हूं और आपकी सहायता के लिए तैयार हूं! मेरा एआई निर्माण सामग्री और बाजार प्रवृत्तियों के बारे में लगातार सीख रहा है। मैं आपकी खरीद आवश्यकताओं में क्या मदद कर सकता हूं?";
    }

    return `यह एक दिलचस्प सवाल है। RitzYard के एआई सहायक के रूप में, मैं निर्माण सामग्री खरीद में विशेषज्ञता रखता हूं। मैं आपको मूल्य निर्धारण, आपूर्तिकर्ता, RFQ, डिलीवरी लॉजिस्टिक्स, और बाजार बुद्धिमत्ता में सीमेंट, स्टील, टीएमटी बार, ईंटें, रेत, आदि के लिए मदद कर सकता हूं। क्या आप अपकी विशिष्ट आवश्यकताओं के बारे में और बता सकते हैं?`;
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
      count: contextData.marketInsights?.suppliersCount || 500,
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
  const quickActions = [
    { label: "TMT Bars", icon: "🔩" },
    { label: "Cement", icon: "🏗️" },
    { label: "Bricks", icon: "🧱" },
  ];

  const handleQuickAction = (material: string) => {
    setInputText(`Tell me about ${material}`);
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 w-full max-w-2xl">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.label)}
                        className="group glass-card-hover p-4 md:p-5 transition-all duration-300"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                            <span className="text-3xl md:text-4xl">{action.icon}</span>
                          </div>
                          <span className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors">
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
