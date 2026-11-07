import React from 'react';
import {
  MessageSquare,
  Landmark,
  Shield,
  HandCoins,
  Smartphone,
  Wifi,
  CircleDot,
  Tv,
  PiggyBank,
  Wallet,
  Megaphone,
  Grid,
} from 'lucide-react';

interface QuickActionGridProps {
  onTransferTag: () => void;
  onTransferBank: () => void;
  onSaveClick: () => void;
  onLoanClick: () => void;
  onAirtimeClick: () => void;
  onDataClick: () => void;
  onBettingClick: () => void;
  onTVClick: () => void;
  onWealthClick: () => void;
  onLoanCenterClick: () => void;
  onInvitationClick: () => void;
  onMoreClick: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onTransferTag,
  onTransferBank,
  onSaveClick,
  onLoanClick,
  onAirtimeClick,
  onDataClick,
  onBettingClick,
  onTVClick,
  onWealthClick,
  onLoanCenterClick,
  onInvitationClick,
  onMoreClick,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* 1. Top Primary Action Bar: 4 Rounded Square Icons matching IMG_5094 */}
      <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#1c1e24] border border-white/5 shadow-md">
        {/* To OPay / To Tag */}
        <button
          onClick={onTransferTag}
          className="flex flex-col items-center text-center group active:scale-95 transition"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#14151a] border border-white/5 flex items-center justify-center text-[#00D18F] group-hover:bg-[#181a20] transition shadow-inner mb-1.5">
            <MessageSquare className="w-6 h-6 stroke-[2.2] fill-[#00D18F]/20" />
          </div>
          <span className="text-[11px] font-semibold text-gray-200 leading-tight">
            To GPT Tag
          </span>
        </button>

        {/* To Bank */}
        <button
          onClick={onTransferBank}
          className="flex flex-col items-center text-center group active:scale-95 transition"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#14151a] border border-white/5 flex items-center justify-center text-[#00D18F] group-hover:bg-[#181a20] transition shadow-inner mb-1.5">
            <Landmark className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-semibold text-gray-200 leading-tight">
            To Bank
          </span>
        </button>

        {/* Save */}
        <button
          onClick={onSaveClick}
          className="flex flex-col items-center text-center group active:scale-95 transition"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#14151a] border border-white/5 flex items-center justify-center text-[#00D18F] group-hover:bg-[#181a20] transition shadow-inner mb-1.5">
            <Shield className="w-6 h-6 stroke-[2.2] fill-[#00D18F]/20" />
          </div>
          <span className="text-[11px] font-semibold text-gray-200 leading-tight">
            Save
          </span>
        </button>

        {/* Loan */}
        <button
          onClick={onLoanClick}
          className="flex flex-col items-center text-center group active:scale-95 transition"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#14151a] border border-white/5 flex items-center justify-center text-[#00D18F] group-hover:bg-[#181a20] transition shadow-inner mb-1.5">
            <HandCoins className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-[11px] font-semibold text-gray-200 leading-tight">
            Loan
          </span>
        </button>
      </div>

      {/* 2. Secondary Services 2x4 Grid matching IMG_5094 */}
      <div className="p-4 rounded-2xl bg-[#1c1e24] border border-white/5 shadow-md">
        <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
          {/* Row 1: Airtime, Data, Betting, TV */}
          <button
            onClick={onAirtimeClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Smartphone className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">Airtime</span>
          </button>

          <button
            onClick={onDataClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Wifi className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">Data</span>
          </button>

          <button
            onClick={onBettingClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <CircleDot className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">Betting</span>
          </button>

          <button
            onClick={onTVClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Tv className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">TV</span>
          </button>

          {/* Row 2: OWealth, Loan Center, Invitation, More */}
          <button
            onClick={onWealthClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <PiggyBank className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 truncate w-full">OWealth</span>
          </button>

          <button
            onClick={onLoanCenterClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Wallet className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300 truncate w-full">Loan Center</span>
          </button>

          <button
            onClick={onInvitationClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Megaphone className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">Invitation</span>
          </button>

          <button
            onClick={onMoreClick}
            className="flex flex-col items-center group active:scale-95 transition"
          >
            <div className="w-11 h-11 rounded-full bg-[#131418] border border-white/10 flex items-center justify-center text-white mb-1.5 group-hover:border-emerald-500 transition shadow-inner">
              <Grid className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[11px] font-medium text-gray-300">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};
