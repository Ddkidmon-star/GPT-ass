import React, { useState, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import { PaystackBank } from '../../types/banking';
import { formatNaira } from '../../utils/currency';
import {
  X,
  Send,
  Building2,
  AtSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Search,
  ChevronDown,
  UserCheck,
  ArrowRight,
} from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipient?: string;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  defaultRecipient = '',
}) => {
  const { wallet, transferToBank, transfer } = useBanking();

  // Mode: 'bank' (Paystack Nigerian Bank) or 'tag' (GPT Bank Tag)
  const [mode, setMode] = useState<'bank' | 'tag'>('bank');

  // Step: 'details' or 'pin'
  const [step, setStep] = useState<'details' | 'pin'>('details');

  // Bank transfer state
  const [banks, setBanks] = useState<PaystackBank[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<PaystackBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Tag transfer state
  const [recipientTag, setRecipientTag] = useState(defaultRecipient || '@gptmember');

  // Amount & note
  const [amount, setAmount] = useState('5000');
  const [note, setNote] = useState('');

  // 4-digit transfer PIN state
  const [transferPin, setTransferPin] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ ref: string; name: string; amount: number } | null>(null);

  const currentBal = wallet?.balance ?? 0;
  const presets = [2000, 5000, 10000, 20000, 50000];

  // Fetch banks from Paystack API via backend on open
  useEffect(() => {
    if (isOpen) {
      fetch('/api/paystack/banks')
        .then((res) => res.json())
        .then((resData) => {
          const list = Array.isArray(resData) ? resData : resData?.data;
          if (Array.isArray(list) && list.length > 0) {
            setBanks(list);
            if (!selectedBank) {
              const defaultBank = list.find((b: any) => b.code === '058') || list[0]; // GTBank or first
              setSelectedBank(defaultBank);
            }
          }
        })
        .catch((err) => console.warn('Could not fetch bank list:', err));
    }
  }, [isOpen]);

  // Real-time Account Resolution via Paystack API
  useEffect(() => {
    if (mode !== 'bank') return;
    const cleanAcc = accountNumber.replace(/\D/g, '');
    if (cleanAcc.length === 10 && selectedBank) {
      setIsResolving(true);
      setResolveError(null);
      setResolvedAccountName(null);

      const timer = setTimeout(() => {
        fetch(
          `/api/paystack/resolve-account?account_number=${encodeURIComponent(
            cleanAcc
          )}&bank_code=${encodeURIComponent(selectedBank.code)}`
        )
          .then((res) => res.json())
          .then((resData) => {
            setIsResolving(false);
            const accountData = resData?.data || resData;
            if (accountData?.account_name) {
              setResolvedAccountName(accountData.account_name);
              setResolveError(null);
            } else {
              setResolveError(resData?.message || resData?.error || 'Could not verify account name');
            }
          })
          .catch(() => {
            setIsResolving(false);
            setResolveError('Account lookup failed');
          });
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setResolvedAccountName(null);
      setResolveError(null);
    }
  }, [accountNumber, selectedBank, mode]);

  if (!isOpen) return null;

  const filteredBanks = banks.filter((b) =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleDetailsContinue = () => {
    setError(null);
    const val = parseFloat(amount);

    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (val > currentBal) {
      setError(`Insufficient balance. Available: ${formatNaira(currentBal)}`);
      return;
    }

    if (mode === 'bank') {
      if (!selectedBank) {
        setError('Please select a destination bank');
        return;
      }
      if (accountNumber.replace(/\D/g, '').length !== 10) {
        setError('Please enter a valid 10-digit NUBAN account number');
        return;
      }
      if (!resolvedAccountName && !resolveError) {
        setError('Verifying beneficiary account details...');
        return;
      }
    } else {
      if (!recipientTag.trim()) {
        setError('Please enter a valid recipient GPT tag');
        return;
      }
    }

    // Proceed to 4-digit PIN confirmation
    setStep('pin');
    setTransferPin('');
  };

  const handlePinDigit = (d: string) => {
    setError(null);
    if (transferPin.length >= 4) return;
    const nextPin = transferPin + d;
    setTransferPin(nextPin);
    if (nextPin.length === 4) {
      executeTransfer(nextPin);
    }
  };

  const handlePinBackspace = () => {
    setError(null);
    setTransferPin((p) => p.slice(0, -1));
  };

  const executeTransfer = async (pinToUse: string) => {
    setError(null);
    setLoading(true);
    const val = parseFloat(amount);

    try {
      if (mode === 'bank' && selectedBank) {
        const beneficiary = resolvedAccountName || 'Verified Beneficiary';
        const res = await transferToBank({
          accountNumber: accountNumber.trim(),
          bankCode: selectedBank.code,
          bankName: selectedBank.name,
          accountName: beneficiary,
          amount: val,
          note: note.trim() || undefined,
          transferPin: pinToUse,
        });

        if (res.success) {
          setSuccess(true);
          setSuccessDetails({
            ref: `TRF_${Date.now().toString().slice(-6)}`,
            name: `${beneficiary} (${selectedBank.name})`,
            amount: val,
          });
          setTimeout(() => {
            resetAndClose();
          }, 2400);
        } else {
          setError(res.error || 'Transfer failed');
          setTransferPin('');
        }
      } else {
        const res = await transfer(val, recipientTag.trim(), note.trim() || undefined, pinToUse);
        if (res.success) {
          setSuccess(true);
          setSuccessDetails({
            ref: `TRF_${Date.now().toString().slice(-6)}`,
            name: recipientTag,
            amount: val,
          });
          setTimeout(() => {
            resetAndClose();
          }, 2400);
        } else {
          setError(res.error || 'Transfer failed');
          setTransferPin('');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred during transfer');
      setTransferPin('');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSuccess(false);
    setSuccessDetails(null);
    setStep('details');
    setTransferPin('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Send className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Send Money</h3>
              <p className="text-xs text-gray-400">
                {step === 'details' ? 'Paystack Nigerian bank transfer' : 'Authorize with 4-digit PIN'}
              </p>
            </div>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {success && successDetails ? (
          <div className="py-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-white">Transfer Successful!</h4>
            <p className="text-2xl font-black text-emerald-400 mt-2">
              {formatNaira(successDetails.amount)}
            </p>
            <p className="text-xs text-gray-300 mt-1">Dispatched to {successDetails.name}</p>
            <div className="mt-4 px-3 py-1.5 bg-[#121317] rounded-xl border border-white/10 text-[11px] font-mono text-gray-400">
              Reference: {successDetails.ref}
            </div>
          </div>
        ) : step === 'details' ? (
          /* Step 1: Details & Beneficiary */
          <div className="mt-4 space-y-4">
            {/* Transfer Mode Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#121317] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setMode('bank')}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'bank'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>To Other Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('tag')}
                className={`py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  mode === 'tag'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <AtSign className="w-3.5 h-3.5" />
                <span>To GPT Tag</span>
              </button>
            </div>

            {mode === 'bank' ? (
              <>
                {/* Destination Bank Dropdown */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Destination Nigerian Bank
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-white/10 bg-[#121317] hover:border-emerald-500 text-left transition"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        {selectedBank ? selectedBank.name : 'Select Nigerian Bank'}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  </button>

                  {/* Searchable dropdown list */}
                  {isBankDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[#1c1e24] rounded-2xl border border-white/10 shadow-2xl max-h-56 overflow-hidden flex flex-col animate-in fade-in duration-150">
                      <div className="p-2 border-b border-white/10 flex items-center gap-2 bg-[#121317]">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={bankSearch}
                          onChange={(e) => setBankSearch(e.target.value)}
                          placeholder="Search bank name..."
                          className="w-full bg-transparent text-xs font-medium text-white focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto no-scrollbar py-1">
                        {filteredBanks.slice(0, 40).map((b) => (
                          <button
                            key={b.code}
                            type="button"
                            onClick={() => {
                              setSelectedBank(b);
                              setIsBankDropdownOpen(false);
                              setBankSearch('');
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-white/10 transition flex items-center justify-between ${
                              selectedBank?.code === b.code ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-gray-200'
                            }`}
                          >
                            <span>{b.name}</span>
                            {selectedBank?.code === b.code && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 10-digit NUBAN Account Number Input */}
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
                    placeholder="e.g. 0123456789"
                    className="w-full p-3 rounded-2xl border border-white/10 bg-[#121317] focus:outline-none focus:border-emerald-500 font-mono text-base font-bold text-white tracking-wider"
                  />
                </div>

                {/* Resolved Account Name Banner */}
                {isResolving ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/40">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Resolving account details via Paystack...</span>
                  </div>
                ) : resolvedAccountName ? (
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-300 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/50 shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{resolvedAccountName}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black shrink-0">
                      Verified
                    </span>
                  </div>
                ) : resolveError ? (
                  <div className="text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-2xl border border-rose-800/50">
                    {resolveError}
                  </div>
                ) : null}
              </>
            ) : (
              /* GPT Bank Tag input */
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Recipient GPT Bank Tag
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-gray-500 font-bold text-sm">@</span>
                  <input
                    type="text"
                    value={recipientTag.replace('@', '')}
                    onChange={(e) => setRecipientTag(`@${e.target.value}`)}
                    placeholder="username"
                    className="w-full pl-8 pr-3 py-3 rounded-2xl border border-white/10 bg-[#121317] focus:outline-none focus:border-emerald-500 text-sm font-bold text-white"
                  />
                </div>
              </div>
            )}

            {/* Amount Input strictly in NGN */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-300">Amount to Send</label>
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

              {/* Quick NGN presets */}
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

            {/* Narration */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Narration / Note (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this for?"
                className="w-full p-3 rounded-2xl border border-white/10 bg-[#121317] text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Next Button */}
            <button
              type="button"
              onClick={handleDetailsContinue}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-700/25 transition flex items-center justify-center gap-2"
            >
              <span>Continue to 4-Digit PIN Authorization</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Step 2: 4-digit Transfer PIN Authorization */
          <div className="mt-4 flex flex-col items-center text-center animate-in fade-in duration-150">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-2">
              <Lock className="w-6 h-6 stroke-[2.3]" />
            </div>

            <h4 className="text-base font-bold text-white">Enter 4-Digit Transfer PIN</h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Confirm transfer of <span className="font-bold text-emerald-400">{formatNaira(parseFloat(amount) || 0)}</span>
            </p>

            {/* 4 PIN Dots */}
            <div className="flex items-center justify-center gap-3.5 my-5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    i < transferPin.length
                      ? 'bg-emerald-400 scale-110 shadow-sm shadow-emerald-400/50'
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

            {/* Numeric Keypad */}
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
                onClick={() => setTransferPin('')}
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
                className="h-11 rounded-2xl bg-[#121317] hover:bg-rose-950 text-sm font-bold text-gray-300 border border-white/10 flex items-center justify-center"
              >
                ⌫
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 my-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing Transfer...</span>
              </div>
            )}

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setStep('details');
                setTransferPin('');
                setError(null);
              }}
              className="mt-2 text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              ← Edit Transfer Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
