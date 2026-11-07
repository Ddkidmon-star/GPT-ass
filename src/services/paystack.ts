import PaystackPop from '@paystack/inline-js';

export interface PaystackCheckoutParams {
  email: string;
  amount: number; // in NGN
  currency?: 'NGN' | 'USD';
  onSuccess: (reference: string) => void | Promise<void>;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

export async function openPaystackCheckout({
  email,
  amount,
  currency = 'NGN',
  onSuccess,
  onCancel,
  onError,
}: PaystackCheckoutParams) {
  // Fetch Paystack configuration securely from the backend
  let publicKey = '';
  try {
    const configRes = await fetch('/api/config');
    if (configRes.ok) {
      const config = await configRes.json();
      publicKey = config.paystackPublicKey || '';
    }
  } catch (e) {
    console.warn('Could not fetch paystack config from backend:', e);
  }

  // Fallback public key
  if (!publicKey || publicKey === 'pk_test_sample_or_custom_key') {
    publicKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '').trim();
  }

  // Paystack expects amount in lowest currency subunit (kobo or cents)
  const amountInSubunit = Math.round(amount * 100);
  const reference = `GPT_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  // If window.PaystackPop from inline.js script is loaded
  if (typeof window !== 'undefined' && (window as any).PaystackPop) {
    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey || 'pk_test_sample_or_custom_key',
        email: email || 'customer@gptbank.com',
        amount: amountInSubunit,
        currency,
        ref: reference,
        callback: function (response: any) {
          const ref = response.reference || response.trxref || reference;
          onSuccess(ref);
        },
        onClose: function () {
          if (onCancel) onCancel();
        },
      });
      handler.openIframe();
      return;
    } catch (e) {
      console.warn('window.PaystackPop setup failed, using module instance:', e);
    }
  }

  try {
    const paystack = new PaystackPop();
    paystack.newTransaction({
      key: publicKey || 'pk_test_sample_or_custom_key',
      email: email || 'customer@gptbank.com',
      amount: amountInSubunit,
      currency,
      reference,
      onSuccess: (transaction: any) => {
        const ref = transaction.reference || transaction.trxref || reference;
        onSuccess(ref);
      },
      onCancel: () => {
        if (onCancel) onCancel();
      },
    });
  } catch (err: any) {
    console.error('Paystack popup error:', err);
    if (onError) onError(err);
    else throw err;
  }
}
