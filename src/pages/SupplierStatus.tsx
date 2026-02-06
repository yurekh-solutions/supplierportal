import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Mail, ArrowLeft, Building2, FileText, LogIn, AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== 'http://localhost:5000/api') {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://backendmatrix.onrender.com/api';
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

interface StatusData {
  status: ApplicationStatus;
  email: string;
  companyName: string;
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const SupplierStatus = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<StatusData | null>(null);

  const email = searchParams.get('email');

  useEffect(() => {
    console.log('📍 SupplierStatus: Component mounted');
    console.log('📧 Email from URL:', email);
    console.log('🌐 API URL:', API_URL);
    
    if (!email) {
      console.error('❌ No email parameter in URL');
      toast({
        title: 'Missing Email',
        description: 'Please submit your application first or access this page with a valid email parameter.',
        variant: 'destructive',
      });
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    fetchStatus();
  }, [email]);

  const fetchStatus = async () => {
    try {
      console.log('🔍 Fetching status for:', email);
      console.log('🔗 API endpoint:', `${API_URL}/supplier/check-status?email=${encodeURIComponent(email!)}`);
      
      const response = await fetch(`${API_URL}/supplier/check-status?email=${encodeURIComponent(email!)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('📊 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        console.log('✅ Status data loaded:', data.data);
        setStatusData(data.data);
      } else {
        console.error('❌ API error:', data.message);
        throw new Error(data.message);
      }
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch status. Please check your email or try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!statusData) return null;

    switch (statusData.status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-white" />;
      default:
        return <Clock className="w-16 h-16 sm:w-20 sm:h-20 text-white" />;
    }
  };

  const getStatusTitle = () => {
    if (!statusData) return '';

    switch (statusData.status) {
      case 'approved':
        return 'Application Approved!';
      case 'rejected':
        return 'Application Rejected';
      default:
        return 'Application Under Review';
    }
  };

  const getStatusDescription = () => {
    if (!statusData) return '';

    switch (statusData.status) {
      case 'approved':
        return 'Congratulations! Your supplier application has been approved. Click below to set up your password and login to your dashboard.';
      case 'rejected':
        return statusData.rejectionReason || 'Unfortunately, your application has been rejected. Please contact support for more information.';
      default:
        return 'Your application is currently being reviewed by our team. You will receive an email notification once the review is complete.';
    }
  };

  const getStatusColor = () => {
    if (!statusData) return 'from-emerald-500 to-green-600';

    switch (statusData.status) {
      case 'approved':
        return 'from-emerald-500 to-green-600';
      case 'rejected':
        return 'from-red-500 to-rose-600';
      default:
        return 'from-amber-500 to-orange-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
        <div className="text-center glass-card border-2 border-white/20 p-8 rounded-3xl bg-white/40 dark:bg-black/20 backdrop-blur-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary mx-auto mb-4"></div>
          <p className="text-foreground font-semibold">Loading your application status...</p>
          <p className="text-sm text-muted-foreground mt-2">Checking email: {email}</p>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
        <div className="text-center glass-card border-2 border-red-500/30 p-8 rounded-3xl bg-white/40 dark:bg-black/20 backdrop-blur-2xl max-w-md">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Application Found</h2>
          <p className="text-muted-foreground mb-6">
            We couldn't find an application associated with the email: <span className="font-semibold text-primary">{email}</span>
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/onboarding')}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white"
            >
              Submit New Application
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-2 border-primary/30 text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-primary bg-primary/10 px-5 py-2.5 rounded-full border-2 border-primary/20">
              Supplier Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="text-foreground">Application </span>
            <span className="text-gradient">Status</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">Track your supplier application progress</p>
        </div>

        {/* Status Card - Glassmorphism */}
        <div className="animate-slide-up glass-card border-2 border-white/20 rounded-3xl bg-white/50 dark:bg-black/30 backdrop-blur-2xl shadow-3xl overflow-hidden" style={{ animationDelay: '100ms' }}>
          {/* Status Icon and Title */}
          <div className="text-center pt-10 pb-8 px-6 bg-gradient-to-b from-primary/10 to-transparent border-b-2 border-white/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="flex justify-center mb-6 relative z-10">
              <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${getStatusColor()} flex items-center justify-center shadow-2xl`}>
                {getStatusIcon()}
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 relative z-10">
              {getStatusTitle()}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto relative z-10 leading-relaxed">
              {getStatusDescription()}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {statusData && (
              <div className="space-y-4 sm:space-y-6">
                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name Card */}
                    <div className="glass-card border-2 border-primary/15 rounded-2xl p-5 bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Company Name</p>
                          <p className="text-lg font-bold text-foreground truncate">{statusData.companyName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="glass-card border-2 border-primary/15 rounded-2xl p-5 bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                          statusData.status === 'approved' ? 'from-emerald-500 to-green-600' :
                          statusData.status === 'rejected' ? 'from-red-500 to-rose-600' :
                          'from-amber-500 to-orange-600'
                        } flex items-center justify-center flex-shrink-0 shadow-lg`}>
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
                          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-bold border-2 ${
                            statusData.status === 'approved' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' :
                            statusData.status === 'rejected' ? 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30' :
                            'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          }`}>
                            {statusData.status === 'approved' ? '✓ Approved' :
                             statusData.status === 'rejected' ? '✕ Rejected' :
                             '⏳ Pending Review'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submitted On Card */}
                  <div className="glass-card border-2 border-primary/15 rounded-2xl p-5 bg-white/40 dark:bg-black/20 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Submitted On</p>
                        <p className="text-lg font-bold text-foreground">{new Date(statusData.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {statusData.status === 'rejected' && statusData.rejectionReason && (
                    <div className="glass-card border-2 border-red-500/30 rounded-2xl p-5 bg-red-500/10 backdrop-blur-sm shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-2">Rejection Reason</p>
                          <p className="text-sm text-foreground leading-relaxed">
                            {statusData.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Note/Alert Box */}
                  {statusData.status === 'pending' && (
                    <div className="glass-card border-2 border-primary/20 rounded-2xl p-5 bg-primary/5 backdrop-blur-sm shadow-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground mb-2">Your application is under review</p>
                          <p className="text-sm text-muted-foreground">
                            We will notify you via email at <span className="font-semibold text-primary">{statusData.email}</span> once a decision has been made.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {statusData.status === 'approved' && (
                    <div className="space-y-4 mt-6">
                      <Button
                        onClick={() => navigate('/login')}
                        className="w-full px-8 py-3.5 text-lg font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                      >
                        <LogIn className="w-5 h-5 mr-2" />
                        Set Up Password & Login
                      </Button>
                      <div className="glass-card border-2 border-primary/20 rounded-2xl p-4 bg-primary/5 backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground text-center">
                          <span className="font-semibold text-primary">First time login?</span> You'll be prompted to create a secure password for your account using your registered email: <span className="font-semibold text-foreground">{statusData.email}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {statusData.status === 'rejected' && (
                    <div className="space-y-4 mt-6">
                      <Button
                        onClick={() => navigate('/onboarding')}
                        className="w-full px-8 py-3.5 text-lg font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                      >
                        <RefreshCw className="w-5 h-5 mr-2" />
                        Reapply for Supplier Onboarding
                      </Button>
                      <div className="glass-card border-2 border-primary/20 rounded-2xl p-4 bg-primary/5 backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground text-center">
                          <span className="font-semibold text-primary">Need help?</span> Please address the rejection reasons mentioned above and resubmit your application with updated information.
                        </p>
                      </div>
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="w-full px-8 py-3 font-semibold border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
                      >
                        <Home className="w-4 h-4 mr-2" />
                        Return to Homepage
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Back Button */}
              <div className="text-center pt-6 mt-6 border-t-2 border-white/20">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-8 py-3 font-semibold border-2 border-primary/30 text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierStatus;
