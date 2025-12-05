import { LogOut, X } from 'lucide-react';
import { Button } from '@/pages/components/ui/button';

interface LogoutModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal = ({ isOpen, onConfirm, onCancel }: LogoutModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card border-2 border-white/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-2xl max-w-md w-full animate-in fade-in scale-in duration-300">
          {/* Header with Gradient Background */}
          <div className="bg-gradient-to-r from-primary/10 via-primary-glow/10 to-secondary/10 border-b border-white/20 p-8">
            <div className="flex justify-between items-start mb-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-primary-glow to-secondary flex items-center justify-center shadow-xl animate-glow-pulse">
                <LogOut className="w-10 h-10 text-white" />
              </div>
              <button
                onClick={onCancel}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Confirm Logout
            </h2>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to log out of your account?
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-foreground mb-8">
              You'll need to log in again to access your supplier dashboard.
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-2 border-primary/50 text-primary hover:bg-primary/5 h-12 rounded-lg font-semibold transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                className="bg-gradient-to-r from-primary via-primary-glow to-secondary text-white hover:shadow-xl hover:scale-[1.02] h-12 rounded-lg font-semibold transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-2xl -mr-20 -mt-20 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur-2xl -ml-16 -mb-16 opacity-50"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;
