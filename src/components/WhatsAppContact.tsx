import { useState, useEffect } from 'react';
import { MessageCircle, X, CheckCircle2, Clock, Zap } from 'lucide-react';

const WhatsAppContact = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const whatsappNumber = "919136242706";
  const whatsappMessage = "Hello! I'm interested in learning more about RitzYard services.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  // Animate progress bar on dialog open
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + 2));
      }, 30);
      return () => clearInterval(interval);
    }
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
      {/* Floating Button Container */}
      <div
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Dialog Popup - Responsive */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dialog */}
            <div className="fixed bottom-28 right-6 sm:absolute sm:bottom-20 sm:right-0 w-full sm:w-96 max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
              <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 relative">
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-green-500/30 to-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-tr from-emerald-500/30 to-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-green-500/25 via-emerald-500/25 to-green-600/25 border-b border-green-400/30 p-6 sm:p-8">
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-green-500/50 animate-bounce">
                            <MessageCircle className="w-8 h-8 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">Chat with us</h3>
                            <p className="text-xs sm:text-sm text-green-300 font-medium">Always here to help</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-gray-400 hover:text-white flex-shrink-0"
                      >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-6 sm:px-8 pt-6">
                    <div className="mb-2 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-400">Connecting...</span>
                      <span className="text-xs font-bold text-green-400">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 rounded-full transition-all duration-300 shadow-lg shadow-green-500/50"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-3 px-6 sm:px-8 py-6">
                    {features.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white/5 border border-white/10 hover:border-green-400/30 rounded-xl p-3 sm:p-4 text-center transition-all duration-300 hover:bg-green-500/10 group/feature"
                          style={{ animationDelay: `${idx * 100}ms` }}
                        >
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto mb-2 group-hover/feature:scale-110 transition-transform" />
                          <p className="text-xs font-semibold text-white mb-1 line-clamp-2">{feature.text}</p>
                          <p className="text-xs text-green-400 font-bold">{feature.time}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Main CTA Button */}
                  <div className="px-6 sm:px-8 py-4">
                    <button
                      onClick={handleWhatsAppClick}
                      className="w-full bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 text-white font-bold py-3 sm:py-4 px-4 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/50 flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover/btn:translate-x-full transition-transform duration-500"></span>
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 relative group-hover/btn:scale-110 transition-transform" />
                      <span className="relative text-sm sm:text-base font-bold">Start Chat on WhatsApp</span>
                    </button>
                  </div>

                  {/* Footer Text */}
                  <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                    <p className="text-xs text-gray-400 text-center">
                      ✓ No sign-up required • Direct chat with our team
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-green-500 hover:from-green-500 hover:via-emerald-500 hover:to-green-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group/main hover:scale-110 active:scale-95 ${
            isOpen ? 'scale-110 shadow-2xl shadow-green-500/50' : 'scale-100'
          }`}
        >
          {/* Outer pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-green-300/30 animate-pulse"></div>

          {/* Icon */}
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover/main:scale-125 relative z-10" />

          {/* Notification badge */}
          <div className="absolute -top-2 -right-2 min-w-fit h-6 sm:h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold px-2 animate-bounce shadow-lg shadow-red-500/50">
            Chat
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping"></div>
        </button>

        {/* Floating label on hover - Mobile optimized */}
        {isHovered && !isOpen && (
          <div className="absolute bottom-20 sm:bottom-16 right-0 bg-gradient-to-r from-slate-900/95 to-slate-800/95 text-white px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap animate-in fade-in slide-in-from-bottom-2 duration-200 border border-green-400/30 shadow-xl">
            💬 Chat with us now!
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800/95 border-r border-b border-green-400/30 transform rotate-45"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default WhatsAppContact;
