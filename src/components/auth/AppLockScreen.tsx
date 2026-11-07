import React, { useState, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import { Lock, ShieldCheck, AlertCircle, Loader2, LogOut, KeyRound } from 'lucide-react';

export const AppLockScreen: React.FC = () => {
  const { user, unlockApp, signOut } = useBanking();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Auto-verify when 6 digits are typed
  useEffect(() => {
    if (pin.length === 6 && !isVerifying) {
      handleUnlock(pin);
    }
  }, [pin]);

  const handleUnlock = async (pinToVerify: string) => {
    setError(null);
    setIsVerifying(true);

    const res = await unlockApp(pinToVerify);
    setIsVerifying(false);

    if (!res.success) {
      setIsShaking(true);
      setError(res.error || 'Incorrect 6-digit PIN');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 500);
    }
  };

  const handleDigit = (d: string) => {
    if (pin.length >= 6 || isVerifying) return;
    setError(null);
    setPin((prev) => prev + d);
  };

  const handleBackspace = () => {
    if (isVerifying) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  // Keyboard listener
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white p-6 outline-none"
    >
      {/* Top Brand & Security Status */}
      <div className="w-full max-w-sm flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          {/* Logo icon matching branding */}
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-base font-black tracking-tight text-white">GPT BANK</span>
        </div>

        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition border border-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Account</span>
        </button>
      </div>

      {/* Main Lock Prompt */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto">
        {/* User Avatar */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 shadow-xl shadow-emerald-500/20">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-black text-emerald-400">
              {user?.name ? user.name[0].toUpperCase() : 'G'}
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 shadow">
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Member'}
        </h2>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">
          Enter your 6-digit App Lock PIN to unlock your account
        </p>

        {/* 6 PIN Dots */}
        <div
          className={`flex items-center justify-center gap-3.5 my-7 ${
            isShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => {
            const isFilled = i < pin.length;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-400 scale-125 shadow-md shadow-emerald-400/50'
                    : 'bg-white/20 border border-white/30'
                }`}
              />
            );
          })}
        </div>

        {/* Error or verifying status */}
        <div className="h-6 flex items-center justify-center mb-4">
          {isVerifying ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying PIN...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        {/* On-Screen Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-emerald-500/30 active:scale-95 text-2xl font-bold text-white transition border border-white/10 shadow-sm flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs font-bold text-gray-400 transition border border-white/5"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-emerald-500/30 active:scale-95 text-2xl font-bold text-white transition border border-white/10 shadow-sm flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-sm font-bold text-gray-300 transition border border-white/5 flex items-center justify-center"
            title="Backspace"
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Footer Security Badge */}
      <div className="pb-4 text-center">
        <span className="text-[11px] font-medium text-emerald-400/80 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Bank-grade 256-bit Encrypted Session
        </span>
      </div>
    </div>
  );
};
