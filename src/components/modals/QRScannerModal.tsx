import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { X, QrCode, ScanLine, Copy, Check, Sparkles } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScannedRecipient: (recipient: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScannedRecipient,
}) => {
  const { user } = useBanking();
  const [tab, setTab] = useState<'myqr' | 'scan'>('myqr');
  const [copied, setCopied] = useState(false);
  const [simulatedScanning, setSimulatedScanning] = useState(false);

  if (!isOpen) return null;

  const handleCopyAcc = () => {
    if (user?.account_number) {
      navigator.clipboard.writeText(user.account_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSimulatedScan = (tag: string) => {
    setSimulatedScanning(true);
    setTimeout(() => {
      setSimulatedScanning(false);
      onScannedRecipient(tag);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">GPT QR Pay</h3>
              <p className="text-xs text-gray-400">Scan or share your QR for instant transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-[#121317] rounded-xl border border-white/5">
          <button
            onClick={() => setTab('myqr')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'myqr' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>My QR Code</span>
          </button>
          <button
            onClick={() => setTab('scan')}
            className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'scan' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>Scan to Pay</span>
          </button>
        </div>

        {tab === 'myqr' ? (
          <div className="mt-6 flex flex-col items-center text-center">
            {/* Generated QR Code Card */}
            <div className="p-6 bg-[#121317] rounded-3xl border border-white/10 shadow-md flex flex-col items-center">
              {/* Custom SVG QR Code for user */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-inner border border-gray-100 flex items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900 fill-current">
                  {/* Top-left position block */}
                  <rect x="5" y="5" width="26" height="26" rx="4" fill="#000000" />
                  <rect x="9" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="13" width="10" height="10" rx="1" fill="#00B875" />

                  {/* Top-right position block */}
                  <rect x="69" y="5" width="26" height="26" rx="4" fill="#000000" />
                  <rect x="73" y="9" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="77" y="13" width="10" height="10" rx="1" fill="#00B875" />

                  {/* Bottom-left position block */}
                  <rect x="5" y="69" width="26" height="26" rx="4" fill="#000000" />
                  <rect x="9" y="73" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="13" y="77" width="10" height="10" rx="1" fill="#00B875" />

                  {/* QR Matrix Data Pattern Dots */}
                  <circle cx="42" cy="12" r="3" fill="#111827" />
                  <circle cx="54" cy="12" r="3" fill="#111827" />
                  <circle cx="48" cy="24" r="3" fill="#111827" />
                  <circle cx="60" cy="24" r="3" fill="#111827" />
                  <circle cx="12" cy="42" r="3" fill="#111827" />
                  <circle cx="24" cy="48" r="3" fill="#111827" />
                  <circle cx="12" cy="54" r="3" fill="#111827" />

                  {/* Center GPT Bank Shield Logo */}
                  <rect x="36" y="36" width="28" height="28" rx="7" fill="#00B875" />
                  <text
                    x="50"
                    y="54"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    GPT
                  </text>

                  {/* Additional data elements */}
                  <circle cx="75" cy="42" r="3" fill="#111827" />
                  <circle cx="85" cy="50" r="3" fill="#111827" />
                  <circle cx="70" cy="58" r="3" fill="#111827" />
                  <circle cx="45" cy="72" r="3" fill="#111827" />
                  <circle cx="55" cy="80" r="3" fill="#111827" />
                  <circle cx="42" cy="88" r="3" fill="#111827" />
                  <circle cx="75" cy="75" r="3" fill="#111827" />
                  <circle cx="88" cy="88" r="3" fill="#111827" />
                </svg>
              </div>

              <div className="mt-3">
                <span className="text-sm font-bold text-white block">{user?.name}</span>
                <span className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-500/20">
                  {user?.tag}
                </span>
              </div>
            </div>

            <div className="w-full mt-4 p-3 bg-[#121317] border border-white/5 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 block">Account Number</span>
                <span className="text-sm font-mono font-bold text-white">
                  {user?.account_number || '8092837411'}
                </span>
              </div>
              <button
                onClick={handleCopyAcc}
                className="flex items-center gap-1 bg-[#181a20] border border-white/10 text-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-white/5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Viewfinder simulation */}
            <div className="relative w-full h-56 bg-black rounded-3xl overflow-hidden flex flex-col items-center justify-center border-2 border-emerald-500/40 shadow-inner">
              <div className="absolute inset-8 border-2 border-emerald-400/80 rounded-2xl flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
              </div>
              <span className="relative z-10 text-xs font-bold text-white/90 bg-black/70 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                Align QR Code inside frame
              </span>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-400 block mb-2">
                Simulate Scanning Demo Merchant:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulatedScan('@starbucks')}
                  disabled={simulatedScanning}
                  className="p-2.5 bg-[#121317] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-200 flex items-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan Starbucks Pay</span>
                </button>
                <button
                  onClick={() => handleSimulatedScan('@ubereats')}
                  disabled={simulatedScanning}
                  className="p-2.5 bg-[#121317] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-200 flex items-center gap-2 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Scan UberEats Merchant</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
