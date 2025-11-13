import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, Scale, UserX, RefreshCw } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';
import { Card } from '@/pages/components/ui/card';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: CheckCircle,
      title: 'Acceptance of Terms',
      content: [
        'By accessing RitzYard, you agree to these Terms of Service',
        'You must be 18 years or older to use our services',
        'You represent that you have authority to bind your business',
        'Continued use constitutes acceptance of any updates to terms',
        'If you disagree with any terms, please discontinue use'
      ]
    },
    {
      icon: UserX,
      title: 'Account Registration',
      content: [
        'Provide accurate and complete business information',
        'Maintain security of your account credentials',
        'Notify us immediately of unauthorized access',
        'You are responsible for all activities under your account',
        'One account per business entity'
      ]
    },
    {
      icon: Scale,
      title: 'Supplier Obligations',
      content: [
        'Provide accurate product descriptions and pricing',
        'Maintain valid business licenses and certifications',
        'Fulfill orders in a timely and professional manner',
        'Comply with all applicable laws and regulations',
        'Maintain quality standards for all products'
      ]
    },
    {
      icon: AlertCircle,
      title: 'Prohibited Activities',
      content: [
        'Posting false or misleading information',
        'Engaging in fraudulent transactions',
        'Violating intellectual property rights',
        'Harassing or abusing other users',
        'Attempting to manipulate platform algorithms'
      ]
    },
    {
      icon: RefreshCw,
      title: 'Payment Terms',
      content: [
        'Commission fees apply to completed transactions',
        'Payments processed through secure gateways',
        'Refunds subject to our refund policy',
        'You are responsible for applicable taxes',
        'Payment disputes handled per our dispute resolution process'
      ]
    },
    {
      icon: FileText,
      title: 'Intellectual Property',
      content: [
        'RitzYard retains all platform intellectual property rights',
        'You retain rights to your product content',
        'You grant us license to display your content',
        'Respect third-party intellectual property',
        'Report any IP violations to our team'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-white/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">RY</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gradient">RitzYard</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Please read these terms carefully before using our platform.
          </p>
          <p className="text-sm text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="container mx-auto max-w-4xl space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="p-6 sm:p-8 border border-border hover:border-primary/30 transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  <section.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}

          {/* Additional Terms */}
          <Card className="p-6 sm:p-8 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">Limitation of Liability</h3>
            <p className="text-muted-foreground mb-4">
              RitzYard is not liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the fees paid by you in the past 12 months.
            </p>
            <h3 className="text-xl font-bold text-foreground mb-4 mt-6">Termination</h3>
            <p className="text-muted-foreground mb-4">
              We reserve the right to suspend or terminate accounts that violate these terms. You may close your account at any time by contacting support.
            </p>
            <h3 className="text-xl font-bold text-foreground mb-4 mt-6">Changes to Terms</h3>
            <p className="text-muted-foreground">
              We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms.
            </p>
          </Card>

          {/* Contact Section */}
          <Card className="p-6 sm:p-8 border-2 border-primary/30 bg-primary/5">
            <h3 className="text-xl font-bold text-foreground mb-4">Questions About Terms?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.href = 'mailto:legal@ritzyard.com'}
                className="bg-primary hover:bg-primary/90"
              >
                Contact Legal Team
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
