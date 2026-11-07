export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'airtime' | 'reward';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id?: string;
  type: TransactionType;
  amount: number;
  currency: string;
  title: string;
  description?: string;
  recipient?: string;
  reference: string;
  status: TransactionStatus;
  created_at: string;
}

export interface BankUser {
  id: string;
  email: string;
  name: string;
  tag: string;
  account_number: string;
  phone: string;
  avatar_url?: string;
  tier: string;
  is_demo?: boolean;
  has_security_pins?: boolean;
}

export interface VirtualCard {
  id: string;
  card_number: string;
  card_holder: string;
  expiry: string;
  cvv: string;
  is_frozen: boolean;
  spending_limit: number;
  spent_this_month: number;
  brand: 'visa' | 'mastercard';
}

export interface AirtimeDataPlan {
  id: string;
  name: string;
  data: string;
  validity: string;
  price: number;
  cashback: number;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  isLiveConnected: boolean;
}

export interface PaystackBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode?: string;
  gateway?: string | null;
  active?: boolean;
  is_deleted?: boolean;
}

export interface ResolvedAccount {
  account_number: string;
  account_name: string;
  bank_code: string;
  bank_name?: string;
}
