import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardDescription, GlassCardHeader, GlassCardTitle } from '@/pages/components/ui/glass-card';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    if (!email) {
      navigate('/');
      return;
    }

    fetchStatus();
  }, [email]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/supplier/check-status?email=${encodeURIComponent(email!)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setStatusData(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch status',
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
        return <CheckCircle className="w-20 h-20 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-20 h-20 text-red-600" />;
      default:
        return <Clock className="w-20 h-20 text-yellow-600" />;
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
        return 'Congratulations! Your supplier application has been approved. You can now login to your dashboard.';
      case 'rejected':
        return statusData.rejectionReason || 'Unfortunately, your application has been rejected. Please contact support for more information.';
      default:
        return 'Your application is currently being reviewed by our team. You will receive an email notification once the review is complete.';
    }
  };

  const getStatusColor = () => {
    if (!statusData) return 'gray';

    switch (statusData.status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'yellow';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#B85C38] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Badge */}
        <div className="text-center mb-6 animate-slide-up">
          <div className="inline-block mb-4">
            <span className="text-sm font-medium text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
              Supplier Dashboard
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-3">
            <span className="text-foreground">Application </span>
            <span className="text-gradient">Status</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">Track your supplier application progress</p>
        </div>

        {/* Status Card - Popup Style */}
        <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <GlassCard className="shadow-3xl border-2 border-white/50 bg-white/90 backdrop-blur-xl">
            {/* Status Icon and Title */}
            <div className="text-center pt-8 pb-6 px-6 bg-gradient-to-b from-primary/5 to-transparent border-b border-primary/10">
              <div className="flex justify-center mb-6 animate-bounce-slow">
                {getStatusIcon()}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gradient mb-3">
                {getStatusTitle()}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {getStatusDescription()}
              </p>
            </div>

            <GlassCardContent className="p-6 sm:p-8">
              {statusData && (
                <div className="space-y-4">
                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Company Name Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 border-2 border-orange-200/50 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-orange-700 mb-1">Company Name</p>
                          <p className="text-lg font-bold text-gray-900 truncate">{statusData.companyName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200/50 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-700 mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                            statusData.status === 'approved' ? 'bg-green-200 text-green-800' :
                            statusData.status === 'rejected' ? 'bg-red-200 text-red-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                            {statusData.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submitted On Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200/50 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-purple-700 mb-1">Submitted On</p>
                        <p className="text-lg font-bold text-gray-900">{new Date(statusData.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Note/Alert Box */}
                  {statusData.status === 'pending' && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300/50 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white font-bold text-sm">!</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-800 mb-1">Note: Your application is currently under review.</p>
                          <p className="text-sm text-gray-700">
                            We will notify you via email at <strong>{statusData.email}</strong> once a decision has been made.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {statusData.status === 'approved' && (
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full px-8 py-3.5 text-lg font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mt-6"
                    >
                      Login to Dashboard
                    </Button>
                  )}

                  {statusData.status === 'rejected' && (
                    <Button
                      onClick={() => navigate('/onboarding')}
                      className="w-full px-8 py-3.5 text-lg font-semibold bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300 mt-6"
                    >
                      Reapply
                    </Button>
                  )}
                </div>
              )}

              {/* Back Button */}
              <div className="text-center pt-6 mt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-8 py-3 font-semibold border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SupplierStatus;
