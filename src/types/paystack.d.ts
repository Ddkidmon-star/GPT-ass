declare module '@paystack/inline-js' {
  export default class PaystackPop {
    newTransaction(options: {
      key: string;
      email: string;
      amount: number;
      currency?: string;
      reference?: string;
      onSuccess?: (transaction: any) => void;
      onCancel?: () => void;
      metadata?: any;
    }): void;
  }
}
