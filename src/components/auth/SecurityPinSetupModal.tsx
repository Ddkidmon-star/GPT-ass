import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { ShieldCheck, Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

type SetupStep = 'app_lock_enter' | 'app_lock_confirm' | 'transfer_enter' | 'transfer_confirm' | 'completing';

export const SecurityPinSetupModal: React.FC = () => {
  const { user, setupSecurityPins } = useBanking();

  const [step, setStep] = useState<SetupStep>('app_lock_enter');
  const [appLockPin, setAppLockPin] = useState('');
  const [appLockConfirm, setAppLockConfirm] = useState('');
  const [transferPin, setTransferPin] = useState('');
  const [transferConfirm, setTransferConfirm] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active PIN based on current step
  const currentPinLength = step.startsWith('app_lock') ? 6 : 4;
  const currentVal =
    step === 'app_lock_enter'
      ? appLockPin
      : step === 'app_lock_confirm'
      ? appLockConfirm
      : step === 'transfer_enter'
      ? transferPin
      : transferConfirm;

  const handleDigit = (d: string) => {
    setError(null);
    if (currentVal.length >= currentPinLength) return;
    const nextVal = currentVal + d;

    if (step === 'app_lock_enter') {
      setAppLockPin(nextVal);
    } else if (step === 'app_lock_confirm') {
      setAppLockConfirm(nextVal);
    } else if (step === 'transfer_enter') {
      setTransferPin(nextVal);
    } else if (step === 'transfer_confirm') {
      setTransferConfirm(nextVal);
    }
  };

  const handleBackspace = () => {
    setError(null);
    if (step === 'app_lock_enter') setAppLockPin((p) => p.slice(0, -1));
    else if (step === 'app_lock_confirm') setAppLockConfirm((p) => p.slice(0, -1));
    else if (step === 'transfer_enter') setTransferPin((p) => p.slice(0, -1));
    else if (step === 'transfer_confirm') setTransferConfirm((p) => p.slice(0, -1));
  };

  const handleNext = async () => {
    setError(null);

    if (step === 'app_lock_enter') {
      if (appLockPin.length !== 6) {
        setError('Please enter a full 6-digit PIN');
        return;
      }
      setStep('app_lock_confirm');
      return;
    }

    if (step === 'app_lock_confirm') {
      if (appLockConfirm.length !== 6) {
        setError('Please confirm all 6 digits');
        return;
      }
      if (appLockConfirm !== appLockPin) {
        setError('PINs do not match. Please re-enter.');
        setAppLockConfirm('');
        return;
      }
      // Move to Screen 2: 4-digit transfer PIN
      setStep('transfer_enter');
      return;
    }

    if (step === 'transfer_enter') {
      if (transferPin.length !== 4) {
        setError('Please enter a full 4-digit transfer PIN');
        return;
      }
      setStep('transfer_confirm');
      return;
    }

    if (step === 'transfer_confirm') {
      if (transferConfirm.length !== 4) {
        setError('Please confirm all 4 digits');
        return;
      }
      if (transferConfirm !== transferPin) {
        setError('Transfer PINs do not match. Please re-enter.');
        setTransferConfirm('');
        return;
      }

      // Both PINs validated! Submit to backend & Supabase
      setIsSubmitting(true);
      setStep('completing');
      const res = await setupSecurityPins(appLockPin, transferPin);

      if (res.success) {
        setIsSubmitting(false);
        // App automatically routes to dashboard
      } else {
        setIsSubmitting(false);
        setError(res.error || 'Failed to save security PINs');
        setStep('transfer_confirm');
      }
    }
  };

  // Keyboard support for typing PIN
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      handleDigit(e.key);
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (e.key === 'Enter') {
      if (currentVal.length === currentPinLength) {
        handleNext();
      }
    }
  };

  const getStepMetadata = () => {
    switch (step) {
      case 'app_lock_enter':
        return {
          tier: 'Security Tier 1 of 2',
          title: 'Create 6-Digit App Lock PIN',
          desc: 'This PIN will be required every time you open GPT BANK to keep your account secure.',
          icon: Lock,
          digits: 6,
          btnText: 'Next: Confirm App Lock PIN',
        };
      case 'app_lock_confirm':
        return {
          tier: 'Security Tier 1 of 2',
          title: 'Confirm App Lock PIN',
          desc: 'Re-enter your 6-digit PIN to ensure accuracy.',
          icon: Lock,
          digits: 6,
          btnText: 'Continue to Transfer PIN',
        };
      case 'transfer_enter':
        return {
          tier: 'Security Tier 2 of 2',
          title: 'Create 4-Digit Transfer PIN',
          desc: 'This PIN will be required whenever you authorize bank transfers, airtime, or payments.',
          icon: KeyRound,
          digits: 4,
          btnText: 'Next: Confirm Transfer PIN',
        };
      case 'transfer_confirm':
        return {
          tier: 'Security Tier 2 of 2',
          title: 'Confirm Transfer PIN',
          desc: 'Re-enter your 4-digit transfer PIN to verify.',
          icon: KeyRound,
          digits: 4,
          btnText: 'Activate Security & Open Bank',
        };
      case 'completing':
        return {
          tier: 'Security Activated',
          title: 'Opening Your Account...',
          desc: 'Your PINs have been encrypted and linked to your Supabase account.',
          icon: ShieldCheck,
          digits: 4,
          btnText: 'Welcome!',
        };
    }
  };

  const meta = getStepMetadata();
  const IconComponent = meta.icon;

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 outline-none"
    >
      <div className="w-full max-w-sm bg-[#181a20] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center relative border border-white/10 text-white">
        {/* Tier Indicator Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          {meta.tier}
        </div>

        {/* Step Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
          <IconComponent className="w-7 h-7 stroke-[2.3]" />
        </div>

        {/* Header Text */}
        <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
          {meta.title}
        </h2>
        <p className="text-xs text-gray-400 mt-1.5 max-w-xs leading-relaxed">
          {meta.desc}
        </p>

        {/* PIN Indicators Dots */}
        <div className="flex items-center justify-center gap-3 my-6">
          {Array.from({ length: meta.digits }).map((_, i) => {
            const isFilled = i < currentVal.length;
            return (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                    : 'bg-white/10 border border-white/20'
                }`}
              />
            );
          })}
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 px-3 py-2 rounded-xl mb-3 border border-rose-800/40 w-full justify-center">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Numeric On-Screen Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[270px] mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-[#121317] hover:bg-white/10 active:scale-95 text-xl font-bold text-white transition border border-white/10 shadow-2xs flex items-center justify-center"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              if (step === 'app_lock_enter') setAppLockPin('');
              else if (step === 'app_lock_confirm') setAppLockConfirm('');
              else if (step === 'transfer_enter') setTransferPin('');
              else setTransferConfirm('');
            }}
            className="h-12 rounded-2xl bg-[#121317] hover:bg-white/5 active:scale-95 text-xs font-bold text-gray-400 transition border border-white/10"
          >
            Clear
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-[#121317] hover:bg-white/10 active:scale-95 text-xl font-bold text-white transition border border-white/10 shadow-2xs flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-[#121317] hover:bg-rose-950/30 active:scale-95 text-sm font-bold text-gray-300 transition border border-white/10 flex items-center justify-center"
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={currentVal.length !== meta.digits || isSubmitting}
          onClick={handleNext}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            currentVal.length === meta.digits && !isSubmitting
              ? 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-700/25'
              : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed shadow-none'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Activating Security...</span>
            </>
          ) : (
            <>
              <span>{meta.btnText}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Back navigation between steps */}
        {step !== 'app_lock_enter' && step !== 'completing' && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setError(null);
              if (step === 'app_lock_confirm') {
                setAppLockConfirm('');
                setStep('app_lock_enter');
              } else if (step === 'transfer_enter') {
                setTransferPin('');
                setStep('app_lock_confirm');
              } else if (step === 'transfer_confirm') {
                setTransferConfirm('');
                setStep('transfer_enter');
              }
            }}
            className="mt-3 text-xs font-semibold text-gray-400 hover:text-white transition"
          >
            ← Back to previous step
          </button>
        )}
      </div>
    </div>
  );
};
