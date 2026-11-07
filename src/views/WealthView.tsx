import React, { useState } from 'react';
import { useBanking } from '../context/BankingContext';
import { formatNaira } from '../utils/currency';
import { TrendingUp, ShieldCheck, Lock, ArrowUpRight, ArrowDownLeft, AlertCircle, Sparkles } from 'lucide-react';

export const WealthView: React.FC = () => {
  const { wallet } = useBanking();
  const [safeBoxBal, setSafeBoxBal] = useState(0.0);
  const [notice, setNotice] = useState<string | null>(null);

  const mainBalance = wallet?.balance ?? 0.0;

  const handleAction = (plan: string) => {
    setNotice(`${plan} requires active merchant key funding to unlock automated interest crediting.`);
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div className="w-full space-y-4 pb-20 text-white animate-in fade-in duration-150">
      <div className="px-1">
        <h2 className="text-xl font-bold text-white leading-tight">Wealth & Savings</h2>
        <p className="text-xs text-gray-400">Automated micro-savings and locked portfolios</p>
      </div>

      {notice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main SafeBox Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#741622] via-[#561019] to-[#380a11] border border-red-900/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold text-white/90">SafeBox Savings</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Compounding Daily
          </span>
        </div>

        <div>
          <div className="text-3xl font-black tracking-tight text-white">
            {formatNaira(safeBoxBal)}
          </div>
          <p className="text-[11px] text-gray-300 mt-0.5">
            Main Wallet Balance: {formatNaira(mainBalance)}
          </p>
        </div>

        <div className="pt-2 flex gap-2">
          <button
            onClick={() => handleAction('SafeBox Transfer')}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1 shadow-md"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Deposit to SafeBox</span>
          </button>
          <button
            onClick={() => handleAction('SafeBox Payout')}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1 border border-white/10"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Wealth Plans */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
          High-Yield Plans
        </h3>

        {[
          {
            title: 'Fixed Savings (Big Friday)',
            rate: '25% p.a.',
            minTerm: '30 Days Lock',
            desc: 'Lock funds for a specific tenure with upfront interest returns.',
          },
          {
            title: 'OWealth Flexible Stash',
            rate: '15% p.a.',
            minTerm: 'Instant Access',
            desc: 'Daily interest payout with unrestricted withdrawal rights at any time.',
          },
          {
            title: 'Target Savings Vault',
            rate: '18% p.a.',
            minTerm: 'Custom Goal',
            desc: 'Automated weekly or monthly deductions towards a financial goal.',
          },
        ].map((plan, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#1c1e24] border border-white/5 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-emerald-400">{plan.rate}</span>
                <span className="text-[10px] text-gray-400 font-medium">• {plan.minTerm}</span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">{plan.title}</h4>
              <p className="text-[11px] text-gray-400 leading-snug">{plan.desc}</p>
            </div>

            <button
              onClick={() => handleAction(plan.title)}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs shrink-0 transition"
            >
              Start
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
