/**
 * Types for CinetPay payment integration
 */

// Payment methods supported
export type PaymentMethod = 'mobile_money_mtn' | 'mobile_money_orange' | 'card';

// Payment status tracking
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

// CinetPay transaction status codes
export type CinetPayStatus = 'ACCEPTED' | 'REFUSED' | 'CANCELLED' | 'PENDING';

/**
 * Data required to initiate a payment
 */
export interface PaymentInitData {
  orderId: string;
  amount: number;
  currency?: string; // Default: XAF
  description: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string; // Required for Mobile Money
  paymentMethod: PaymentMethod;
  metadata?: Record<string, unknown>;
}

/**
 * Response from CinetPay payment initialization
 */
export interface CinetPayInitResponse {
  code: string;
  message: string;
  description: string;
  data: {
    payment_token: string;
    payment_url: string;
  };
  api_response_id: string;
}

/**
 * CinetPay webhook/notification payload
 * Sent via POST to your notify_url
 */
export interface CinetPayWebhookPayload {
  cpm_site_id: string;
  cpm_trans_id: string;        // Your transaction ID (orderId)
  cpm_trans_date: string;      // Transaction date
  cpm_amount: string;          // Amount paid
  cpm_currency: string;        // Currency (XAF, XOF, etc.)
  signature: string;           // HMAC signature for verification
  payment_method: string;      // Payment method used
  cel_phone_num: string;       // Customer phone
  cpm_phone_prefixe: string;   // Phone prefix
  cpm_language: string;        // Language
  cpm_version: string;         // API version
  cpm_payment_config: string;  // Payment config
  cpm_page_action: string;     // Action
  cpm_custom: string;          // Custom data (JSON string)
  cpm_designation: string;     // Product description
  cpm_error_message: string;   // Error message if any
}

/**
 * CinetPay payment verification response
 */
export interface CinetPayVerifyResponse {
  code: string;
  message: string;
  api_response_id: string;
  data: {
    amount: string;
    currency: string;
    status: CinetPayStatus;
    payment_method: string;
    description: string;
    metadata: string;
    operator_id: string;
    payment_date: string;
  };
}

/**
 * Internal payment record (matches DB schema)
 */
export interface Payment {
  id: string;
  order_id: string;
  provider: string;
  provider_transaction_id: string | null;
  provider_payment_token: string | null;
  amount: number;
  currency: string;
  method: PaymentMethod | null;
  phone_number: string | null;
  phone_prefix: string | null;
  status: PaymentStatus;
  payment_url: string | null;
  metadata: Record<string, unknown>;
  error_message: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Result of payment initialization
 */
export interface PaymentInitResult {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  paymentToken?: string;
  error?: string;
}

/**
 * Result of payment verification
 */
export interface PaymentVerifyResult {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  error?: string;
}

/**
 * Result of webhook processing
 */
export interface WebhookProcessResult {
  success: boolean;
  orderId?: string;
  buyerId?: string;
  message?: string;
  error?: string;
}

/**
 * CinetPay API configuration
 */
export interface CinetPayConfig {
  apiKey: string;
  siteId: string;
  secretKey: string;
  baseUrl: string;
  notifyUrl: string;
  returnUrl: string;
  cancelUrl: string;
}

/**
 * Supported currencies by CinetPay
 */
export const SUPPORTED_CURRENCIES = ['XAF', 'XOF', 'CDF', 'GNF', 'USD'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

/**
 * Payment method labels for UI
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money_mtn: 'MTN Mobile Money',
  mobile_money_orange: 'Orange Money',
  card: 'Carte Bancaire (Visa/Mastercard)',
};

/**
 * Phone prefixes by country
 */
export const PHONE_PREFIXES = {
  CM: '+237', // Cameroon
  SN: '+221', // Senegal
  CI: '+225', // Ivory Coast
  BF: '+226', // Burkina Faso
  ML: '+223', // Mali
  TG: '+228', // Togo
  BJ: '+229', // Benin
} as const;
