import React, { useState } from 'react';
import { Transaction } from '../../types/banking';
import { formatNaira } from '../../utils/currency';
import { X, CheckCircle2, Copy, Check, Share2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  currency?: 'NGN';
  usdToNgnRate?: number;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  transaction,
  onClose,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [shared, setShared] = useState(false);

  if (!transaction) return null;

  const isCredit = transaction.type === 'deposit' || transaction.type === 'reward';
  const formattedAmount = `${isCredit ? '+' : '-'}${formatNaira(transaction.amount)}`;

  const copyRef = () => {
    navigator.clipboard.writeText(transaction.reference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleShare = async () => {
    const text = `GPT BANK Transaction Receipt\nRef: ${transaction.reference}\nAmount: ${formattedAmount}\nStatus: ${transaction.status}\nDate: ${new Date(transaction.created_at).toLocaleString()}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GPT BANK Receipt',
          text,
        });
      } catch (e) {
        // user cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Close Button */}
        <div className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
              GPT BANK RECEIPT
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Status Badge */}
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {transaction.status}
          </h4>
          <div
            className={`text-3xl font-black tracking-tight mt-1 ${
              isCredit ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {isCredit ? '+' : '-'}
            {formattedAmount}
          </div>
          <p className="text-xs font-bold text-gray-300 mt-1">{transaction.title}</p>
        </div>

        {/* Receipt Details Card */}
        <div className="bg-[#121317] rounded-2xl p-4 border border-white/5 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction Type</span>
            <span className="font-bold text-white capitalize">{transaction.type}</span>
          </div>

          {transaction.recipient && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Recipient / Destination</span>
              <span className="font-bold text-white">{transaction.recipient}</span>
            </div>
          )}

          {transaction.description && (
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Description</span>
              <span className="font-bold text-white text-right max-w-[200px] truncate">
                {transaction.description}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Transaction Fee</span>
            <span className="font-bold text-emerald-400">₦0.00 (Zero Fee)</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-400">Date & Time</span>
            <span className="font-bold text-white">
              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-gray-400">Reference No.</span>
            <button
              onClick={copyRef}
              className="flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg hover:bg-emerald-500/20 transition border border-emerald-500/20"
            >
              <span>{transaction.reference}</span>
              {copiedRef ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={handleShare}
            className="flex-1 py-3.5 rounded-2xl bg-[#121317] hover:bg-white/5 border border-white/10 text-gray-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            <span>{shared ? 'Receipt Copied' : 'Share Receipt'}</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
