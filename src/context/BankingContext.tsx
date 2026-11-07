import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  BankUser,
  Wallet,
  Transaction,
  VirtualCard,
} from '../types/banking';
import {
  initSupabaseFromBackend,
  formatSupabaseUser,
  signInWithSupabaseEmail,
  signUpWithSupabaseEmail,
  signOutSupabase,
  updateSupabaseSecurityPins,
} from '../services/supabase';
import confetti from 'canvas-confetti';

interface BankingContextType {
  user: BankUser | null;
  wallet: Wallet | null;
  transactions: Transaction[];
  cards: VirtualCard[];
  isLoading: boolean;
  isAuthChecking: boolean;
  currency: 'NGN';
  isBalanceHidden: boolean;
  toggleBalanceHidden: () => void;

  // Security PIN states
  isAppLocked: boolean;
  hasCompletedPinSetup: boolean;
  unlockApp: (pin: string) => Promise<{ success: boolean; error?: string }>;
  setupSecurityPins: (appLockPin: string, transferPin: string) => Promise<{ success: boolean; error?: string }>;
  lockApp: () => void;

  // Auth actions
  onAuthSuccess: (user: BankUser) => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Transactions (Strictly NGN)
  deposit: (amount: number, method: string, customReference?: string) => Promise<{ success: boolean; error?: string }>;
  withdraw: (amount: number, destination: string, transferPin: string) => Promise<{ success: boolean; error?: string }>;
  transfer: (amount: number, recipientTag: string, note?: string, transferPin?: string) => Promise<{ success: boolean; error?: string }>;
  transferToBank: (params: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
    amount: number;
    note?: string;
    transferPin: string;
  }) => Promise<{ success: boolean; error?: string }>;
  buyAirtimeOrData: (amount: number, phone: string, provider: string, isData: boolean, planTitle?: string, transferPin?: string) => Promise<{ success: boolean; error?: string }>;
  toggleFreezeCard: (cardId: string) => void;
  updateSpendingLimit: (cardId: string, limit: number) => void;
  refreshData: () => Promise<void>;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const INITIAL_CARDS: VirtualCard[] = [
  {
    id: 'c-01',
    card_number: '5399 •••• •••• 9012',
    card_holder: 'GPT MEMBER',
    expiry: '08/28',
    cvv: '821',
    is_frozen: false,
    spending_limit: 500000,
    spent_this_month: 0.0,
    brand: 'mastercard',
  },
];

