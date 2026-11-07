import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { formatNaira } from '../../utils/currency';
import { X, Smartphone, Wifi, Sparkles, CheckCircle2, Loader2, Lock, AlertCircle } from 'lucide-react';

interface AirtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AirtimeModal: React.FC<AirtimeModalProps> = ({ isOpen, onClose }) => {
  const { wallet, buyAirtimeOrData } = useBanking();
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [tab, setTab] = useState<'airtime' | 'data'>('airtime');
  const [provider, setProvider] = useState('MTN');
  const [phone, setPhone] = useState('08031234567');
  const [airtimeAmount, setAirtimeAmount] = useState('1000');
  const [selectedPlanId, setSelectedPlanId] = useState('p-2');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const providers = [
    { name: 'MTN', color: 'bg-amber-400 text-black' },
    { name: 'Airtel', color: 'bg-red-500 text-white' },
    { name: 'Glo', color: 'bg-emerald-600 text-white' },
    { name: '9mobile', color: 'bg-emerald-900 text-white' },
  ];

  const dataPlans = [
    { id: 'p-1', name: '1.5 GB Monthly', validity: '30 Days', price: 1000 },
    { id: 'p-2', name: '3.5 GB Monthly', validity: '30 Days', price: 2000 },
    { id: 'p-3', name: '10 GB Super Data', validity: '30 Days', price: 5000 },
    { id: 'p-4', name: '25 GB Heavy Streamer', validity: '30 Days', price: 10000 },
  ];

  const currentBal = wallet?.balance ?? 0;
  const currentCost = tab === 'airtime' ? parseFloat(airtimeAmount) || 0 : (dataPlans.find((p) => p.id === selectedPlanId)?.price || 0);
  const estimatedCashback = Math.round(currentCost * 0.02);

  const handleNext = () => {
    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid 11-digit phone number');
      return;
    }
    if (currentCost <= 0) {
      setError('Select a valid amount');
      return;
    }
    if (currentCost > currentBal) {
      setError(`Insufficient balance (${formatNaira(currentBal)})`);
      return;
    }
    setError(null);
    setStep('pin');
    setPin('');
  };

  const handlePinDigit = (digit: string) => {
    setError(null);
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 4) {
      handleSubmit(nextPin);
    }
  };

  const handlePinBackspace = () => {
    setError(null);
    setPin((p) => p.slice(0, -1));
  };

  const handleSubmit = async (pinToUse: string) => {
    setError(null);
    setLoading(true);

    try {
      const plan = dataPlans.find((p) => p.id === selectedPlanId);
      const res = await buyAirtimeOrData(
        currentCost,
        phone,
        provider,
        tab === 'data',
        plan?.name,
        pinToUse
      );

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep('details');
          setPin('');
          onClose();
        }, 1600);
      } else {
        setError(res.error || 'Transaction failed');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Airtime & Data</h3>
              <p className="text-xs text-gray-400">Instant top-up with 2% instant cashback</p>
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
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h4 className="text-xl font-bold text-white">Recharge Successful!</h4>
            <p className="text-2xl font-black text-emerald-400 mt-2">{formatNaira(currentCost)}</p>
            <p className="text-xs text-gray-400 mt-1">
              Sent to {phone} ({provider})
            </p>
            <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-amber-950/40 rounded-full text-amber-300 text-xs font-bold border border-amber-800/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>+{formatNaira(estimatedCashback)} Cashback Earned</span>
            </div>
          </div>
        ) : step === 'details' ? (
          <div className="mt-4 space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#121317] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setTab('airtime')}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  tab === 'airtime'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Airtime</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('data')}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  tab === 'data'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Internet Data</span>
              </button>
            </div>

            {/* Telco Provider Grid */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Select Network
              </label>
              <div className="grid grid-cols-4 gap-2">
                {providers.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setProvider(p.name)}
                    className={`py-2.5 px-2 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                      provider === p.name
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-xs ring-1 ring-emerald-500/40'
                        : 'border-white/10 bg-[#121317] text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xs font-black">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Recipient Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full p-3 rounded-2xl border border-white/10 bg-[#121317] font-mono text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Airtime amount or Data Plan selection */}
            {tab === 'airtime' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Recharge Amount (NGN)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-lg font-black text-gray-400">₦</span>
                  <input
                    type="number"
                    value={airtimeAmount}
                    onChange={(e) => setAirtimeAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border border-white/10 bg-[#121317] focus:outline-none focus:border-emerald-500 text-xl font-black text-white"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAirtimeAmount(amt.toString())}
                      className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                        airtimeAmount === amt.toString()
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-[#121317] hover:bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Select Data Plan
                </label>
                <div className="space-y-2">
                  {dataPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`w-full p-3 rounded-2xl text-left border transition flex items-center justify-between ${
                        selectedPlanId === plan.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/30'
                          : 'border-white/10 bg-[#121317] hover:bg-white/5 text-gray-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{plan.name}</div>
                        <div className="text-[11px] text-gray-400">{plan.validity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-sm text-emerald-400">
                          {formatNaira(plan.price)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cashback pill */}
            <div className="flex items-center justify-between p-2.5 bg-amber-950/30 rounded-2xl border border-amber-800/30 text-xs">
              <span className="font-medium text-amber-300">2% Instant Cashback</span>
              <span className="font-bold text-amber-400">+{formatNaira(estimatedCashback)}</span>
            </div>

            {error && (
              <div className="text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-700/25 transition"
            >
              Continue to PIN Authorization
            </button>
          </div>
        ) : (
          /* Step 2: 4-digit PIN */
          <div className="mt-4 flex flex-col items-center text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 stroke-[2.3]" />
            </div>

            <h4 className="text-base font-bold text-white">Enter 4-Digit Transfer PIN</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Confirm purchase of <span className="font-bold text-emerald-400">{formatNaira(currentCost)}</span>
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
                <span>Processing Recharge...</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep('details');
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
