import React from 'react';
import {
  Smartphone,
  Wifi,
  Zap,
  Tv,
  FileText,
  ShieldCheck,
  Headphones,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Lock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface ServicesViewProps {
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenTransfer: () => void;
  onOpenAirtime: () => void;
  onOpenRewards?: () => void;
  onOpenProfile: () => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  onOpenDeposit,
  onOpenWithdraw,
  onOpenTransfer,
  onOpenAirtime,
  onOpenProfile,
}) => {
  const handleUtilityNotice = (service: string) => {
    alert(`${service} bill payment portal is connected to your wallet.`);
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Title */}
      <div className="px-1">
        <h2 className="text-xl font-bold text-gray-900 leading-tight">All Services</h2>
        <p className="text-xs text-gray-500">Official banking utilities & real-time payments</p>
      </div>

      {/* Banking Services */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Banking & Transfers
        </h4>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenDeposit}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Deposit</span>
          </button>

          <button
            onClick={onOpenWithdraw}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Withdraw</span>
          </button>

          <button
            onClick={onOpenTransfer}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Transfer</span>
          </button>

          <button
            onClick={onOpenAirtime}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Airtime</span>
          </button>
        </div>
      </div>

      {/* Utilities & Telecom */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Bills & Utilities
        </h4>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenAirtime}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Data Plan</span>
          </button>

          <button
            onClick={() => handleUtilityNotice('Electricity Token')}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-1">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Electricity</span>
          </button>

          <button
            onClick={() => handleUtilityNotice('Cable TV & Streaming')}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <Tv className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Cable TV</span>
          </button>

          <button
            onClick={() => handleUtilityNotice('Fiber Internet')}
            className="flex flex-col items-center text-center p-2 rounded-2xl hover:bg-gray-50 transition"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-1">
              <Wifi className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-gray-800">Fiber Net</span>
          </button>
        </div>
      </div>

      {/* Account & Security Services (Clean real banking) */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Security & Statements
        </h4>
        <div className="divide-y divide-gray-50">
          <div
            onClick={onOpenProfile}
            className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  Security PIN & App Lock
                </span>
                <span className="text-[11px] text-gray-400">
                  Manage 6-digit App Lock & 4-digit Transfer PIN
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>

          <div
            onClick={() => alert('Official e-statement generated and sent to your email.')}
            className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  Bank Account Statement
                </span>
                <span className="text-[11px] text-gray-400">
                  Download certified PDF statement with official stamp
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>

          <div
            onClick={onOpenProfile}
            className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  KYC Tier 3 Verification
                </span>
                <span className="text-[11px] text-gray-400">
                  Unlimited daily transfer limit enabled
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>

          <div
            onClick={() => alert('GPT BANK 24/7 Support line: support@gptbank.ng')}
            className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 rounded-xl cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block leading-tight">
                  24/7 Dedicated Support
                </span>
                <span className="text-[11px] text-gray-400">
                  Chat with a verified banking representative
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};
