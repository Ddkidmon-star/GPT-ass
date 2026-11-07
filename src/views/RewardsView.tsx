import React, { useState } from 'react';
import { Award, Gift, Sparkles, CheckCircle2, AlertCircle, Users, Copy, Check } from 'lucide-react';

export const RewardsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleClaim = (title: string) => {
    // As per user instructions: "Even though you want to put claim, it should not function because I have not put money in the paystack key."
    setNotice(`The claim for "${title}" is inactive because merchant Paystack account funding is not yet enabled. Your base wallet remains active.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://gptbank.app/invite/ddkid');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4 pb-20 text-white animate-in fade-in duration-150">
      <div className="px-1">
        <h2 className="text-xl font-bold text-white leading-tight">Rewards & Benefits</h2>
        <p className="text-xs text-gray-400">Official promotional center & partner vouchers</p>
      </div>

      {notice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>{notice}</span>
        </div>
      )}

      {/* Referral Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#741622] via-[#561019] to-[#380a11] border border-red-900/40 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-rose-300">
          <Users className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Invite Friends to GPT BANK</h3>
        </div>
        <p className="text-xs text-gray-200">
          Share your personal referral link with colleagues and family.
        </p>
        <div className="flex items-center justify-between p-2.5 bg-black/30 rounded-xl border border-white/10 text-xs">
          <span className="font-mono text-gray-300 text-[11px] truncate">
            https://gptbank.app/invite/ddkid
          </span>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white font-bold transition shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Vouchers & Coupons List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
          Available Offers
        </h3>

        {[
          {
            title: '100% Free Bank Transfer Fee Waiver',
            desc: 'Zero fees on all Paystack transfers to any commercial Nigerian bank.',
            badge: 'Active Always',
            tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          },
          {
            title: 'Airtime Recharge Cashback Voucher',
            desc: 'Earn instant cashback on MTN, Airtel, Glo, and 9mobile top-ups.',
            badge: 'Standard 2%',
            tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          },
          {
            title: 'Welcome Merchant Sign-up Reward',
            desc: 'Special account tier upgrade upon first successful NGN deposit.',
            badge: 'Tier Verified',
            tagColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          },
        ].map((item, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-[#1c1e24] border border-white/5 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.tagColor}`}>
                  {item.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">{item.title}</h4>
              <p className="text-[11px] text-gray-400 leading-snug">{item.desc}</p>
            </div>

            <button
              onClick={() => handleClaim(item.title)}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs shrink-0 transition border border-white/10"
            >
              Claim
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
