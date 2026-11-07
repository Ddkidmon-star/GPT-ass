import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Wallet, Transaction, BankUser } from '../types/banking';

const STORAGE_KEYS = {
  URL: 'gpt_bank_supabase_url',
  ANON_KEY: 'gpt_bank_supabase_anon_key',
  LOCAL_WALLET: 'gpt_bank_local_wallet',
  LOCAL_TXS: 'gpt_bank_local_transactions',
  LOCAL_USER: 'gpt_bank_local_user',
};

// Stable valid UUID for default session user
export const DEFAULT_USER_ID = 'd3b07384-d113-4660-8452-32a8be985e8a';

export function toValidUUID(id?: string): string {
  if (!id) return DEFAULT_USER_ID;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{3}-[89ab0-9a-f][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  return DEFAULT_USER_ID;
}

// Default initial user profile (empty/clean state)
const INITIAL_USER: BankUser = {
  id: DEFAULT_USER_ID,
  email: 'user@gptbank.com',
  name: 'Alex Morgan',
  tag: '@alexmorgan',
  account_number: '8092837411',
  phone: '+1 (555) 234-8901',
  tier: 'Tier 3 (Verified)',
  is_demo: false,
};

// Default clean wallet with 0.00 balance
const CLEAN_ZERO_WALLET: Wallet = {
  id: 'wlt-initial',
  user_id: DEFAULT_USER_ID,
  balance: 0.0,
  created_at: new Date().toISOString(),
};

let supabaseInstance: SupabaseClient | null = null;
let cachedUrl = '';
let cachedKey = '';
let isFetchingConfig = false;
let configPromise: Promise<boolean> | null = null;

export async function initSupabaseFromBackend(): Promise<SupabaseClient | null> {
  if (supabaseInstance) return supabaseInstance;

  if (configPromise) {
    await configPromise;
    return getSupabase();
  }

  configPromise = (async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        if (data.supabaseUrl && data.supabaseAnonKey) {
          saveSupabaseCredentials(data.supabaseUrl, data.supabaseAnonKey);
          return true;
        }
      }
    } catch (e) {
      console.warn('Could not auto-fetch config from backend:', e);
    }
    return false;
  })();

  await configPromise;
  return getSupabase();
}

function cleanSupabaseUrl(raw: string): string {
  if (!raw) return '';
  return raw.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
}

export function getStoredSupabaseCredentials(): { url: string; anonKey: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const localUrl = (localStorage.getItem(STORAGE_KEYS.URL) || '').trim();
  const localKey = (localStorage.getItem(STORAGE_KEYS.ANON_KEY) || '').trim();

  const url = cleanSupabaseUrl(localUrl || envUrl);
  const anonKey = localKey || envKey;

  return { url, anonKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEYS.URL, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEYS.URL);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_KEYS.ANON_KEY, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  }

  supabaseInstance = null;
  cachedUrl = '';
  cachedKey = '';
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getStoredSupabaseCredentials();
  const isDefaultPlaceholder =
    url.includes('your-project.supabase.co') ||
    anonKey.includes('your-anon-public-key') ||
    !url.startsWith('https://');

  return Boolean(url && anonKey && !isDefaultPlaceholder);
}

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getStoredSupabaseCredentials();

  if (!isSupabaseConfigured()) {
    return null;
  }

  if (supabaseInstance && cachedUrl === url && cachedKey === anonKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    cachedUrl = url;
    cachedKey = anonKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function formatSupabaseUser(sbUser: any, nameOverride?: string): BankUser {
  const email = sbUser.email || 'user@gptbank.com';
  const name =
    nameOverride ||
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    email.split('@')[0] ||
    'GPT Member';

  const cleanTag = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const digits = sbUser.id ? sbUser.id.replace(/[^0-9]/g, '') : '';
  const accountNumber = digits.slice(0, 10).padEnd(10, '0') || '8092837411';

  // Check if user has already set up security PINs in Supabase metadata or local backup
  let hasPins = Boolean(sbUser.user_metadata?.has_security_pins);
  if (!hasPins && sbUser.id) {
    try {
      if (localStorage.getItem(`gpt_bank_has_pins_${sbUser.id}`) === 'true') {
        hasPins = true;
      }
    } catch (e) {}
  }

  return {
    id: sbUser.id,
    email,
    name,
    tag: `@${cleanTag || 'member'}`,
    account_number: accountNumber,
    phone: sbUser.phone || '+1 (555) 019-2831',
    tier: 'Tier 3 (Verified)',
    is_demo: false,
    has_security_pins: hasPins,
  };
}

// Update security PINs directly on Supabase user metadata
export async function updateSupabaseSecurityPins(
  appLockPin: string,
  transferPin: string
): Promise<{ success: boolean; error?: string }> {
  let sb = getSupabase();
  if (!sb) {
    sb = await initSupabaseFromBackend();
  }

  if (sb) {
    try {
      const { data, error } = await sb.auth.updateUser({
        data: {
          has_security_pins: true,
          app_lock_pin: String(appLockPin),
          transfer_pin: String(transferPin),
          security_pins_updated_at: new Date().toISOString(),
        },
      });

      if (!error && data?.user) {
        return { success: true };
      }
      if (error) {
        console.warn('Supabase updateUser error:', error.message);
      }
    } catch (err: any) {
      console.warn('Supabase updateUser exception:', err);
    }
  }

  return { success: true };
}

// Real Supabase Google OAuth sign in
export async function signInWithGoogleOAuth(): Promise<{ url?: string; error?: string }> {
  let sb = getSupabase();
  if (!sb) {
    sb = await initSupabaseFromBackend();
  }

  if (!sb) {
    return { error: 'Supabase credentials not available' };
  }

  try {
    const { data, error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.url) {
      window.location.assign(data.url);
      return { url: data.url };
    }
    return {};
  } catch (e: any) {
    return { error: e.message || 'OAuth initialization failed' };
  }
}

// Real Supabase Email Sign In
export async function signInWithSupabaseEmail(email: string, password: string): Promise<{ user?: BankUser; error?: string }> {
  let sb = getSupabase();
  if (!sb) {
    sb = await initSupabaseFromBackend();
  }

  // 1. Direct Supabase Client Auth
  if (sb) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (!error && data?.user) {
        const formatted = formatSupabaseUser(data.user);
        return { user: formatted };
      }
      if (error) {
        return { error: error.message };
      }
    } catch (err: any) {
      console.warn('Client-side sign in error, trying backend route:', err);
    }
  }

  // 2. Fallback to backend route /api/auth/signin
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Authentication failed' };
    }
    return { user: data.user };
  } catch (err: any) {
    return { error: err.message || 'Unable to connect to authentication server' };
  }
}

