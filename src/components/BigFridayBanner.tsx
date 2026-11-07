import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, X } from 'lucide-react';

export const BigFridayBanner: React.FC = () => {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <>
      <div className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d281e] via-[#103024] to-[#0c1f18] p-4 border border-emerald-900/40 text-white shadow-lg">
        {/* Glow overlay */}
        <div className="pointer-events-none absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl" />

        <div className="relative z-10">
          <div className="text-[11px] font-bold text-emerald-400 tracking-wide uppercase mb-1.5">
            Big Friday, Bigger Returns!
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Stylized Big Friday Badge */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-600 border border-purple-400/40 flex flex-col items-center justify-center text-white shrink-0 shadow-md">
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none">
                  BIG
                </span>
                <span className="text-[10px] font-black uppercase tracking-tight text-emerald-300 leading-none">
                  Friday
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  Fixed Savings
                </h4>
                <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                  Today only: Save & earn 25% p.a. returns.
                </p>
              </div>
            </div>

            {/* Go Button matching IMG_5094 */}
            <button
              onClick={() => setShowNotice(true)}
              className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs shrink-0 shadow-md transition"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Transparent modal explaining that claim requires funding */}
      {showNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1a1c22] border border-white/10 rounded-3xl p-5 text-white shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold">Fixed Savings Portal</h3>
              </div>
              <button
                onClick={() => setShowNotice(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-gray-300">
              <p>
                Fixed savings and interest yields are currently in standby mode until your
                business Paystack merchant key is active.
              </p>
              <div className="bg-[#121317] p-3 rounded-xl border border-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-emerald-400">
                  Status: Standard NGN Banking Active
                </div>
                <div className="text-[10px] text-gray-400">
                  All real-time deposits, transfers, and wallet operations are 100% operational.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowNotice(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
};
