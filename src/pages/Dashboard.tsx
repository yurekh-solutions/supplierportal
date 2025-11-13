import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, FileText, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/pages/components/ui/card';
import { Badge } from '@/pages/components/ui/badge';
import { Button } from '@/pages/components/ui/button';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SupplierData {
  status: 'pending' | 'approved' | 'rejected';
  companyName: string;
  submittedAt: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const email = new URLSearchParams(window.location.search).get('email') || localStorage.getItem('supplierEmail');

  useEffect(() => {
    if (email) {
      localStorage.setItem('supplierEmail', email);
      fetchStatus();
    } else {
      navigate('/onboarding');
    }
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/supplier/check-status?email=${email}`);
      const data = await response.json();

      if (data.success && data.exists) {
        setSupplier(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Application Found</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/onboarding')} className="w-full">
              Submit Application
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusIcon = () => {
    switch (supplier.status) {
      case 'approved':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-16 h-16 text-red-500" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (supplier.status) {
      case 'approved':
        return {
          title: 'Application Approved! 🎉',
          description: 'Your supplier application has been approved. You can now access the supplier portal.',
          color: 'text-green-600',
        };
      case 'rejected':
        return {
          title: 'Application Rejected',
          description: 'Unfortunately, your application was not approved at this time.',
          color: 'text-red-600',
        };
      default:
        return {
          title: 'Application Under Review',
          description: 'Your application is being reviewed by our team. We will notify you once a decision is made.',
          color: 'text-yellow-600',
        };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-[#F5F0EB] py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-block mb-3">
            <span className="text-sm sm:text-base font-medium text-[#B85C38] bg-[#B85C38]/10 px-4 py-1.5 rounded-full border border-[#B85C38]/20">
              Supplier Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[#B85C38] mb-3">
            Application Status
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-[#B85C38] to-[#8B4513] mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Track your supplier application progress</p>
        </div>

        <Card className="mb-6 shadow-xl border-[#B85C38]/20">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-[#B85C38]/5 to-[#8B4513]/5 border-b border-[#B85C38]/10">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className={`text-2xl sm:text-3xl font-bold ${statusInfo.color}`}>
              {statusInfo.title}
            </CardTitle>
            <CardDescription className="text-base sm:text-lg mt-2 text-gray-600">
              {statusInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-[#B85C38]/5 to-[#8B4513]/5 rounded-lg border border-[#B85C38]/20">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#B85C38] to-[#8B4513] flex items-center justify-center flex-shrink-0">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Company Name</p>
                  <p className="font-semibold text-gray-800 text-base sm:text-lg">{supplier.companyName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Status</p>
                  <Badge
                    className={
                      supplier.status === 'approved'
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : supplier.status === 'rejected'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                    }
                  >
                    {supplier.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Submitted On</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(supplier.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {supplier.reviewedAt && (
                <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Reviewed On</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(supplier.reviewedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {supplier.status === 'rejected' && supplier.rejectionReason && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 sm:p-6 mt-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-red-800 text-lg">Rejection Reason</h3>
                </div>
                <p className="text-red-700 ml-13">{supplier.rejectionReason}</p>
                <Button
                  onClick={() => navigate('/onboarding')}
                  className="mt-4 w-full sm:w-auto bg-gradient-to-r from-[#B85C38] to-[#8B4513] hover:from-[#A0522D] hover:to-[#6B3410] text-white shadow-lg"
                >
                  Reapply with Corrections
                </Button>
              </div>
            )}

            {supplier.status === 'pending' && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 sm:p-6 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-yellow-800 font-medium">
                      <strong>Note:</strong> Your application is currently under review. You will receive an email notification once a decision has been made.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {supplier.status === 'approved' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 sm:p-6 mt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-green-800 text-lg">Next Steps</h3>
                </div>
                <ul className="list-disc list-inside text-green-700 space-y-2 ml-13">
                  <li>Check your email for login credentials</li>
                  <li>Visit the supplier login page to access your dashboard</li>
                  <li>Set up your supplier portal password</li>
                  <li>Start adding products and managing inquiries</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            onClick={() => {
              if (supplier.status === 'approved') {
                navigate('/login');
              } else {
                navigate('/');
              }
            }}
            className="bg-gradient-to-r from-[#B85C38] to-[#8B4513] hover:from-[#A0522D] hover:to-[#6B3410] text-white px-8 py-3 rounded-lg shadow-lg font-semibold"
          >
            {supplier.status === 'approved' ? '→ Go to Supplier Portal' : 'Return to Homepage'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
