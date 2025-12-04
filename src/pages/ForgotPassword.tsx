import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Get API URL
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://backendmatrix.onrender.com/api';
  }
  if (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('localhost')) {
    return import.meta.env.VITE_API_URL;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/supplier/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: 'Check Your Email',
          description: 'If an account exists, a reset link has been sent',
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f0ec] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary-glow/30 to-secondary/20 rounded-full blur-3xl opacity-40 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                <Mail className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              Reset Password
            </h2>
            <p className="text-center text-muted-foreground text-sm">
              Enter your email to receive a reset link
            </p>
          </div>

          <div className="p-8">
            {!emailSent ? (
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-16 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                    />
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
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Send Reset Link
                    </span>
                  )}
                </Button>

                <div className="glass-card border-2 border-blue-200/50 rounded-xl p-5 backdrop-blur-xl bg-blue-50/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Password Reset</p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        Enter your registered email address and we'll send you a link to reset your password. The link expires in 1 hour.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Check Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    If an account exists with the email <strong>{email}</strong>, we've sent a password reset link.
                  </p>
                </div>
                <div className="bg-amber-50/80 border-2 border-amber-200/80 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-xs text-amber-800">
                    📧 Check your spam folder if you don't see the email in your inbox. The link expires in 1 hour.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl text-white font-semibold transition-all"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="group bg-transparent border-2 border-primary/40 text-primary backdrop-blur-xl px-6 py-3 h-auto rounded-xl shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-sm">Back to Login</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
