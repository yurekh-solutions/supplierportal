import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TranslationPopupProps {
  isOpen: boolean;
  isTranslating: boolean;
  language: string;
}

export const TranslationPopup = ({
  isOpen,
  isTranslating,
  language,
}: TranslationPopupProps) => {
  const { t } = useTranslation();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with proper z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999]"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          />

          {/* Perfectly Centered Popup - Guaranteed center alignment */}
          <div className="fixed top-0 left-0 right-0 bottom-1800 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.5,
              }}
              className="w-full max-w-lg mx-auto"
            >
              <div className="relative bg-gradient-to-br from-white via-white to-gray-50 rounded-3xl shadow-2xl p-12 border-2 border-white/60 overflow-hidden">
                {/* Animated gradient background */}
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.05) 100%)",
                      "linear-gradient(225deg, hsl(var(--secondary) / 0.1) 0%, hsl(var(--primary) / 0.05) 100%)",
                      "linear-gradient(135deg, hsl(var(--primary) / 0.1) 0%, hsl(var(--secondary) / 0.05) 100%)",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Decorative corners */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-secondary/10 to-transparent rounded-tr-full" />

                {/* Main content */}
                <div className="relative flex flex-col items-center justify-center text-center space-y-8 min-h-[300px]">

                  {isTranslating ? (
                    <>
                      {/* Loading animation */}
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute inset-0 w-32 h-32 -m-4"
                        >
                          <div className="w-full h-full rounded-full border-4 border-transparent border-t-primary/40 border-r-secondary/40" />
                        </motion.div>

                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-primary via-primary/90 to-secondary flex items-center justify-center shadow-2xl">
                            <Languages className="w-14 h-14 text-white" />
                            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
                          </div>
                        </motion.div>

                        {/* Pulsing rings */}
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                          className="absolute inset-0 -m-2 rounded-full border-4 border-primary/40"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: 0.4,
                          }}
                          className="absolute inset-0 rounded-full border-4 border-secondary/30"
                        />
                      </div>

                      <div className="space-y-4">
                        <motion.h3
                          className="text-4xl font-bold text-primary"
                          animate={{ opacity: [1, 0.8, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {t('common.translating')}
                        </motion.h3>
                        <p className="text-gray-700 text-xl font-medium">
                          {t('common.convertingTo')}{" "}
                          <span className="font-bold text-primary text-2xl">{language}</span>
                        </p>
                      </div>

                      <motion.div
                        className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-8 py-4 rounded-full border border-primary/20"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-base font-semibold text-gray-700">
                          {t('common.pleaseWait')}
                        </span>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      {/* Success Animation */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 12,
                        }}
                        className="relative"
                      >
                        <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center shadow-2xl">
                          <CheckCircle2 className="w-14 h-14 text-white" />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-4"
                      >
                        <h3 className="text-4xl font-bold text-green-600">
                          {t('common.translationComplete')}
                        </h3>
                        <p className="text-gray-700 text-xl font-medium">
                          {t('common.nowIn')}{" "}
                          <span className="font-bold text-green-600 text-2xl">{language}</span>
                        </p>
                      </motion.div>

                      <div className="w-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                          className="h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full shadow-lg"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
