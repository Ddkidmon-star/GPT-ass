import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatNaira } from '../utils/currency';
import {
  Send,
  Building2,
  Globe2,
  UserCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface TransfersViewProps {
  onOpenTransfer: (defaultRecipient?: string) => void;
}

export const TransfersView: React.FC<TransfersViewProps> = ({ onOpenTransfer }) => {
  const { wallet, transactions } = useBanking();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('5000');

  const currentBal = wallet?.balance ?? 0.0;
  const transferHistory = transactions.filter((t) => t.type === 'transfer');

  const handleStartTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenTransfer(recipient.trim());
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">Transfers</h2>
        <p className="text-xs text-gray-500">Free, instant transfers between Nigerian banks & GPT tags</p>
      </div>

      {/* Main Transfer Channels */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpenTransfer()}
          className="p-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-3xl flex flex-col items-center text-center shadow-md transition"
        >
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-2">
            <Building2 className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs font-bold leading-tight">To Other Nigerian Bank</span>
          <span className="text-[10px] text-emerald-100 mt-0.5">Paystack Instant</span>
        </button>

        <button
          onClick={() => onOpenTransfer()}
          className="p-4 bg-white hover:bg-gray-50 active:scale-95 text-gray-900 border border-gray-200 rounded-3xl flex flex-col items-center text-center shadow-2xs transition"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <Send className="w-6 h-6 stroke-[2.4]" />
          </div>
          <span className="text-xs font-bold leading-tight">To GPT Bank Tag</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Zero Fee & Instant</span>
        </button>
      </div>

      {/* Direct Transfer Shortcut Box */}
      <form
        onSubmit={handleStartTransfer}
        className="p-4 bg-white rounded-3xl border border-gray-200/80 shadow-2xs space-y-3.5"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Quick Transfer
          </h4>
          <span className="text-[11px] font-semibold text-emerald-700">
            Available: {formatNaira(currentBal)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Recipient Tag, Account No. or Bank
          </label>
          <div className="relative">
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="@username or 10-digit NUBAN"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-hidden focus:border-emerald-500"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
        >
          <span>Continue to Transfer & Verify Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Transfer History */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 px-1">
          Transfer History
        </h4>
        {transferHistory.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-gray-200 rounded-2xl bg-white">
            <p className="text-xs text-gray-400">No transfers sent yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 bg-white rounded-2xl border border-gray-100 p-2 shadow-2xs">
            {transferHistory.map((t) => (
              <div key={t.id} className="p-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{t.title}</span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(t.created_at).toLocaleDateString()} • {t.status}
                  </span>
                </div>
                <span className="font-mono font-bold text-rose-600">-{formatNaira(t.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
