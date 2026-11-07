import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import {
  User,
  ShieldCheck,
  Lock,
  KeyRound,
  FileText,
  Headphones,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MeViewProps {
  onOpenSecurityPins: () => void;
  onOpenStatement: () => void;
}

export const MeView: React.FC<MeViewProps> = ({
  onOpenSecurityPins,
  onOpenStatement,
}) => {
  const { user, signOut, lockApp } = useBanking();
  const [copiedAcc, setCopiedAcc] = useState(false);

  const displayName = user?.name || 'GPT Member';
  const accNum = user?.account_number || '2049182371';

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(accNum);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  return (
    <div className="w-full space-y-4 pb-20 text-white animate-in fade-in duration-150">
      {/* User Profile Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#741622] via-[#561019] to-[#380a11] border border-red-900/40 shadow-xl flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-red-400/40 flex items-center justify-center text-xl font-black text-rose-300 shadow-md shrink-0">
          {displayName.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-white truncate">{displayName}</h2>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Tier 3
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
            <span className="font-mono text-gray-200">{accNum}</span>
            <button
              onClick={handleCopyAcc}
              className="text-gray-400 hover:text-white"
              title="Copy NUBAN Account Number"
            >
              {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <span className="text-gray-400">• Wema / GPT Bank</span>
          </div>

          <p className="text-[11px] text-gray-400 truncate mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Security Settings Section */}
      <div className="p-4 rounded-2xl bg-[#1c1e24] border border-white/5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Security & PIN Credentials
        </h3>

        <div className="divide-y divide-white/5">
          <button
            onClick={onOpenSecurityPins}
            className="w-full py-3 flex items-center justify-between text-left group transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-950/60 text-red-300 border border-red-800/40 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  6-Digit App Lock PIN
                </span>
                <span className="text-[11px] text-gray-400">
                  Required to unlock app every time it opens
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={onOpenSecurityPins}
            className="w-full py-3 flex items-center justify-between text-left group transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  4-Digit Transfer PIN
                </span>
                <span className="text-[11px] text-gray-400">
                  Required to authorize bank transfers & payouts
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={lockApp}
            className="w-full py-3 flex items-center justify-between text-left group transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-gray-300 border border-white/5 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  Lock App Screen Now
                </span>
                <span className="text-[11px] text-gray-400">
                  Instantly lock session for security
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Banking Records & Assistance */}
      <div className="p-4 rounded-2xl bg-[#1c1e24] border border-white/5 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Account Services
        </h3>

        <div className="divide-y divide-white/5">
          <button
            onClick={onOpenStatement}
            className="w-full py-3 flex items-center justify-between text-left group transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-950/60 text-blue-300 border border-blue-800/40 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  E-Statement & Transaction History
                </span>
                <span className="text-[11px] text-gray-400">
                  View and verify all NGN credits and debits
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            onClick={() => alert('Official Support: support@gptbank.ng | Live WhatsApp Banking Active')}
            className="w-full py-3 flex items-center justify-between text-left group transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  24/7 Live Support
                </span>
                <span className="text-[11px] text-gray-400">
                  Assistance with Paystack deposits and bank transfers
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => signOut()}
        className="w-full py-3 rounded-2xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/50 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99]"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of GPT BANK</span>
      </button>
    </div>
  );
};
