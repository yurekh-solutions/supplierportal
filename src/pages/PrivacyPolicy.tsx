import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText, UserCheck, Database } from 'lucide-react';
import ritzyardLogo from "@/assets/RITZYARD3.svg";
import { Button } from '@/pages/components/ui/button';
import { Card } from '@/pages/components/ui/card';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Business information (company name, GST number, address)',
        'Contact details (email, phone number)',
        'Product catalog and inventory data',
        'Transaction and order history',
        'Usage data and analytics'
      ]
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our services',
        'To process transactions and manage orders',
        'To communicate with you about your account',
        'To improve our platform and user experience',
        'To comply with legal obligations'
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        'Bank-grade encryption for all data transmission',
        'Secure cloud storage with regular backups',
        'Multi-factor authentication options',
        'Regular security audits and updates',
        'Compliance with industry standards'
      ]
    },
    {
      icon: Eye,
      title: 'Data Sharing',
      content: [
        'We never sell your personal information',
        'Data shared only with verified buyers for transactions',
        'Third-party services bound by confidentiality',
        'Legal compliance when required by law',
        'Your explicit consent for any other sharing'
      ]
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      content: [
        'Access your personal data anytime',
        'Request data correction or deletion',
        'Opt-out of marketing communications',
        'Export your data in portable format',
        'Lodge complaints with data protection authorities'
      ]
    },
    {
      icon: FileText,
      title: 'Cookies & Tracking',
      content: [
        'Essential cookies for platform functionality',
        'Analytics cookies to improve user experience',
        'You can manage cookie preferences',
        'No third-party advertising cookies',
        'Transparent tracking practices'
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
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden">
                <img src={ritzyardLogo} alt="ritzyard logo" className="w-full h-full object-cover" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold leading-tight notranslate">
                  <span className="text-primary">r</span>
                  <span className="text-[#452a21]">itz </span>
                  <span className="text-[#452a21]">yard</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            Privacy <span className="text-primary">Policy</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            Your privacy is important to us. This policy explains how we collect, use, and protect your data.
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

          {/* Contact Section */}
          <Card className="p-6 sm:p-8 border-2 border-primary/30 bg-primary/5">
            <h3 className="text-xl font-bold text-foreground mb-4">Questions About Privacy?</h3>
            <p className="text-muted-foreground mb-6">
              If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.href = 'mailto:privacy@ritzyard.com'}
                className="bg-primary hover:bg-primary/90"
              >
                Email Privacy Team
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

export default PrivacyPolicy;
