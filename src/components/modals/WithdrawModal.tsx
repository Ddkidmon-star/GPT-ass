import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { formatNaira } from '../../utils/currency';
import { X, ArrowUpRight, Building2, Lock, Loader2, AlertCircle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose }) => {
  const { wallet, withdraw } = useBanking();
  const [step, setStep] = useState<'amount' | 'pin'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [bank, setBank] = useState<string>('Guaranty Trust Bank (GTBank)');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentBal = wallet?.balance ?? 0;

  const handleNext = () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (val > currentBal) {
      setError(`Amount exceeds your balance (${formatNaira(currentBal)})`);
      return;
    }
    if (!accountNumber || accountNumber.length !== 10) {
      setError('Please enter a valid 10-digit NUBAN account number');
      return;
    }
    setError(null);
    setStep('pin');
  };

  const handlePinDigit = (digit: string) => {
    setError(null);
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 4) {
      handlePinSubmit(nextPin);
    }
  };

  const handlePinBackspace = () => {
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  const handlePinSubmit = async (pinToUse: string) => {
    if (pinToUse.length !== 4) {
      setError('Please enter your 4-digit Transfer PIN');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const val = parseFloat(amount);
      const res = await withdraw(val, `${bank} (${accountNumber.slice(-4)})`, pinToUse);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep('amount');
          setAmount('');
          setPin('');
          onClose();
        }, 1500);
      } else {
        setError(res.error || 'Withdrawal failed');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing withdrawal');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const banks = [
    'Guaranty Trust Bank (GTBank)',
    'Access Bank',
    'Zenith Bank',
    'First Bank of Nigeria',
    'United Bank for Africa (UBA)',
    'Kuda Bank',
    'OPay Digital Services',
    'PalmPay',
    'Moniepoint MFB',
    'Stanbic IBTC Bank',
    'Fidelity Bank',
    'Sterling Bank',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Withdraw Funds</h3>
              <p className="text-xs text-gray-400">Instant payout to your Nigerian bank account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Withdrawal Processed!</h4>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              {formatNaira(parseFloat(amount) || 0)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Dispatched to {bank}</p>
          </div>
        ) : step === 'amount' ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Select Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full p-3 rounded-2xl border border-white/10 bg-[#121317] text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
              >
                {banks.map((b) => (
                  <option key={b} value={b} className="bg-[#181a20] text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                10-Digit Account Number (NUBAN)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="0123456789"
                className="w-full p-3 rounded-2xl border border-white/10 bg-[#121317] text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500 tracking-wider"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Withdrawal Amount</label>
                <span className="text-[11px] font-medium text-gray-400">
                  Bal: {formatNaira(currentBal)}
                </span>
              </div>
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
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-700/25 transition"
            >
              Continue to PIN Authorization
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 stroke-[2.3]" />
            </div>

            <h4 className="text-base font-bold text-white">Enter 4-Digit Transfer PIN</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Authorize withdrawal of <span className="font-bold text-emerald-400">{formatNaira(parseFloat(amount) || 0)}</span>
            </p>

            <div className="flex items-center justify-center gap-3.5 my-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    i < pin.length
                      ? 'bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                      : 'bg-white/10 border border-white/20'
                  }`}
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 px-3 py-1.5 rounded-xl mb-3 border border-rose-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px] mb-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={loading}
                  onClick={() => handlePinDigit(digit)}
                  className="h-11 rounded-2xl bg-[#121317] hover:bg-white/10 active:scale-95 text-lg font-bold text-white transition border border-white/10 flex items-center justify-center"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                disabled={loading}
                onClick={() => setPin('')}
                className="h-11 rounded-2xl bg-[#121317] text-xs font-bold text-gray-400 border border-white/10 flex items-center justify-center"
              >
                Clear
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handlePinDigit('0')}
                className="h-11 rounded-2xl bg-[#121317] hover:bg-white/10 active:scale-95 text-lg font-bold text-white transition border border-white/10 flex items-center justify-center"
              >
                0
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handlePinBackspace}
                className="h-11 rounded-2xl bg-[#121317] hover:bg-rose-950/30 text-sm font-bold text-gray-300 border border-white/10 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 my-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payout...</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep('amount');
                setPin('');
                setError(null);
              }}
              className="mt-2 text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              ← Edit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
