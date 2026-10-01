import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 font-medium transition active:scale-95 shadow-xs cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40 hover:bg-amber-500/25'
            : 'px-3.5 py-2 text-xs rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white dark:text-slate-950 font-bold hover:from-amber-500 hover:to-amber-400 shadow-amber-500/20 shadow-md'
        }`}
        title="Install MSA Real Estate App on your mobile device"
      >
        <Download className="w-3.5 h-3.5 text-amber-800 dark:text-amber-300" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <img
                  src="/src/assets/images/msa_icon_transparent.png"
                  alt="MSA"
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-400 font-brand">
                    Install MSA on Mobile
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    موبائل میں براہ راست ایپ انسٹال کریں
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-700 dark:text-slate-300">
              {isIOS ? (
                /* iOS Safari instructions */
                <>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300">
                    آئی فون پر پلے اسٹور کی ضرورت نہیں، یہ سفاری براؤزر سے براہِ راست فل اسکرین ایپ بن جاتی ہے:
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 shrink-0 font-bold">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">1. سفاری شیئر بٹن دبائیں (Share Button):</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        سفاری براؤزر کی نیچے والی بار میں شیئر آئیکون دبائیں۔
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 shrink-0 font-bold">
                      <PlusSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">2. &quot;Add to Home Screen&quot; منتخب کریں:</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        فہرست نیچے سکرول کر کے &quot;Add to Home Screen&quot; پر کلک کر کے اوپر &quot;Add&quot; دبا دیں۔
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                /* Android Chrome instructions */
                <>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-[11px] text-amber-900 dark:text-amber-300">
                    اینڈرائیڈ پر پلے اسٹور کے بغیر فوری انسٹالیشن کا آسان طریقہ:
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 shrink-0 font-bold text-sm px-3">
                      ⋮
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">1. کروم کے 3 ڈاٹس مینو پر کلک کریں (Three Dots):</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        کروم براؤزر کے اوپر دائیں کونے میں تین نقطوں والے مینو (⋮) کو دبائیں۔
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-400 shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">2. &quot;Install app&quot; یا &quot;Add to Home screen&quot; دبائیں:</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        مینو میں <strong>&quot;Install app&quot;</strong> یا <strong>&quot;Add to Home screen&quot;</strong> (ہوم اسکرین پر شامل کریں) کا آپشن منتخب کریں۔
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold px-2.5">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">3. مکمل انسٹال (Full Screen App):</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        یہ ایپ آپ کے موبائل کی ہوم اسکرین پر عام ایپس کی طرح اپنے آفیشل MSA آئیکون کے ساتھ انسٹال ہو جائے گی اور بغیر براؤزر بار کے فل اسکرین میں چلے گی۔
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              {isInstallable && (
                <button
                  onClick={async () => {
                    await install();
                    setShowGuide(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white dark:text-slate-950 font-bold text-xs hover:from-amber-500 hover:to-amber-400 transition"
                >
                  Direct Install Now
                </button>
              )}
              <button
                onClick={() => setShowGuide(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                سمجھ گیا / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