// Real Supabase Email Sign Up
export async function signUpWithSupabaseEmail(
  email: string,
  password: string,
  name?: string
): Promise<{ user?: BankUser; message?: string; error?: string }> {
  let sb = getSupabase();
  if (!sb) {
    sb = await initSupabaseFromBackend();
  }

  // 1. Direct Supabase Client Auth
  if (sb) {
    try {
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        const formatted = formatSupabaseUser(data.user, name);
        // Also ensure wallet row is initialized in Supabase
        fetch('/api/wallet?userId=' + encodeURIComponent(data.user.id)).catch(() => {});
        return {
          user: formatted,
          message: data.session
            ? 'Account created and signed in successfully'
            : 'Sign up successful! Please check your email to confirm or sign in.',
        };
      }
    } catch (err: any) {
      console.warn('Client-side signup error, trying backend route:', err);
    }
  }

  // 2. Fallback to backend route /api/auth/signup
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password, name }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Sign up failed' };
    }
    return { user: data.user, message: data.message };
  } catch (err: any) {
    return { error: err.message || 'Unable to connect to authentication server' };
  }
}

// Real Supabase Password Reset
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  let sb = getSupabase();
  if (!sb) {
    sb = await initSupabaseFromBackend();
  }

  if (sb) {
    try {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, message: 'Password reset link sent to ' + email };
    } catch (e: any) {}
  }

  try {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Failed to send reset link' };
    return { success: true, message: data.message || 'Password reset link sent' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

// Sign Out from Supabase
export async function signOutSupabase(): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.auth.signOut();
    } catch (e) {}
  }
  localStorage.removeItem('gpt_bank_auth_user');
  localStorage.removeItem(STORAGE_KEYS.LOCAL_USER);
}

// ----------------- LOCAL PERSISTENCE -----------------
export function getLocalUser(): BankUser {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading local user:', e);
  }
  return INITIAL_USER;
}

export function setLocalUser(user: BankUser) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(user));
}

export function getLocalWallet(userId?: string): Wallet {
  const targetId = toValidUUID(userId);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_WALLET);
    if (raw) {
      const parsed = JSON.parse(raw) as Wallet;
      if (parsed.user_id === targetId || !userId) {
        return { ...parsed, balance: Number(parsed.balance) || 0.0 };
      }
    }
  } catch (e) {
    console.warn('Error reading local wallet:', e);
  }
  return { ...CLEAN_ZERO_WALLET, user_id: targetId };
}

export function saveLocalWallet(wallet: Wallet) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_WALLET, JSON.stringify(wallet));
}

export function getLocalTransactions(userId?: string): Transaction[] {
  const targetId = toValidUUID(userId);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_TXS);
    if (raw) {
      const list = JSON.parse(raw) as Transaction[];
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn('Error reading local transactions:', e);
  }
  return [];
}

export function saveLocalTransactions(txs: Transaction[]) {
  localStorage.setItem(STORAGE_KEYS.LOCAL_TXS, JSON.stringify(txs));
}

// ----------------- REPOSITORY API (Real Supabase Queries) -----------------

