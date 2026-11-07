import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatNairaWhole } from '../utils/currency';
import {
  CreditCard,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  Sliders,
  Sparkles,
  Plus,
} from 'lucide-react';

export const CardsView: React.FC = () => {
  const { cards, toggleFreezeCard, updateSpendingLimit, user } = useBanking();
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [showCvv, setShowCvv] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingLimit, setEditingLimit] = useState(false);

  const activeCard = cards[selectedCardIdx] || cards[0];

  const handleCopyCard = () => {
    if (activeCard) {
      navigator.clipboard.writeText(activeCard.card_number.replace(/\s+/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!activeCard) return null;

  return (
    <div className="w-full space-y-4 pb-20 text-white animate-in fade-in duration-150">
      {/* Top title */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-white leading-tight">My Cards</h2>
          <p className="text-xs text-gray-400">Virtual & physical GPT debit cards</p>
        </div>
        <button
          onClick={() => alert('New virtual card created and linked to your wallet!')}
          className="flex items-center gap-1 bg-red-950/60 hover:bg-red-900/60 text-red-200 font-bold text-xs px-3 py-1.5 rounded-full border border-red-800/40 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Card</span>
        </button>
      </div>

      {/* Stylized Virtual Debit Card in Luxury Dark Red / Matte Black Finish */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7a1420] via-[#4d0c15] to-[#1f0509] p-6 text-white shadow-2xl border border-red-900/50">
        {/* Holographic light accents */}
        <div className="pointer-events-none absolute -right-12 -top-12 w-48 h-48 rounded-full bg-red-500/20 blur-2xl" />
        <div className="pointer-events-none absolute left-6 -bottom-10 w-40 h-40 rounded-full bg-amber-500/10 blur-xl" />

        <div className="relative z-10 flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm tracking-widest font-black uppercase text-red-300">
              GPT BANK
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/90">
              Virtual Debit
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeCard.is_frozen ? (
              <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
                Frozen
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Card Number */}
        <div className="relative z-10 my-4 flex items-center justify-between">
          <span className="font-mono font-bold text-xl sm:text-2xl tracking-widest text-white">
            {activeCard.card_number}
          </span>
          <button
            onClick={handleCopyCard}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition"
            title="Copy Card Number"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Card Holder & Expiry & CVV */}
        <div className="relative z-10 mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">
              Card Holder
            </span>
            <span className="font-bold text-white tracking-wide">
              {user?.name?.toUpperCase() || 'GPT MEMBER'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-gray-400 block uppercase tracking-wider">
              Expires
            </span>
            <span className="font-mono font-bold text-white">{activeCard.expiry}</span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                CVV
              </span>
              <button
                onClick={() => setShowCvv(!showCvv)}
                className="text-gray-400 hover:text-white"
              >
                {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <span className="font-mono font-bold text-white">
              {showCvv ? activeCard.cvv : '•••'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => toggleFreezeCard(activeCard.id)}
          className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 ${
            activeCard.is_frozen
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/40 border-rose-800 text-rose-300'
          }`}
        >
          {activeCard.is_frozen ? (
            <>
              <Unlock className="w-4 h-4" />
              <span>Unfreeze Card</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Freeze Card</span>
            </>
          )}
        </button>

        <button
          onClick={() => setEditingLimit(!editingLimit)}
          className="p-3.5 rounded-2xl bg-[#1c1e24] hover:bg-[#24262e] border border-white/10 font-bold text-xs text-white flex items-center justify-center gap-2 transition active:scale-98"
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Spend Limits</span>
        </button>
      </div>

      {/* Spending Limit Slider */}
      {editingLimit && (
        <div className="p-4 bg-[#1c1e24] rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300">Monthly Spending Limit</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              {formatNairaWhole(activeCard.spending_limit)}
            </span>
          </div>
          <input
            type="range"
            min="100000"
            max="5000000"
            step="100000"
            value={activeCard.spending_limit}
            onChange={(e) => updateSpendingLimit(activeCard.id, parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>₦100k min</span>
            <span>Spent this month: {formatNairaWhole(activeCard.spent_this_month)}</span>
            <span>₦5.0M max</span>
          </div>
        </div>
      )}

      {/* Security Info */}
      <div className="p-4 bg-[#1c1e24] rounded-2xl border border-white/5 space-y-2 text-xs text-gray-300">
        <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
          <Shield className="w-4 h-4" />
          <span>Card Protection & Safety</span>
        </div>
        <p className="text-[11px] text-gray-400">
          This card is protected by 3D Secure OTP verification and 256-bit bank encryption.
          All online and POS payments deduct directly in Nigerian Naira (₦).
        </p>
      </div>
    </div>
  );
};
