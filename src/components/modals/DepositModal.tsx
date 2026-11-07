import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { openPaystackCheckout } from '../../services/paystack';
import { formatNaira } from '../../utils/currency';
import {
  X,
  CreditCard,
  Building2,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
  ArrowDownLeft,
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshData } = useBanking();
  const [method, setMethod] = useState<'paystack' | 'transfer'>('paystack');
  const [amount, setAmount] = useState<string>('5000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presets = [2000, 5000, 10000, 20000, 50000];

  const handlePaystackDeposit = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid deposit amount in NGN');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await openPaystackCheckout({
        email: user?.email || 'customer@gptbank.ng',
        amount: val,
        currency: 'NGN',
        onSuccess: async (reference) => {
          setLoading(true);
          try {
            const verifyRes = await fetch('/api/paystack/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                reference,
                userId: user?.id || 'default_user',
                amount: val,
              }),
            });

            const data = await verifyRes.json();
            if (verifyRes.ok) {
              setSuccessMsg(`Deposit of ${formatNaira(val)} credited to your wallet!`);
              await refreshData();
              setTimeout(() => {
                setSuccessMsg(null);
                onClose();
              }, 1800);
            } else {
              setError(data.error || 'Verification failed on backend');
            }
          } catch (e: any) {
            setError(e.message || 'Error communicating with backend');
          } finally {
            setLoading(false);
          }
        },
        onCancel: () => {
          setLoading(false);
        },
        onError: (err) => {
          setLoading(false);
          setError(err?.message || 'Paystack checkout could not open');
        },
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Payment initiation failed');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Add Money</h3>
              <p className="text-xs text-gray-400">Fund your wallet in real-time (NGN)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mt-4 p-3.5 bg-emerald-950/60 text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-800 text-center animate-in zoom-in-95">
            {successMsg}
          </div>
        )}

        {/* Deposit Methods Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#121317] rounded-xl border border-white/5 mt-4">
          <button
            onClick={() => setMethod('paystack')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              method === 'paystack'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Paystack Inline</span>
          </button>
          <button
            onClick={() => setMethod('transfer')}
            className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              method === 'transfer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bank Transfer</span>
          </button>
        </div>

        {/* Paystack Inline Checkout Tab */}
        {method === 'paystack' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Deposit Amount (NGN)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-lg font-black text-gray-400">₦</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-[#121317] focus:outline-none focus:border-emerald-500 text-xl font-black text-white"
                />
              </div>

              {/* NGN Quick Presets */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p.toString())}
                    className={`py-1.5 text-[11px] font-bold rounded-xl border transition ${
                      amount === p.toString()
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-[#121317] hover:bg-white/5 text-gray-300 border-white/10'
                    }`}
                  >
                    ₦{(p / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                {error}
              </div>
            )}

            <button
              onClick={handlePaystackDeposit}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-700/25 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Launching Paystack...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay with Paystack ({formatNaira(parseFloat(amount) || 0)})</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secured by Paystack (Debit Card, Bank Transfer, USSD)</span>
            </div>
          </div>
        )}

        {/* Nigerian Virtual Bank Transfer Tab */}
        {method === 'transfer' && (
          <div className="mt-4 space-y-4">
            <div className="bg-[#121317] border border-white/10 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Your Dedicated NUBAN Virtual Account</span>
              </div>
              <p className="text-gray-400 mb-3 text-[11px]">
                Transfer any amount in Naira directly to this account from any banking app (OPay, GTBank, Kuda, Zenith).
                Funds automatically credit your wallet in real time.
              </p>

              <div className="space-y-2 bg-[#1c1e24] rounded-xl p-3 border border-white/5">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 font-medium">Bank Name</span>
                  <span className="font-bold text-white">GPT Bank / Wema Bank</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-gray-400 font-medium">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">
                      {user?.account_number || '2049182371'}
                    </span>
                    <button
                      onClick={() => handleCopy(user?.account_number || '2049182371')}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400 font-medium">Account Name</span>
                  <span className="font-bold text-white">{user?.name || 'GPT Member'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