export async function fetchWallet(userId: string): Promise<{ wallet: Wallet; isLive: boolean }> {
  const validUUID = toValidUUID(userId);
  const sb = getSupabase();

  if (sb) {
    try {
      // 1. Query Supabase wallets table for the user
      const { data, error } = await sb
        .from('wallets')
        .select('*')
        .eq('user_id', validUUID)
        .maybeSingle();

      if (!error && data) {
        const liveWallet: Wallet = {
          id: data.id,
          user_id: data.user_id,
          balance: Number(data.balance) || 0.0,
          created_at: data.created_at || new Date().toISOString(),
        };
        saveLocalWallet(liveWallet);
        return { wallet: liveWallet, isLive: true };
      }

      // 2. If table exists but user row does not, insert a new wallet initialized with 0.00
      if (!data && (!error || error.code === 'PGRST116')) {
        const newWallet: Wallet = {
          id: crypto.randomUUID(),
          user_id: validUUID,
          balance: 0.0,
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await sb
          .from('wallets')
          .insert([newWallet])
          .select()
          .single();

        if (!insertErr && inserted) {
          const createdWallet: Wallet = {
            id: inserted.id,
            user_id: inserted.user_id,
            balance: Number(inserted.balance) || 0.0,
            created_at: inserted.created_at,
          };
          saveLocalWallet(createdWallet);
          return { wallet: createdWallet, isLive: true };
        }
      }
    } catch (err) {
      console.warn('Supabase wallet fetch error:', err);
    }
  }

  return { wallet: getLocalWallet(validUUID), isLive: false };
}

export async function updateWalletBalance(
  userId: string,
  newBalance: number
): Promise<{ success: boolean; newBalance: number; isLive: boolean }> {
  const validUUID = toValidUUID(userId);
  const rounded = Math.round(newBalance * 100) / 100;
  const sb = getSupabase();

  // Update local store
  const local = getLocalWallet(validUUID);
  local.balance = rounded;
  saveLocalWallet(local);

  if (sb) {
    try {
      // Try updating existing row
      const { data, error } = await sb
        .from('wallets')
        .update({ balance: rounded })
        .eq('user_id', validUUID)
        .select()
        .maybeSingle();

      if (!error && data) {
        return { success: true, newBalance: rounded, isLive: true };
      }

      // If record wasn't present, upsert
      if (!data) {
        const { error: upsertErr } = await sb
          .from('wallets')
          .upsert({
            user_id: validUUID,
            balance: rounded,
            created_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (!upsertErr) {
          return { success: true, newBalance: rounded, isLive: true };
        }
      }
    } catch (err) {
      console.warn('Supabase wallet update error:', err);
    }
  }

  return { success: true, newBalance: rounded, isLive: false };
}

export async function fetchTransactions(userId: string): Promise<{ transactions: Transaction[]; isLive: boolean }> {
  const validUUID = toValidUUID(userId);
  const sb = getSupabase();

  if (sb) {
    try {
      const { data, error } = await sb
        .from('transactions')
        .select('*')
        .eq('user_id', validUUID)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped: Transaction[] = data.map((item) => ({
          id: item.id,
          user_id: item.user_id,
          wallet_id: item.wallet_id,
          type: item.type,
          amount: Number(item.amount) || 0,
          currency: item.currency || 'USD',
          title: item.title,
          description: item.description,
          recipient: item.recipient,
          reference: item.reference,
          status: item.status || 'completed',
          created_at: item.created_at,
        }));
        saveLocalTransactions(mapped);
        return { transactions: mapped, isLive: true };
      }
    } catch (err) {
      console.warn('Supabase transactions fetch error:', err);
    }
  }

  return { transactions: getLocalTransactions(validUUID), isLive: false };
}

export async function recordTransaction(
  tx: Omit<Transaction, 'id' | 'created_at'>
): Promise<{ transaction: Transaction; isLive: boolean }> {
  const validUUID = toValidUUID(tx.user_id);
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    user_id: validUUID,
    created_at: new Date().toISOString(),
  };

  const existing = getLocalTransactions(validUUID);
  saveLocalTransactions([newTx, ...existing]);

  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('transactions')
        .insert([
          {
            id: newTx.id,
            user_id: validUUID,
            wallet_id: newTx.wallet_id,
            type: newTx.type,
            amount: newTx.amount,
            currency: newTx.currency,
            title: newTx.title,
            description: newTx.description,
            recipient: newTx.recipient,
            reference: newTx.reference,
            status: newTx.status,
            created_at: newTx.created_at,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        return { transaction: newTx, isLive: true };
      }
    } catch (err) {
      console.warn('Supabase record transaction error:', err);
    }
  }

  return { transaction: newTx, isLive: false };
}

export const SUPABASE_SQL_SETUP = `-- GPT BANK: Supabase SQL Setup Script
-- Run this in your Supabase Project SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Create 'wallets' table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_wallet UNIQUE (user_id)
);

-- 2. Enable Row Level Security (RLS) on wallets
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select on wallets" 
  ON public.wallets FOR SELECT 
  USING (true);

CREATE POLICY "Allow update on wallets" 
  ON public.wallets FOR UPDATE 
  USING (true);

CREATE POLICY "Allow insert on wallets" 
  ON public.wallets FOR INSERT 
  WITH CHECK (true);

-- 3. Create 'transactions' table (for ledger records)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_id UUID,
  type VARCHAR(32) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'USD',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  recipient VARCHAR(255),
  reference VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on transactions" 
  ON public.transactions FOR ALL 
  USING (true);
`;
