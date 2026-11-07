import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatNaira } from '../utils/currency';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  Plus,
  CheckCircle2,
  Store,
} from 'lucide-react';

interface BalanceCardProps {
  onDeposit: () => void;
  onTransactionsClick: () => void;
  onSafeBoxClick?: () => void;
  onBusinessClick?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  onDeposit,
  onTransactionsClick,
  onSafeBoxClick,
  onBusinessClick,
}) => {
  const { wallet, isBalanceHidden, toggleBalanceHidden } = useBanking();

  const rawBalance = wallet?.balance ?? 0.0;
  const formattedNGN = formatNaira(rawBalance);

  return (
    <div className="w-full space-y-2 pt-1 pb-1">
      {/* Main Balance Card - Tasteful Dark Red ("not too red, just a little red") */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#741622] via-[#561019] to-[#380a11] p-4 text-white shadow-xl shadow-red-950/30 border border-red-900/40">
        {/* Subtle decorative curved ambient light */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 rounded-full bg-red-400/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-black/30 blur-xl" />

        {/* Top row: Available + Eye + [+ Add Money] Button */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white/95 tracking-tight">
              Available
            </span>
            <button
              onClick={toggleBalanceHidden}
              className="p-1 text-white/70 hover:text-white transition"
              title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
              aria-label="Toggle balance privacy"
            >
              {isBalanceHidden ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* + Add Money Button matching IMG_5094 */}
          <button
            onClick={onDeposit}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Money</span>
          </button>
        </div>

        {/* Big Balance Amount with Chevron Right */}
        <div className="relative z-10 my-2.5">
          <button
            onClick={onTransactionsClick}
            className="flex items-center gap-1 text-left group"
          >
            <span className="text-3xl font-black tracking-tight text-white">
              {isBalanceHidden ? '••••' : formattedNGN}
            </span>
            <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition" />
          </button>

          {/* Subtitle: Earned Today **** */}
          <div className="text-[11px] font-medium text-white/70 mt-1">
            <span>Earned Today </span>
            <span className="font-semibold text-white/90">
              {isBalanceHidden ? '••••' : '₦0.00'}
            </span>
          </div>
        </div>

        {/* SafeBox & Transactions Bar inside card footer matching IMG_5094 */}
        <div className="relative z-10 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            onClick={onSafeBoxClick || onTransactionsClick}
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition text-[11px]"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium">SafeBox Deposit ₦0.00</span>
          </button>

          <button
            onClick={onTransactionsClick}
            className="flex items-center gap-0.5 text-white/80 hover:text-white transition text-[11px] font-semibold"
          >
            <span>Transactions</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Business Service Bar matching IMG_5094 */}
      <button
        onClick={onBusinessClick || onTransactionsClick}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1c1e24] hover:bg-[#22252c] border border-white/5 text-xs transition active:scale-[0.99]"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-white font-medium text-[11px]">
            Business Service - Today's Sales:{' '}
            <strong className="text-emerald-400 font-bold">₦0.00</strong>
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};
