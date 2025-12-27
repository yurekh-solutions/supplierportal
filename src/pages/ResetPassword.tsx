import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Input } from '@/pages/components/ui/input';
import { Label } from '@/pages/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Get API URL
const getApiUrl = () => {
  // Always use the environment variable if available and not localhost
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000/api') {
    return import.meta.env.VITE_API_URL;
  }
  // For production deployment (Vercel, custom domain, etc.)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://backendmatrix.onrender.com/api';
  }
  // Fallback to localhost for local development
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    token: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Extract email and token from URL
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email || !token) {
      setIsValidToken(false);
      toast({
        title: 'Invalid Link',
        description: 'The reset link is missing required information',
        variant: 'destructive',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      email: decodeURIComponent(email),
      token
    }));
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/supplier/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          token: formData.token,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResetSuccess(true);
        toast({
          title: 'Success',
          description: 'Your password has been reset. You can now log in.',
        });
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-[#f3f0ec] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
            <div className="bg-gradient-to-r from-red-50/10 via-red-50/10 to-red-50/10 border-b border-white/20 p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-2xl bg-red-100 flex items-center justify-center shadow-xl">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h2>
              <p className="text-sm text-red-500">This password reset link is invalid or has expired</p>
            </div>
            <div className="p-8 text-center space-y-4">
              <p className="text-muted-foreground">Please request a new password reset link from the login page.</p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl text-white font-semibold"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f0ec] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary/30 to-primary-glow/20 rounded-full blur-3xl opacity-60 animate-float"></div>
        <div className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/25 to-primary/15 rounded-full blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl">
          <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              Create New Password
            </h2>
            <p className="text-center text-muted-foreground text-sm">
              Enter your new password below
            </p>
          </div>

          <div className="p-8">
            {!resetSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Display */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-semibold text-foreground break-all">{formData.email}</p>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-semibold">New Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Lock className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password (min 6 characters)"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-16 pr-12 h-12 border-2 border-border/50 focus:border-primary/50 bg-background/50 backdrop-blur-sm rounded-lg"
                      required
                      minLength={6}
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

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground font-semibold">Confirm Password</Label>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gradient-to-br from-primary to-secondary rounded-l-lg flex items-center justify-center group-hover:shadow-lg transition-all z-10">
                      <Lock className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
                      Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Reset Password
                    </span>
                  )}
                </Button>

                <div className="glass-card border-2 border-blue-200/50 rounded-xl p-4 backdrop-blur-xl bg-blue-50/30">
                  <p className="text-xs text-blue-800">
                    ✓ Password must be at least 6 characters<br/>
                    ✓ Make sure both passwords match<br/>
                    ✓ You'll be able to login immediately after
                  </p>
                </div>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Password Reset Successful!</h3>
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully reset. You'll be redirected to login shortly.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full h-12 bg-gradient-to-r from-primary via-primary-glow to-secondary hover:shadow-xl text-white font-semibold transition-all"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </div>
        </div>

        {!resetSuccess && (
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
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
