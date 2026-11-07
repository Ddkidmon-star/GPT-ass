import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) {
    return null;
  }

  // If installable via Chromium / Android
  if (isInstallable) {
    return (
      <div className="mx-4 mt-2 mb-3 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-3.5 shadow-lg border border-emerald-700/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400 border border-emerald-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold leading-tight text-white">Install GPT BANK</h4>
            <p className="text-xs text-emerald-200/80">Get native app speed, full-screen & offline access</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={install}
            className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-emerald-950 font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition duration-150"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-emerald-300/70 hover:text-white p-1 rounded-lg"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <div className="mx-4 mt-2 mb-3 bg-gradient-to-r from-emerald-900/90 to-emerald-950 text-white rounded-2xl p-3 shadow-md border border-emerald-700/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Add GPT Bank to Home Screen</p>
              <p className="text-[11px] text-emerald-300/80">Tap Share &gt; Add to Home Screen</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowIOSGuide(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium text-xs px-2.5 py-1 rounded-lg border border-emerald-500/30"
            >
              How to
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                    GPT
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Install on iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-gray-600">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div className="pt-0.5">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      Tap the Share button <Share2 className="w-3.5 h-3.5 text-blue-500 inline" />
                    </p>
                    <p className="text-gray-500 text-[11px] mt-0.5">Located at the bottom Safari bar.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div className="pt-0.5">
                    <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                      Select "Add to Home Screen" <PlusSquare className="w-3.5 h-3.5 text-emerald-600 inline" />
                    </p>
                    <p className="text-gray-500 text-[11px] mt-0.5">Scroll down in the share sheet and tap Add.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 active:scale-98 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
