import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, LogIn, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useToast } from '@/hooks/use-toast';

// Get API URL - use production URL if on Vercel, otherwise use env var or localhost
const getApiUrl = () => {
  // Check if running on Vercel production
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://backendmatrix.onrender.com/api';
  }
  // Check if env var is set (for local dev and preview)
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to localhost for local development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const SupplierLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/supplier/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('supplierToken', data.token);
        localStorage.setItem('supplierUser', JSON.stringify(data.user));
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
        navigate('/products');
      } else if (data.message === 'Please set up your password first') {
        // Show password setup form
        setShowPasswordSetup(true);
        toast({
          title: 'Password Setup Required',
          description: 'Please set up your password to continue',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/supplier/setup-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('supplierToken', data.token);
        localStorage.setItem('supplierUser', JSON.stringify(data.user));
        toast({
          title: 'Success',
          description: 'Password set up successfully!',
        });
        navigate('/products');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set up password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-[#f3f0ec] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* ... existing background and content ...
      {/* Animated Background - Match Landing Page */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-glow/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Info */}
          <div className="hidden lg:block space-y-6">
            {/* Logo & Brand */}
            <div className="glass-card border-2 border-white/30 p-8 rounded-3xl backdrop-blur-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl">
                  <span className="text-white font-bold text-2xl">RY</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gradient">RitzYard</h1>
                  <p className="text-sm text-muted-foreground">Supplier Portal</p>
                </div>
              </div>
              <p className="text-lg text-foreground leading-relaxed">
                Welcome back! Access your supplier dashboard to manage products, orders, and grow your business.
              </p>
            </div>

            {/* New Supplier CTA */}
            <div className="glass-card border-2 border-primary/30 p-8 rounded-3xl backdrop-blur-2xl bg-gradient-to-br from-primary/5 to-secondary/5 hover:shadow-2xl transition-all duration-300 group cursor-pointer" onClick={() => navigate('/onboarding')}>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    New Supplier?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Join 500+ suppliers growing their business with RitzYard. Quick approval process!
                  </p>
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl group-hover:scale-105 transition-all">
                    Apply for Supplier Onboarding →
                  </Button>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              {[
                { icon: Shield, text: 'Secure & Encrypted Login' },
                { icon: Sparkles, text: 'Real-time Dashboard Access' },
                { icon: Lock, text: 'Protected Supplier Data' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 glass-card border border-white/20 p-4 rounded-xl backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
            <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-8">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                  <LogIn className="w-10 h-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center text-foreground mb-2">
                Supplier Login
              </h2>
              <p className="text-center text-muted-foreground text-sm">
                Enter your credentials to access your dashboard
              </p>
            </div>
          <div className="p-8">
            {!showPasswordSetup ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-semibold">Email Address</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Mail className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-16 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-semibold">Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Lock className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-16 pr-12 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-[1.02] text-white font-semibold text-base transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Login to Dashboard
                    </span>
                  )}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-sm text-primary hover:text-primary-glow transition-colors font-medium underline"
                  >
                    Forgot your password?
                  </button>
                </div>

                <div className="glass-card border-2 border-blue-200/50 rounded-xl p-5 backdrop-blur-xl bg-blue-50/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Important Note</p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        You can only login after your supplier application is approved by admin.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handlePasswordSetup} className="space-y-6">
                <div className="bg-green-50/80 border-2 border-green-200/80 rounded-lg p-4 mb-4 backdrop-blur-sm">
                  <p className="text-sm text-green-800 text-center font-medium">
                    ✅ Your application was approved! Please set up your password to continue.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-foreground font-semibold">New Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Lock className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-16 pr-12 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground font-semibold">Confirm Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Lock className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-16 pr-12 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl hover:scale-[1.02] text-white font-semibold text-base transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Setting up...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Set Up Password & Login
                    </span>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordSetup(false)}
                  className="w-full h-12 border-2 border-primary/50 text-primary hover:bg-primary hover:text-white transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </form>
            )}
          </div>
          </div>

          {/* Mobile - New Supplier CTA */}
          <div className="lg:hidden glass-card border-2 border-primary/30 p-6 rounded-2xl backdrop-blur-2xl bg-gradient-to-br from-primary/5 to-secondary/5" onClick={() => navigate('/onboarding')}>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground">New Supplier?</h3>
              <p className="text-sm text-muted-foreground">
                Join 500+ suppliers growing with RitzYard
              </p>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary text-white hover:shadow-xl">
                Apply for Onboarding →
              </Button>
            </div>
          </div>
        </div>

        {/* Back to Homepage Button */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="group bg-transparent border-2 border-primary/40 text-primary backdrop-blur-xl px-6 py-3 h-auto rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center scale-110">
                <ArrowLeft className="w-4 h-4 text-primary drop-shadow-sm" />
              </div>
              <span className="font-semibold text-sm">Back to Homepage</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupplierLogin;
