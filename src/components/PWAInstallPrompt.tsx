import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const dismissed = localStorage.getItem('pwa-install-dismissed');

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const bip = e as BeforeInstallPromptEvent;
      setDeferredPrompt(bip);
      if (!dismissed && window.innerWidth < 768) setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((error) => console.error('Service Worker registration failed:', error));
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!isMobile || !showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-24 left-4 right-4 z-40"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          <div className="relative rounded-2xl border border-primary/20 bg-gradient-to-br from-background/95 via-background/90 to-primary/10 backdrop-blur-xl shadow-2xl shadow-primary/15 p-5">
            <button
              onClick={handleDismiss}
              className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} w-8 h-8 rounded-full border border-primary/30 bg-background/60 flex items-center justify-center text-primary/70 hover:text-primary hover:border-primary transition`}
            >
              <X size={16} />
            </button>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/20">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-lg text-foreground leading-snug">
                  {isRTL ? 'ثبّت تطبيق الموقع' : 'Install the site app'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isRTL
                    ? 'تجربة أسرع وأقصر للوصول إلى المحتوى والخدمات دون فتح المتصفح.'
                    : 'Faster access to your content and services without reopening the browser.'}
                </p>
                <ButtonBar isRTL={isRTL} onInstall={handleInstall} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ButtonBar = ({ isRTL, onInstall }: { isRTL: boolean; onInstall: () => void }) => (
  <button
    onClick={onInstall}
    className="w-full mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold py-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition"
  >
    <Download size={18} />
    {isRTL ? 'تثبيت الآن' : 'Install now'}
  </button>
);
