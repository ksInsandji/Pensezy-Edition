/**
 * CinetPay Payment Integration
 * Documentation: https://docs.cinetpay.com/
 */

import crypto from 'crypto';
import {
  CinetPayConfig,
  CinetPayInitResponse,
  CinetPayVerifyResponse,
  CinetPayWebhookPayload,
  PaymentInitData,
  PaymentInitResult,
  PaymentVerifyResult,
  PaymentStatus,
} from './types';

// CinetPay API endpoints
const CINETPAY_BASE_URL = 'https://api-checkout.cinetpay.com/v2';

/**
 * Get CinetPay configuration from environment variables
 */
export function getCinetPayConfig(): CinetPayConfig {
  const apiKey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  const secretKey = process.env.CINETPAY_SECRET_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!apiKey || !siteId || !secretKey) {
    throw new Error('CinetPay configuration missing. Check environment variables.');
  }

  return {
    apiKey,
    siteId,
    secretKey,
    baseUrl: CINETPAY_BASE_URL,
    notifyUrl: `${baseUrl}/api/payment/webhook`,
    returnUrl: `${baseUrl}/payment/success`,
    cancelUrl: `${baseUrl}/payment/failure`,
  };
}

/**
 * Initialize a payment with CinetPay
 */
export async function initializePayment(data: PaymentInitData): Promise<PaymentInitResult> {
  try {
    const config = getCinetPayConfig();

    // Prepare request body according to CinetPay API
    const body = {
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: data.orderId, // Use order ID as transaction ID
      amount: Math.round(data.amount), // CinetPay expects integer
      currency: data.currency || 'XAF',
      description: data.description,
      customer_id: data.orderId, // Can use order ID or user ID
      customer_name: data.customerName,
      customer_surname: '', // Optional
      customer_email: data.customerEmail,
      customer_phone_number: data.customerPhone || '',
      customer_address: '',
      customer_city: '',
      customer_country: 'CM', // Cameroon by default
      customer_state: '',
      customer_zip_code: '',
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      channels: getChannelsForMethod(data.paymentMethod),
      metadata: JSON.stringify(data.metadata || {}),
      // Language and other options
      lang: 'fr',
      invoice_data: {
        // Additional invoice data if needed
      },
    };

    const response = await fetch(`${CINETPAY_BASE_URL}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CinetPay API error:', errorText);
      return {
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const result: CinetPayInitResponse = await response.json();

    // Check CinetPay response code
    if (result.code !== '201') {
      console.error('CinetPay init failed:', result);
      return {
        success: false,
        error: result.message || result.description || 'Payment initialization failed',
      };
    }

    return {
      success: true,
      paymentId: data.orderId,
      paymentUrl: result.data.payment_url,
      paymentToken: result.data.payment_token,
    };
  } catch (error) {
    console.error('CinetPay initialization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify a payment status with CinetPay
 */
export async function verifyPayment(transactionId: string): Promise<PaymentVerifyResult> {
  try {
    const config = getCinetPayConfig();

    const body = {
      apikey: config.apiKey,
      site_id: config.siteId,
      transaction_id: transactionId,
    };

    const response = await fetch(`${CINETPAY_BASE_URL}/payment/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        success: false,
        status: 'failed',
        error: `API error: ${response.status}`,
      };
    }

    const result: CinetPayVerifyResponse = await response.json();

    // Map CinetPay status to our status
    const status = mapCinetPayStatus(result.data?.status);

    return {
      success: status === 'completed',
      status,
      transactionId: transactionId,
      paidAt: result.data?.payment_date,
    };
  } catch (error) {
    console.error('CinetPay verification error:', error);
    return {
      success: false,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify webhook signature from CinetPay
 */
export function verifyWebhookSignature(
  payload: CinetPayWebhookPayload,
  receivedSignature: string
): boolean {
  try {
    const config = getCinetPayConfig();

    // CinetPay signature format: cpm_site_id + cpm_trans_id + cpm_trans_date + cpm_amount + cpm_currency + secret_key
    const signatureData = `${payload.cpm_site_id}${payload.cpm_trans_id}${payload.cpm_trans_date}${payload.cpm_amount}${payload.cpm_currency}${config.secretKey}`;

    const computedSignature = crypto
      .createHash('md5')
      .update(signatureData)
      .digest('hex');

    return computedSignature === receivedSignature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Parse webhook payload from form data
 */
export function parseWebhookPayload(formData: FormData): CinetPayWebhookPayload {
  return {
    cpm_site_id: formData.get('cpm_site_id') as string || '',
    cpm_trans_id: formData.get('cpm_trans_id') as string || '',
    cpm_trans_date: formData.get('cpm_trans_date') as string || '',
    cpm_amount: formData.get('cpm_amount') as string || '',
    cpm_currency: formData.get('cpm_currency') as string || '',
    signature: formData.get('signature') as string || '',
    payment_method: formData.get('payment_method') as string || '',
    cel_phone_num: formData.get('cel_phone_num') as string || '',
    cpm_phone_prefixe: formData.get('cpm_phone_prefixe') as string || '',
    cpm_language: formData.get('cpm_language') as string || '',
    cpm_version: formData.get('cpm_version') as string || '',
    cpm_payment_config: formData.get('cpm_payment_config') as string || '',
    cpm_page_action: formData.get('cpm_page_action') as string || '',
    cpm_custom: formData.get('cpm_custom') as string || '',
    cpm_designation: formData.get('cpm_designation') as string || '',
    cpm_error_message: formData.get('cpm_error_message') as string || '',
  };
}

/**
 * Get payment channels based on method
 */
function getChannelsForMethod(method: PaymentInitData['paymentMethod']): string {
  switch (method) {
    case 'mobile_money_mtn':
      return 'MOBILE_MONEY';
    case 'mobile_money_orange':
      return 'MOBILE_MONEY';
    case 'card':
      return 'CREDIT_CARD';
    default:
      return 'ALL'; // Let user choose
  }
}

/**
 * Map CinetPay status to our internal status
 */
function mapCinetPayStatus(cinetPayStatus: string | undefined): PaymentStatus {
  switch (cinetPayStatus?.toUpperCase()) {
    case 'ACCEPTED':
      return 'completed';
    case 'REFUSED':
      return 'failed';
    case 'CANCELLED':
      return 'cancelled';
    case 'PENDING':
      return 'pending';
    default:
      return 'pending';
  }
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'XAF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Validate phone number format for Mobile Money
 */
export function validateMobileMoneyPhone(phone: string, country: string = 'CM'): boolean {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');

  // Cameroon phone number patterns
  if (country === 'CM') {
    // MTN: 67, 650-654, 680-689
    // Orange: 69, 655-659
    const cameroonPattern = /^(\+237)?6[5-9][0-9]{7}$/;
    return cameroonPattern.test(cleaned);
  }

  // Generic validation for other countries
  return /^\+?[0-9]{9,15}$/.test(cleaned);
}

/**
 * Detect operator from phone number (Cameroon)
 */
export function detectOperator(phone: string): 'mtn' | 'orange' | 'unknown' {
  const cleaned = phone.replace(/[\s-+237]/g, '');

  if (/^6(7|5[0-4]|8)/.test(cleaned)) {
    return 'mtn';
  }
  if (/^6(9|5[5-9])/.test(cleaned)) {
    return 'orange';
  }
  return 'unknown';
}
