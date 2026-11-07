import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Loader2, ArrowRight, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { signInWithGoogleOAuth, signInWithSupabaseEmail, signUpWithSupabaseEmail, sendPasswordResetEmail } from '../../services/supabase';
import { useBanking } from '../../context/BankingContext';

export function AuthScreen() {
  const { onAuthSuccess } = useBanking();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogleOAuth();
      if (res.error) {
        setErrorMsg(res.error);
        setIsGoogleLoading(false);
      }
      // If url exists, browser redirects to Google OAuth
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be launched');
      setIsGoogleLoading(false);
    }
  };

  // Handle Email Sign In or Sign Up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    if (mode === 'signin') {
      const res = await signInWithSupabaseEmail(email, password);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        onAuthSuccess(res.user);
      }
    } else {
      const res = await signUpWithSupabaseEmail(email, password, name);
      setIsLoading(false);
      if (res.error) {
        setErrorMsg(res.error);
      } else if (res.user) {
        if (res.message) {
          setSuccessMsg(res.message);
        }
        onAuthSuccess(res.user);
      }
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotStatus(null);
    const res = await sendPasswordResetEmail(forgotEmail);
    setForgotLoading(false);
    if (res.success) {
      setForgotStatus({
        success: true,
        message: res.message || 'Password reset link sent to your email.',
      });
    } else {
      setForgotStatus({
        success: false,
        message: res.error || 'Failed to send reset link.',
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f9f6] text-gray-900 flex flex-col justify-between items-center px-6 py-10 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Centered Main Form Container */}
      <div className="w-full max-w-sm my-auto flex flex-col items-center">
        {/* GPT BANK Logo & Title */}
        <div className="flex items-center justify-center gap-3 mb-10 select-none">
          {/* Authentic Woven Geometric Emerald 'G' Motif */}
          <div className="w-12 h-12 relative flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#008753]"
            >
              {/* Interlaced Geometric Woven Square Knot */}
              <rect
                x="8"
                y="8"
                width="32"
                height="32"
                rx="3"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="opacity-80"
              />
              <line x1="4" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="4" y1="32" x2="44" y2="32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="16" y1="4" x2="16" y2="44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="32" y1="4" x2="32" y2="44" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              {/* Inner 'G' connector */}
              <path
                d="M24 24H32V32H16V16H32"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-[#008753]">
            GPT BANK
          </span>
        </div>

        {/* Notifications / Error Banner */}
        {errorMsg && (
          <div className="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="w-full mb-4 px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Blue "Sign in with Google" Pill Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full h-14 bg-[#2B52A7] hover:bg-[#23458F] active:bg-[#1E3B7D] transition-all duration-150 rounded-full flex items-center justify-center px-4 shadow-md shadow-blue-900/15 text-white font-semibold text-base relative cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed group"
        >
          {/* White Circular Badge with Official Google 'G' Logo */}
          <div className="absolute left-3 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-xs">
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-700" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
          </div>
          <span className="ml-7 tracking-wide">Sign in with Google</span>
        </button>

        {/* Divider: "or sign in with email" */}
        <div className="w-full flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-sm font-medium text-gray-800">
            {mode === 'signin' ? 'or sign in with email' : 'or sign up with email'}
          </span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Full Name field (Sign Up mode only) */}
          {mode === 'signup' && (
            <div className="w-full h-14 bg-[#EEF4F0] border border-gray-200/90 rounded-2xl flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#008753]/25 focus-within:border-[#008753]">
              <User className="w-5 h-5 text-[#008753] mr-3 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base font-normal"
              />
            </div>
          )}

          {/* Email input */}
          <div className="w-full h-14 bg-[#EEF4F0] border border-gray-200/90 rounded-2xl flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#008753]/25 focus-within:border-[#008753]">
            <Mail className="w-5 h-5 text-[#008753] mr-3 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base font-normal"
            />
          </div>

          {/* Password input */}
          <div className="w-full h-14 bg-[#EEF4F0] border border-gray-200/90 rounded-2xl flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#008753]/25 focus-within:border-[#008753]">
            <Lock className="w-5 h-5 text-[#008753] mr-3 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 text-base font-normal"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[#008753] hover:text-[#007043] focus:outline-none p-1"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Green Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full h-14 bg-[#008753] hover:bg-[#007447] active:bg-[#00623c] transition-all duration-150 rounded-2xl text-white font-semibold text-base shadow-md shadow-emerald-700/20 flex items-center justify-center cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : mode === 'signin' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          {/* Forgot Password Link (Sign In mode only) */}
          {mode === 'signin' && (
            <div className="w-full flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-sm font-medium text-[#008753] hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}
        </form>

        {/* Toggle between Sign In and Sign Up */}
        <div className="mt-8 text-center text-sm font-medium text-gray-800">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('signup');
                }}
                className="font-bold text-[#008753] hover:underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('signin');
                }}
                className="font-bold text-[#008753] hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl relative border border-gray-100">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStatus(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your registered email and we'll send a link to reset your password.
            </p>

            {forgotStatus && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                  forgotStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {forgotStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span>{forgotStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="h-13 bg-[#EEF4F0] border border-gray-200/90 rounded-2xl flex items-center px-4">
                <Mail className="w-4 h-4 text-[#008753] mr-3" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent outline-none text-gray-800 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={forgotLoading}
                className="w-full py-3.5 bg-[#008753] hover:bg-[#007447] text-white font-semibold text-sm rounded-2xl shadow-sm flex items-center justify-center cursor-pointer disabled:opacity-70"
              >
                {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Subtle Bottom Brand Footer */}
      <div className="text-xs text-gray-400 select-none pb-2">
        GPT BANK &bull; Secure Supabase Authentication
      </div>
    </div>
  );
}
