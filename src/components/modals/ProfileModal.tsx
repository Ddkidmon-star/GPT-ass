import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  X,
  User,
  ShieldCheck,
  Copy,
  Check,
  LogOut,
  LogIn,
  KeyRound,
  Mail,
  Loader2,
  Database,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, signIn, signUp, signOut } = useBanking();
  const [authMode, setAuthMode] = useState<'profile' | 'signin' | 'signup'>('profile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.success) {
      setAuthMode('profile');
    } else {
      setError(res.error || 'Login failed');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return;
    }
    setError(null);
    setLoading(true);
    const res = await signUp(email, password, fullName);
    setLoading(false);
    if (res.success) {
      setAuthMode('profile');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-[#181a20] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar border border-white/10 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white leading-tight">
              {authMode === 'profile'
                ? 'Account & Profile'
                : authMode === 'signin'
                ? 'Sign In to GPT BANK'
                : 'Create GPT Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authMode === 'profile' ? (
          <div className="mt-4 space-y-4">
            {/* User Avatar Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1c1e24] to-[#121317] border border-white/10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-0.5 shadow-md shrink-0">
                <div className="w-full h-full rounded-full bg-[#181a20] flex items-center justify-center text-xl font-black text-emerald-400">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-white truncate">{user?.name}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="text-xs font-semibold text-emerald-400 font-mono block">
                  {user?.tag}
                </span>
                <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-[#121317] rounded-2xl p-4 border border-white/5 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-emerald-400">{user?.account_number}</span>
                  <button
                    onClick={() => handleCopy(user?.account_number || '')}
                    className="p-1 text-gray-400 hover:text-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Tier</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/20">
                  {user?.tier || 'Tier 3 Unlimited'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">KYC Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fully Verified
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-gray-400">Bank Security</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-bit Encrypted
                </span>
              </div>
            </div>

            {/* Auth Switch Actions */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setAuthMode('signin')}
                  className="py-3 rounded-2xl bg-[#121317] hover:bg-white/5 text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Supabase Sign In</span>
                </button>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="py-3 rounded-2xl bg-[#121317] hover:bg-white/5 text-gray-200 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/10"
                >
                  <User className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>

              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="w-full py-3 rounded-2xl border border-rose-800/40 text-rose-400 hover:bg-rose-950/20 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In or Sign Up Form */
          <form
            onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}
            className="mt-4 space-y-3.5"
          >
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#121317] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gptbank.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121317] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#121317] border border-white/10 rounded-xl text-xs font-medium text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800/40 rounded-xl text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{authMode === 'signin' ? 'Sign In' : 'Create Supabase Account'}</span>
              )}
            </button>

            <div className="flex justify-between items-center text-xs pt-1 text-gray-400">
              <button
                type="button"
                onClick={() => setAuthMode('profile')}
                className="text-gray-400 hover:text-white"
              >
                Back to Profile
              </button>
              <button
                type="button"
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-emerald-400 font-bold hover:underline"
              >
                {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already have account? Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