export const BankingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<BankUser | null>(() => {
    try {
      const saved = localStorage.getItem('gpt_bank_auth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  // Smooth splash state while initial session and security status are established
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Balance starts strictly at 0.00 NGN (Zero fake money)
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<VirtualCard[]>(INITIAL_CARDS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(false);

  // Security states: check localStorage flags
  const [hasCompletedPinSetup, setHasCompletedPinSetup] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gpt_bank_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.has_security_pins) return true;
        if (u.id && localStorage.getItem(`gpt_bank_has_pins_${u.id}`) === 'true') return true;
      }
    } catch (e) {}
    return false;
  });

  // Locked on app launch if PIN setup is already complete (like OPay)
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('gpt_bank_auth_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u.has_security_pins || (u.id && localStorage.getItem(`gpt_bank_has_pins_${u.id}`) === 'true')) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  });

  const currency = 'NGN' as const;

  // Fetch real wallet and transactions from backend
  const loadBankingData = useCallback(async (currentUserId: string) => {
    if (!currentUserId) return;
    try {
      setIsLoading(true);
      const [walletRes, txsRes, secRes] = await Promise.all([
        fetch(`/api/wallet?userId=${encodeURIComponent(currentUserId)}`),
        fetch(`/api/transactions?userId=${encodeURIComponent(currentUserId)}`),
        fetch(`/api/user/security-status?userId=${encodeURIComponent(currentUserId)}`),
      ]);

      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWallet({
          id: walletData.id,
          user_id: walletData.user_id,
          balance: Number(walletData.balance) || 0.0,
          created_at: walletData.created_at,
        });
      }

      if (txsRes.ok) {
        const txsData = await txsRes.json();
        setTransactions(Array.isArray(txsData) ? txsData : []);
      }

      if (secRes.ok) {
        const secData = await secRes.json();
        if (secData.hasSecurityPins === true) {
          setHasCompletedPinSetup(true);
          localStorage.setItem(`gpt_bank_has_pins_${currentUserId}`, 'true');
          setUser((prev) => (prev ? { ...prev, has_security_pins: true } : null));
        }
      }
    } catch (err) {
      console.warn('Backend data fetch non-fatal error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for Supabase session and Google OAuth redirects
  useEffect(() => {
    let isSubscribed = true;

    initSupabaseFromBackend().then((sb) => {
      if (!isSubscribed) return;

      if (!sb) {
        setIsAuthChecking(false);
        return;
      }

      sb.auth.getSession().then(({ data: { session } }) => {
        if (!isSubscribed) return;
        if (session?.user) {
          const authUser = formatSupabaseUser(session.user);
          setUser(authUser);
          localStorage.setItem('gpt_bank_auth_user', JSON.stringify(authUser));

          const hasPins = Boolean(
            authUser.has_security_pins ||
            localStorage.getItem(`gpt_bank_has_pins_${authUser.id}`) === 'true'
          );

          if (hasPins) {
            setHasCompletedPinSetup(true);
            setIsAppLocked(true); // Locked on initial open if user already configured PINs
          } else {
            setHasCompletedPinSetup(false);
            setIsAppLocked(false);
          }
        }
        setIsAuthChecking(false);
      }).catch(() => {
        if (isSubscribed) setIsAuthChecking(false);
      });

      const { data: authListener } = sb.auth.onAuthStateChange((event, session) => {
        if (!isSubscribed) return;
        if (session?.user) {
          const authUser = formatSupabaseUser(session.user);
          setUser((prev) => {
            const hasPins = Boolean(
              prev?.has_security_pins ||
              authUser.has_security_pins ||
              localStorage.getItem(`gpt_bank_has_pins_${authUser.id}`) === 'true'
            );
            const merged = { ...authUser, has_security_pins: hasPins };
            localStorage.setItem('gpt_bank_auth_user', JSON.stringify(merged));
            return merged;
          });

          const hasPins = Boolean(
            authUser.has_security_pins ||
            localStorage.getItem(`gpt_bank_has_pins_${authUser.id}`) === 'true'
          );
          if (hasPins) {
            setHasCompletedPinSetup(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setWallet(null);
          setTransactions([]);
          setIsAppLocked(true);
          localStorage.removeItem('gpt_bank_auth_user');
        }
        setIsAuthChecking(false);
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }).catch(() => {
      if (isSubscribed) setIsAuthChecking(false);
    });

    // Safety timeout so splash never hangs
    const safetyTimer = setTimeout(() => {
      if (isSubscribed) setIsAuthChecking(false);
    }, 1200);

    return () => {
      isSubscribed = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadBankingData(user.id);
    } else {
      setWallet(null);
      setTransactions([]);
    }
  }, [user?.id, loadBankingData]);

  const onAuthSuccess = (authenticatedUser: BankUser) => {
    setUser(authenticatedUser);
    localStorage.setItem('gpt_bank_auth_user', JSON.stringify(authenticatedUser));

    // Check if pins already configured
    const pinsConfigured = Boolean(
      authenticatedUser.has_security_pins ||
      localStorage.getItem(`gpt_bank_has_pins_${authenticatedUser.id}`) === 'true'
    );

    if (pinsConfigured) {
      // User has already set up PINs before! Prompt for 6-digit PIN like OPay
      setHasCompletedPinSetup(true);
      setIsAppLocked(true);
    } else {
      // First registration: prompt for 6-pin and 4-pin setup
      setHasCompletedPinSetup(false);
      setIsAppLocked(false);
    }

    loadBankingData(authenticatedUser.id);
  };

  const signIn = async (email: string, password: string) => {
    const res = await signInWithSupabaseEmail(email, password);
    if (res.user) {
      onAuthSuccess(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign in failed' };
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const res = await signUpWithSupabaseEmail(email, password, name);
    if (res.user) {
      onAuthSuccess(res.user);
      return { success: true };
    }
    return { success: false, error: res.error || 'Sign up failed' };
  };

  const signOut = async () => {
    await signOutSupabase();
    setUser(null);
    setWallet(null);
    setTransactions([]);
    setIsAppLocked(true);
    localStorage.removeItem('gpt_bank_auth_user');
  };

  // ----------------- Security PIN Methods -----------------
  const setupSecurityPins = async (appLockPin: string, transferPin: string) => {
    const currentUserId = user?.id || 'member_user';
    try {
      // 1. Immediately cache locally so user never gets prompted again
      localStorage.setItem(`gpt_bank_has_pins_${currentUserId}`, 'true');
      localStorage.setItem(`gpt_bank_app_lock_pin_${currentUserId}`, appLockPin);
      localStorage.setItem(`gpt_bank_transfer_pin_${currentUserId}`, transferPin);

      // 2. Persist to Supabase Auth user metadata
      await updateSupabaseSecurityPins(appLockPin, transferPin);

      // 3. Persist to backend server ledger
      await fetch('/api/user/security-pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          appLockPin,
          transferPin,
        }),
      });

      // 4. Update state: user has completed pins and app directly UNLOCKS into dashboard
      setHasCompletedPinSetup(true);
      setIsAppLocked(false);

      const updated = user ? { ...user, has_security_pins: true } : null;
      setUser(updated);
      if (updated) {
        localStorage.setItem('gpt_bank_auth_user', JSON.stringify(updated));
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00B875', '#34D399', '#10B981', '#FBBF24'],
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error configuring security PINs' };
    }
  };

  const unlockApp = async (pin: string) => {
    const currentUserId = user?.id || 'member_user';

    // Instant local verification if cached
    const cachedPin = localStorage.getItem(`gpt_bank_app_lock_pin_${currentUserId}`);
    if (cachedPin && cachedPin === pin.trim()) {
      setIsAppLocked(false);
      return { success: true };
    }

    try {
      const resp = await fetch('/api/user/verify-app-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          pin,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.valid) {
        return { success: false, error: data.error || 'Incorrect 6-digit App Lock PIN' };
      }

      // Cache verified pin locally
      localStorage.setItem(`gpt_bank_app_lock_pin_${currentUserId}`, pin.trim());
      setIsAppLocked(false);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification error' };
    }
  };

  const lockApp = () => {
    if (hasCompletedPinSetup) {
      setIsAppLocked(true);
    }
  };

  // ---------------- Transactions via Backend (Strictly NGN) ----------------
  const deposit = async (amount: number, method: string, customReference?: string) => {
    const currentUserId = user?.id || 'member_user';
    if (amount <= 0) return { success: false, error: 'Enter a valid deposit amount' };

    try {
      const resp = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          amount,
          method,
          reference: customReference,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || 'Deposit failed' };
      }

      setWallet((prev) => ({
        id: prev?.id || `wlt-${Date.now()}`,
        user_id: prev?.user_id || currentUserId,
        balance: Number(data.newBalance) || 0.0,
        created_at: prev?.created_at || new Date().toISOString(),
      }));
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#00B875', '#059669', '#34D399', '#FBBF24'],
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Deposit request failed' };
    }
  };

  const withdraw = async (amount: number, destination: string, transferPin: string) => {
    const currentUserId = user?.id || 'member_user';
    const currentBal = wallet?.balance ?? 0.0;
    if (amount <= 0) return { success: false, error: 'Enter a valid withdrawal amount' };
    if (currentBal < amount) return { success: false, error: 'Insufficient wallet balance' };

    try {
      const resp = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          amount,
          destination,
          transferPin,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || 'Withdrawal failed' };
      }

      setWallet((prev) => ({
        id: prev?.id || `wlt-${Date.now()}`,
        user_id: prev?.user_id || currentUserId,
        balance: Number(data.newBalance) || 0.0,
        created_at: prev?.created_at || new Date().toISOString(),
      }));
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Withdrawal request failed' };
    }
  };

  // Transfer to GPT Bank Tag (Requires 4-digit Transfer PIN)
  const transfer = async (amount: number, recipientTag: string, note?: string, transferPin?: string) => {
    const currentUserId = user?.id || 'member_user';
    const currentBal = wallet?.balance ?? 0.0;
    if (amount <= 0) return { success: false, error: 'Enter a valid transfer amount' };
    if (currentBal < amount) return { success: false, error: 'Insufficient balance for transfer' };

    try {
      const resp = await fetch('/api/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          recipientTag,
          amount,
          note,
          transferPin,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || 'Transfer failed' };
      }

      setWallet((prev) => ({
        id: prev?.id || `wlt-${Date.now()}`,
        user_id: prev?.user_id || currentUserId,
        balance: Number(data.newBalance) || 0.0,
        created_at: prev?.created_at || new Date().toISOString(),
      }));
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00B875', '#10B981', '#6EE7B7'],
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Transfer request failed' };
    }
  };

  // Real Paystack Nigerian Bank Transfer (Requires 4-digit Transfer PIN)
  const transferToBank = async (params: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountName: string;
    amount: number;
    note?: string;
    transferPin: string;
  }) => {
    const currentUserId = user?.id || 'member_user';
    const currentBal = wallet?.balance ?? 0.0;
    if (params.amount <= 0) return { success: false, error: 'Enter a valid transfer amount' };
    if (currentBal < params.amount) return { success: false, error: 'Insufficient balance for transfer' };

    try {
      const resp = await fetch('/api/wallet/transfer-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          accountNumber: params.accountNumber,
          bankCode: params.bankCode,
          bankName: params.bankName,
          accountName: params.accountName,
          amount: params.amount,
          note: params.note,
          transferPin: params.transferPin,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || 'Bank transfer failed' };
      }

      setWallet((prev) => ({
        id: prev?.id || `wlt-${Date.now()}`,
        user_id: prev?.user_id || currentUserId,
        balance: Number(data.newBalance) || 0.0,
        created_at: prev?.created_at || new Date().toISOString(),
      }));
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00B875', '#10B981', '#34D399', '#FBBF24'],
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Bank transfer request failed' };
    }
  };

  const buyAirtimeOrData = async (
    amount: number,
    phone: string,
    provider: string,
    isData: boolean,
    planTitle?: string,
    transferPin?: string
  ) => {
    const currentUserId = user?.id || 'member_user';
    const currentBal = wallet?.balance ?? 0.0;
    if (currentBal < amount) return { success: false, error: 'Insufficient balance' };

    try {
      const resp = await fetch('/api/wallet/airtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          amount,
          phone,
          provider,
          isData,
          planTitle,
          transferPin,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        return { success: false, error: data.error || 'Recharge failed' };
      }

      setWallet((prev) => (prev ? { ...prev, balance: Number(data.newBalance) || 0.0 } : null));
      if (data.transaction) {
        setTransactions((prev) => [data.transaction, ...prev]);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Recharge request failed' };
    }
  };



  const toggleFreezeCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, is_frozen: !c.is_frozen } : c))
    );
  };

  const updateSpendingLimit = (cardId: string, limit: number) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, spending_limit: limit } : c))
    );
  };

  const refreshData = async () => {
    if (user?.id) {
      await loadBankingData(user.id);
    }
  };

  const toggleBalanceHidden = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  return (
    <BankingContext.Provider
      value={{
        user,
        wallet,
        transactions,
        cards,
        isLoading,
        isAuthChecking,
        currency,
        isBalanceHidden,
        toggleBalanceHidden,
        isAppLocked,
        hasCompletedPinSetup,
        unlockApp,
        setupSecurityPins,
        lockApp,
        onAuthSuccess,
        signIn,
        signUp,
        signOut,
        deposit,
        withdraw,
        transfer,
        transferToBank,
        buyAirtimeOrData,
        toggleFreezeCard,
        updateSpendingLimit,
        refreshData,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const context = useContext(BankingContext);
  if (!context) {
    throw new Error('useBanking must be used within a BankingProvider');
  }
  return context;
};
