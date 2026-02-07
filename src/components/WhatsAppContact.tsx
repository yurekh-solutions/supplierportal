import { useState, useEffect } from 'react';
import { MessageCircle, X, CheckCircle2, Clock, Zap } from 'lucide-react';

const WhatsAppContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  const whatsappNumber = "919559262525";
  const whatsappMessage = "Hello! I'm interested in learning more about RitzYard services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) return 100;
          return prev + 2;
        });
      }, 20);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleWhatsAppClick = () => {
    window.open(whatsappUrl, '_blank');
    setIsOpen(false);
  };

  const features = [
    { icon: Zap, text: 'Instant Response', time: '< 5 min' },
    { icon: CheckCircle2, text: 'Expert Support', time: '24/7' },
    { icon: Clock, text: 'Quick Resolution', time: '1 hour' }
  ];

  return (
    <>
      {/* Centered Modal */}
      {isOpen && (
        
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="glass-card border-2 border-primary/20 shadow-elegant overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-primary/20 to-primary-glow/10 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="bg-gradient-to-r from-green-500/15 via-emerald-500/15 to-green-600/15 border-b border-green-400/20 p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">Chat with us</h3>
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">Always here to help</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-5 bg-muted/30 border-b border-border/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Connecting to WhatsApp...</span>
                    <span className="text-sm font-bold text-green-600 tabular-nums">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted border border-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full transition-all duration-100 shadow-sm"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-6">
                  {features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className="glass-morphism p-4 text-center transition-all duration-300 hover:bg-green-500/10 hover:border-green-400/30 group"
                      >
                        <Icon className="w-6 h-6 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-semibold text-foreground mb-1 leading-tight">{feature.text}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-bold">{feature.time}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="px-6 pb-6">
                  <button
                    onClick={handleWhatsAppClick}
                    className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <MessageCircle className="w-5 h-5 relative group-hover:scale-110 transition-transform" />
                    <span className="relative">Start Chat on WhatsApp</span>
                  </button>
                </div>

                <div className="px-6 pb-6">
                  <p className="text-xs text-muted-foreground text-center">
                    ✓ No sign-up required • Direct chat with our team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button - Top of stack */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95 ${
          isOpen ? 'scale-110 shadow-xl shadow-green-500/40' : ''
        }`}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:scale-110 relative z-10" />
      </button>
    </>
  );
};

export default WhatsAppContact;
