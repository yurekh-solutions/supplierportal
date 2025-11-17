import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Menu, X, Package, FileCheck, Zap, Users, Phone, ShieldCheck, Mail, MapPin, Star, Sparkles, TrendingUp, Award, Globe, ChevronRight, Clock, BarChart3, Headphones, Truck, ShoppingCart, Target, Lock, MessageCircle, BadgeCheck, CheckCircle2, Percent, DollarSign, Boxes, TrendingDown } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Card } from '@/pages/components/ui/card';
import LanguageSwitcher from './components/LanguageSwitcher';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);

  const carouselImages = [
    {
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
      title: 'Construction Materials',
      subtitle: 'Premium Quality Products'
    },
    {
      url: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&h=600&fit=crop',
      title: 'Building Supplies',
      subtitle: 'Comprehensive Inventory'
    },
    {
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
      title: 'Quality Products',
      subtitle: 'Certified & Verified'
    },
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
      title: 'Professional Service',
      subtitle: '24/7 Support Available'
    },
  ];

  const onboardingSteps = [
    {
      number: '01',
      title: 'Create Your Account',
      description: 'Sign up with your business details. Quick and simple registration form with just essential information.',
      icon: Package,
      image: 'https://images.unsplash.com/photo-1554224311-beee1f0fdae2?w=800&h=600&fit=crop'
    },
    {
      number: '02',
      title: 'Verify Documents',
      description: 'Upload GST certificate and business documents. Our team reviews within 24-48 hours for approval.',
      icon: FileCheck,
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop'
    },
    {
      number: '03',
      title: 'Setup Your Catalog',
      description: 'Add your products with images, prices, and descriptions. Organize inventory efficiently.',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop'
    },
    {
      number: '04',
      title: 'Start Selling',
      description: 'Connect with verified buyers instantly. Receive orders and grow your business nationwide.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop'
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: 'Smart Analytics',
      description: 'Real-time insights and data-driven decisions for your business growth'
    },
    {
      icon: Lock,
      title: 'Secure Platform',
      description: 'Bank-grade security with encrypted transactions and data protection'
    },
    {
      icon: Globe,
      title: 'Pan-India Reach',
      description: 'Connect with buyers across India and expand your market presence'
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Verified buyer and products with quality certification standards'
    }
  ];

  const whyChooseUs = [
  {
    icon: Users,
    title: "Supplier Matching",
    badge: "Smart",
    description:
      "Instantly connect with high-intent, verified buyers searching for your products and increase your conversion rate.",
  },
  {
    icon: Percent,
    title: "Price Intelligence",
    badge: "Data-Driven",
    description:
      "Access real-time market pricing insights and competitor trends to quote smarter and stay competitive.",
  },
  {
    icon:  ShieldCheck,
    title: "Quality Assurance",
    badge: "99.8%",
    description:
      "Work only with trusted and verified buyers, ensuring transparency and reducing fake or low-quality inquiries.",
  },
  {
    icon: Clock,
    title: "Real-time Tracking",
    badge: "24/7",
    description:
      "Track RFQs, quotations, orders, and deliveries with complete visibility throughout the procurement lifecycle.",
  },
];

  const trustFactors = [
    { icon: Users, value: '500+', label: 'Active Suppliers' },
    { icon: Package, value: '10K+', label: 'Products Listed' },
    { icon: ShoppingCart, value: '2K+', label: 'Daily Orders' },
    { icon: Star, value: '98%', label: 'Satisfaction' }
  ];

  const stats = [
    { label: 'Active Suppliers', value: '500+', icon: Users },
    { label: 'Products Listed', value: '10,000+', icon: Package },
    { label: 'Daily Orders', value: '2,000+', icon: ShoppingCart },
    { label: 'Customer Satisfaction', value: '98%', icon: Star }
  ];

  const supplierTestimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'Kumar Steel & Cement',
      location: 'Mumbai',
      rating: 5,
      text: 'RitzYard transformed our business. 50% increase in orders within 3 months. Easy platform and excellent support.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      verified: true
    },
    {
      name: 'Priya Sharma',
      company: 'Sharma Building Materials',
      location: 'Delhi',
      rating: 5,
      text: 'Finally, a platform that understands suppliers. The analytics dashboard helps us make informed decisions daily.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
      verified: true
    },
    {
      name: 'Amit Patel',
      company: 'Patel Construction Supplies',
      location: 'Pune',
      rating: 5,
      text: 'Automated inventory management saved countless hours. We focus on expanding instead of paperwork now.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      verified: true
    }
  ];

  const faqs = [
    {
      question: 'How do I get started as a supplier?',
      answer: 'Simply click "Get Started", fill in your business details, verify your documents (GST certificate), and once approved, you can start listing products immediately.'
    },
   
    {
      question: 'How long does verification take?',
      answer: 'Document verification typically takes 24-48 hours. Our team reviews each application carefully to maintain quality standards.'
    },
    {
      question: 'What payment methods are supported?',
      answer: 'We support all major payment methods including UPI, Net Banking, Credit/Debit Cards, and Digital Wallets. All transactions are 100% secure.'
    },
    {
      question: 'Can I manage inventory from mobile?',
      answer: 'Yes! Our platform is fully responsive and works seamlessly on all devices - desktop, tablet, and mobile phones.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'We offer 24/7 customer support via phone, email, and live chat. Our dedicated team is always ready to help you succeed.'
    }
  ];





  // GSAP Animations
  useEffect(() => {
    // Hero Section Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.from('.hero-badge', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.4')
      .from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.6')
      .from('.hero-buttons', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out'
      }, '-=0.4')
      .from('.hero-carousel', {
        opacity: 0,
        scale: 0.9,
        duration: 1,
        ease: 'power3.out'
      }, '-=0.6');

      // Floating orbs animation
      gsap.to('.floating-orb-1', {
        y: -30,
        x: 20,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.floating-orb-2', {
        y: 30,
        x: -20,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.floating-orb-3', {
        y: -20,
        x: -30,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Features Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  // Process Steps Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.process-card', {
        scrollTrigger: {
          trigger: processRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out'
      });
    }, processRef);

    return () => ctx.revert();
  }, []);



  return (
    <div className="min-h-screen bg-gradient-subtle overflow-x-hidden">
      {/* Navigation */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                <span className="text-white font-bold text-lg sm:text-xl">RY</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold text-gradient">RitzYard</h1>
                <p className="text-xs text-muted-foreground">Supplier Portal</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                How It Works
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-foreground hover:text-primary hover:bg-primary/10"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/onboarding')}
                className="px-6 py-2.5 font-semibold bg-gradient-to-r from-primary via-primary-glow to-secondary text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Get Started</span>
                <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border glass-morphism animate-slide-up">
            <nav className="container mx-auto px-4 py-4 space-y-3">
              <a href="#home" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#features" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#process" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#contact" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="py-2"><LanguageSwitcher /></div>
                <Button variant="outline" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="w-full border-2 border-primary text-primary hover:bg-primary/10">Login</Button>
                <Button onClick={() => { setMobileMenuOpen(false); navigate('/onboarding'); }} className="w-full bg-gradient-to-r from-primary to-secondary text-white shadow-lg">Get Started</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section with 3D Effects */}
      <section id="home" ref={heroRef} className="relative flex flex-col items-center text-center px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24 overflow-hidden perspective-1000">
        {/* 3D Animated Background */}
        <div className="absolute inset-0 -z-10">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
          
          {/* Animated 3D Floating Orbs */}
          <div className="floating-orb-1 absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 transform-gpu"></div>
          <div className="floating-orb-2 absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 transform-gpu"></div>
          <div className="floating-orb-3 absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-glow/30 to-secondary/20 rounded-full blur-3xl opacity-40 transform-gpu"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          {/* Radial Gradient Overlay */}
          <svg className="absolute w-screen top-0" width="1440" height="676" viewBox="0 0 1440 676" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="-92" y="-200" width="1624" height="1624" rx="812" fill="url(#gradient-bg)"/>
            <defs>
              <radialGradient id="gradient-bg" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="rotate(90 428 292)scale(812)">
                <stop offset=".63" stopColor="hsl(var(--primary))" stopOpacity="0.08"/>
                <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0.15"/>
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Badge */}
          <div className="hero-badge flex items-center justify-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full glass-card border-2 border-primary/30 backdrop-blur-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-primary animate-pulse flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Trusted by 500+ suppliers across India
              </span>
            </div>
          </div>

          {/* Main Heading with 3D Effect */}
          <h1 className="hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground mb-4 sm:mb-6 leading-tight px-2 sm:px-4 preserve-3d">
            <span className="block mb-2">Procurement Made</span>
            <span className="block text-gradient drop-shadow-2xl leading-tight">
              <span className="inline-block">Intelligent with</span>{' '}
              <span className="inline-block">Innovation</span>
            </span>
          </h1>

          {/* Subheading */}
          <p className="hero-subtitle text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-10 px-4 leading-relaxed">
            Explore our comprehensive suite of AI-powered tools designed to transform your construction material procurement process
          </p>

          {/* CTA Buttons */}
          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-12">
            <Button
              size="lg"
              onClick={() => navigate('/onboarding')}
              className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Get started
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="px-10 py-6 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
            >
              Supplier Login
            </Button>
          </div>

          {/* Browse Marketplace Button */}
          <div className="flex justify-center mb-12">
            <Button
              onClick={() => navigate('/marketplace')}
              className="px-8 py-4 text-base font-semibold bg-gradient-to-r from-secondary/80 to-primary/80 text-white hover:from-secondary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Browse Products & Suppliers
            </Button>
          </div>

          {/* Showcase Image Grid */}
          <div className="hero-carousel relative w-full max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {carouselImages.map((image, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl glass-card border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-[180px] sm:h-[220px]">
                    <img
                      src={image.url}
                      className="w-full h-full object-cover"
                      alt={image.title}
                      loading="lazy"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                      <div className="space-y-1.5">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full glass-card border border-white/30 backdrop-blur-md w-fit">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-white text-[10px] font-semibold">Premium Quality</span>
                        </div>
                        <h3 className="text-white text-sm sm:text-base font-bold drop-shadow-lg line-clamp-2">
                          {image.title}
                        </h3>
                        <p className="text-white/80 text-[10px] sm:text-xs font-medium line-clamp-1">
                          {image.subtitle}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Split Layout with Image */}
      <section className=" py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
  <div className="container mx-auto max-w-6xl">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left: Content */}
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
          <Sparkles className="w-4 h-4" />
          Why Join RitzYard
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          AI-Driven <span className="text-primary">Supplier</span> Growth Platform
        </h2>

        {/* SEO Friendly Paragraph */}
        <p className="text-lg text-muted-foreground mb-8">
          Grow your supply business with an AI-driven procurement ecosystem that helps you reach verified buyers, 
          optimize pricing, and gain complete visibility across RFQs, orders, and deliveries.
        </p>

        <div className="space-y-4">
          {whyChooseUs.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg hover:bg-accent/50 transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform flex-shrink-0">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <span className="text-xs font-bold text-primary">{item.badge}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Image */}
      <div className="relative">
        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600&h=600&fit=crop"
            alt="AI Procurement"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">40%</div>
              <div className="text-sm text-muted-foreground">Growth Rate</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* Trust Stats - Horizontal Bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="glass-card border border-border rounded-2xl p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {trustFactors.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary mb-3">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Unique Asymmetric Layout */}
      <section id="features" ref={featuresRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
          </div>

          {/* Flip Card Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card group perspective-1000 h-[280px]">
                  <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-180">
                    {/* Front of card */}
                    <div className="absolute inset-0 backface-hidden rounded-2xl bg-white dark:bg-card border-2 border-border shadow-lg overflow-hidden">
                      <div className="relative h-full p-6 sm:p-8 flex flex-col items-center justify-center text-center">
                        {/* Decorative background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 space-y-4">
                          {/* Icon */}
                          <div className="relative w-20 h-20 mx-auto">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                              <Icon className="w-9 h-9 text-white" />
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-bold text-foreground">
                            {feature.title}
                          </h3>
                          
                          <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold">
                            <span>Hover to explore</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Back of card */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary shadow-xl overflow-hidden">
                      <div className="relative h-full p-6 sm:p-8 flex flex-col justify-center text-center">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        
                        <div className="relative z-10 space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <Icon className="w-8 h-8 text-white" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-white">
                            {feature.title}
                          </h3>
                          
                          <p className="text-sm text-white/90 leading-relaxed">
                            {feature.description}
                          </p>
                          
                          <div className="pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Available Now</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* How It Works Section */}
      <section id="process" ref={processRef} className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Target className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Started in <span className="text-primary">4 Easy Steps</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              From registration to your first sale - we've made it simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="process-card group">
                <Card className="relative p-6 sm:p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 bg-card overflow-hidden">
                  {/* Step Number Background */}
                  <div className="absolute top-4 right-4 text-7xl sm:text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors duration-300">
                    {step.number}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-primary/10 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 flex-shrink-0">
                      <step.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                        STEP {step.number}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow Connector (hidden on mobile, shown on larger screens for better flow) */}
                  {index < onboardingSteps.length - 1 && index % 2 === 0 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                      <ChevronRight className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* Testimonials - Carousel Style */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Star className="w-4 h-4" />
              Success Stories
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Trusted by <span className="text-primary">Industry Leaders</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supplierTestimonials.map((testimonial, i) => (
              <div key={i} className="relative">
                <div className="absolute -top-4 left-6 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary fill-primary" />
                </div>
                <div className="pt-8 px-6 pb-6 border border-border rounded-2xl bg-card hover:shadow-xl transition-all">
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                        {testimonial.verified && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-secondary/5 via-background to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <MessageCircle className="w-4 h-4" />
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about getting started as a supplier
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-border hover:border-primary/30 transition-all duration-300 bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-accent/50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-semibold text-foreground pr-4">{faq.question}</span>
                  <ChevronRight className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openFaqIndex === index ? 'rotate-90' : ''
                  }`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFaqIndex === index ? 'max-h-96' : 'max-h-0'
                }`}>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-border">
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10 sm:mt-12">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Still have questions?
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@ritzyard.com'}
              className="px-6 sm:px-8 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="  bg-[#f3f0ec] py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="border border-border rounded-2xl p-10 bg-card">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to <span className="text-primary">Get Started</span>?
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              Join hundreds of suppliers already growing their business with RitzYard's AI-powered platform
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/onboarding')}
                className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-primary via-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="px-10 py-6 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300"
              >
                Login to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Glass Effect */}
      <footer id="contact" className="bg-gradient-to-br from-secondary via-secondary to-primary text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-lg">RY</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">RitzYard</h3>
                  <p className="text-xs text-white/70">Supplier Portal</p>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                Your trusted construction procurement platform. Connecting buyers with verified suppliers across India.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <MapPin className="w-4 h-4" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Company
              </h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><a href="#about" className="hover:text-white hover:translate-x-1 inline-block transition-all">About Us</a></li>
                <li><a href="#contact" className="hover:text-white hover:translate-x-1 inline-block transition-all">Contact</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Careers</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Blogs</a></li>
              </ul>
            </div>

            {/* Products Links */}
            <div>
              <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Products
              </h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">All Products</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Cement</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Steel</a></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Wood & Timber</a></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-base font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-primary rounded-full"></div>
                Support
              </h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">Help Center</a></li>
                <li><button onClick={() => navigate('/terms-of-service')} className="hover:text-white hover:translate-x-1 inline-block transition-all">Terms of Service</button></li>
                <li><button onClick={() => navigate('/privacy-policy')} className="hover:text-white hover:translate-x-1 inline-block transition-all">Privacy Policy</button></li>
                <li><a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-all">FAQs</a></li>
              </ul>
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:support@ritzyard.com">support@ritzyard.com</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <a href="tel:+919136242706">+91 91362 42706</a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/80">
              <p>&copy; 2025 RitzYard. All rights reserved. Powered by YUREKH SOLUTIONS</p>
              <div className="flex gap-4">
                <button onClick={() => navigate('/login')} className="hover:text-white transition-colors hover:scale-105">
                  Login
                </button>
                <span>|</span>
                <button onClick={() => navigate('/onboarding')} className="hover:text-white transition-colors hover:scale-105">
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
