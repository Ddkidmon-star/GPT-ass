import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { Transaction } from '../types/banking';
import { formatNaira } from '../utils/currency';
import {
  Gift,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Smartphone,
  ChevronRight,
  ReceiptText,
} from 'lucide-react';

interface RecentActivityProps {
  onSelectTransaction: (tx: Transaction) => void;
  onViewMore: () => void;
  onDepositClick?: () => void;
  limit?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  onSelectTransaction,
  onViewMore,
  onDepositClick,
  limit = 5,
}) => {
  const { transactions } = useBanking();
  const [filter, setFilter] = useState<'all' | 'in' | 'out'>('all');

  const filtered = transactions.filter((tx) => {
    if (filter === 'in') return tx.type === 'deposit';
    if (filter === 'out') return tx.type === 'withdrawal' || tx.type === 'transfer' || tx.type === 'airtime';
    return true;
  });

  const displayed = limit ? filtered.slice(0, limit) : filtered;

  const formatRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days >= 14) return `${Math.floor(days / 7)} wk ago`;
    if (days >= 7) return '1 wk ago';
    if (days > 1) return `${days} d ago`;
    if (days === 1) return 'Yesterday';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  const getTxVisuals = (tx: Transaction) => {
    switch (tx.type) {
      case 'deposit':
        return {
          icon: ArrowDownLeft,
          bgColor: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40',
          isCredit: true,
        };
      case 'withdrawal':
        return {
          icon: ArrowUpRight,
          bgColor: 'bg-rose-950/80 text-rose-400 border border-rose-800/40',
          isCredit: false,
        };
      case 'transfer':
        return {
          icon: Send,
          bgColor: 'bg-blue-950/80 text-blue-400 border border-blue-800/40',
          isCredit: false,
        };
      case 'airtime':
        return {
          icon: Smartphone,
          bgColor: 'bg-amber-950/80 text-amber-400 border border-amber-800/40',
          isCredit: false,
        };
      default:
        return {
          icon: ReceiptText,
          bgColor: 'bg-gray-800 text-gray-300 border border-white/5',
          isCredit: false,
        };
    }
  };

  return (
    <div className="w-full pt-2 pb-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-base font-bold text-white tracking-tight">
          Recent Activity
        </h3>
        {transactions.length > 0 && (
          <button
            onClick={onViewMore}
            className="text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 active:scale-95 px-3 py-1 rounded-full transition"
          >
            View all
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {transactions.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 px-1">
          {(['all', 'in', 'out'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`text-[11px] font-semibold px-3 py-1 rounded-full capitalize transition ${
                filter === t
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-400 hover:text-white bg-[#1c1e24]'
              }`}
            >
              {t === 'all' ? 'All Transactions' : t === 'in' ? 'Money In' : 'Money Out'}
            </button>
          ))}
        </div>
      )}

      {/* Transactions List */}
      {displayed.length === 0 ? (
        <div className="py-8 px-4 text-center border border-dashed border-white/10 rounded-2xl bg-[#1c1e24]">
          <ReceiptText className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-300">No transactions recorded yet</p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Real activity from your Supabase database will appear here.
          </p>
          {onDepositClick && (
            <button
              onClick={onDepositClick}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Make First Deposit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-white/5 rounded-2xl bg-[#1c1e24] border border-white/5 p-2 shadow-md">
          {displayed.map((tx) => {
            const { icon: Icon, bgColor, isCredit } = getTxVisuals(tx);
            const timeStr = formatRelativeTime(tx.created_at);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction(tx)}
                className="flex items-center justify-between p-2.5 hover:bg-white/5 rounded-xl cursor-pointer transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white leading-tight">
                      {tx.title}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {timeStr}
                      {tx.recipient && ` • ${tx.recipient}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-right">
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isCredit ? 'text-emerald-400' : 'text-gray-100'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{formatNaira(tx.amount)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
