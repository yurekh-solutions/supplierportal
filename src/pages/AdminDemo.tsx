import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/pages/components/ui/glass-card';
import { Textarea } from '@/pages/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const AdminDemo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = () => {
    const storedData = localStorage.getItem('supplierApplication');
    if (storedData) {
      setApplication(JSON.parse(storedData));
    }
  };

  const handleApprove = () => {
    if (application) {
      const updatedApp = {
        ...application,
        status: 'approved',
        reviewedAt: new Date().toISOString(),
      };
      localStorage.setItem('supplierApplication', JSON.stringify(updatedApp));
      toast({
        title: 'Application Approved ✅',
        description: 'Supplier can now login and set up their password.',
      });
      setApplication(updatedApp);
    }
  };

  const handleReject = () => {
    if (application && rejectionReason) {
      const updatedApp = {
        ...application,
        status: 'rejected',
        reviewedAt: new Date().toISOString(),
        rejectionReason,
      };
      localStorage.setItem('supplierApplication', JSON.stringify(updatedApp));
      toast({
        title: 'Application Rejected ❌',
        description: 'Supplier will be notified.',
        variant: 'destructive',
      });
      setApplication(updatedApp);
      setRejectionReason('');
    }
  };

  const resetStatus = () => {
    if (application) {
      const updatedApp = {
        ...application,
        status: 'pending',
        reviewedAt: undefined,
        rejectionReason: undefined,
      };
      localStorage.setItem('supplierApplication', JSON.stringify(updatedApp));
      toast({
        title: 'Status Reset',
        description: 'Application status set back to pending.',
      });
      setApplication(updatedApp);
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
        <GlassCard className="max-w-md">
          <GlassCardContent className="text-center p-8">
            <p className="text-gray-600 mb-4">No application found in demo mode.</p>
            <Button onClick={() => navigate('/onboarding')}>
              Go to Onboarding
            </Button>
          </GlassCardContent>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Demo Panel</h1>
          <p className="text-muted-foreground">Simulate admin approval/rejection for testing</p>
        </div>

        <GlassCard className="mb-6">
          <GlassCardHeader>
            <GlassCardTitle>Application Details</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Company Name</p>
                <p className="font-semibold">{application.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{application.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contact Person</p>
                <p className="font-semibold">{application.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{application.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  application.status === 'approved' ? 'bg-green-100 text-green-800' :
                  application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {application.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-semibold">{new Date(application.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </GlassCardContent>
        </GlassCard>

        {application.status === 'pending' && (
          <GlassCard>
            <GlassCardHeader>
              <GlassCardTitle>Review Application</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={handleApprove}
                  className="flex-1 px-8 py-3.5 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve Application
                </Button>
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Rejection reason (optional)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="border-2 border-border focus:border-primary"
                />
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject Application
                </Button>
              </div>
            </GlassCardContent>
          </GlassCard>
        )}

        {application.status !== 'pending' && (
          <GlassCard>
            <GlassCardContent className="p-6">
              <Button
                onClick={resetStatus}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Reset to Pending
              </Button>
            </GlassCardContent>
          </GlassCard>
        )}

        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => navigate(`/status?email=${application.email}`)}>
            View Supplier Status
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDemo;
