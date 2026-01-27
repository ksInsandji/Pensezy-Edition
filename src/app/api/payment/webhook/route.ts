import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment, parseWebhookPayload } from '@/lib/payment';

export const dynamic = 'force-dynamic';

// Use service role client for webhook (bypasses RLS)
function getServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase service configuration missing');
  }

  return createClient(supabaseUrl, serviceKey);
}

export async function POST(request: NextRequest) {
  console.log('=== CinetPay Webhook Received ===');

  try {
    // Parse form data (CinetPay sends as form-urlencoded)
    const contentType = request.headers.get('content-type') || '';

    let transactionId: string;
    let transactionStatus: string;

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const payload = parseWebhookPayload(formData);

      console.log('Webhook payload:', {
        trans_id: payload.cpm_trans_id,
        amount: payload.cpm_amount,
        status: payload.cpm_payment_config,
      });

      transactionId = payload.cpm_trans_id;

      // Verify payment status with CinetPay API (more reliable than webhook data)
      const verification = await verifyPayment(transactionId);
      transactionStatus = verification.status === 'completed' ? 'ACCEPTED' : 'REFUSED';

    } else if (contentType.includes('application/json')) {
      // Some providers send JSON
      const body = await request.json();
      console.log('Webhook JSON body:', body);

      transactionId = body.cpm_trans_id || body.transaction_id;

      // Verify with CinetPay
      const verification = await verifyPayment(transactionId);
      transactionStatus = verification.status === 'completed' ? 'ACCEPTED' : 'REFUSED';

    } else {
      console.error('Unsupported content type:', contentType);
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 });
    }

    if (!transactionId) {
      console.error('No transaction ID in webhook');
      return NextResponse.json({ error: 'Missing transaction ID' }, { status: 400 });
    }

    // Get service client (bypasses RLS)
    const supabase = getServiceClient();

    // Find order by transaction ID (order ID = transaction ID in our case)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, status, total_amount')
      .eq('id', transactionId)
      .single();

    if (orderError || !order) {
      console.error('Order not found:', transactionId);
      // Return 200 to prevent CinetPay retries for unknown orders
      return NextResponse.json({ success: false, error: 'Order not found' });
    }

    // Check if already processed (idempotency)
    if (order.status === 'paid') {
      console.log('Order already paid, skipping:', transactionId);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    // Process based on payment status
    if (transactionStatus === 'ACCEPTED') {
      console.log('Payment ACCEPTED for order:', transactionId);

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .eq('order_id', order.id);

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

      // Process order items (grant access, update stock, credit sellers)
      await processOrderItems(supabase, order.id, order.buyer_id);

      console.log('Order processed successfully:', transactionId);
      return NextResponse.json({ success: true, message: 'Payment processed' });

    } else {
      console.log('Payment REFUSED/CANCELLED for order:', transactionId);

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: `Payment ${transactionStatus}`,
        })
        .eq('order_id', order.id);

      // Keep order as pending (user can retry)
      return NextResponse.json({ success: true, message: 'Payment failed recorded' });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent endless retries
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Process order items after successful payment
 */
async function processOrderItems(supabase: ReturnType<typeof getServiceClient>, orderId: string, buyerId: string) {
  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('id, listing_id, quantity, price_at_purchase')
    .eq('order_id', orderId);

  if (itemsError || !items?.length) {
    console.error('No items found for order:', orderId);
    return;
  }

  for (const item of items) {
    // Get listing details
    const { data: listing } = await supabase
      .from('listings')
      .select('type, stock, seller_id')
      .eq('id', item.listing_id)
      .single();

    if (!listing) continue;

    // 1. Credit seller via RPC
    const totalPrice = item.price_at_purchase * item.quantity;
    const { error: rpcError } = await supabase.rpc('process_sale', {
      p_listing_id: item.listing_id,
      p_seller_id: listing.seller_id,
      p_quantity: item.quantity,
      p_total_price: totalPrice,
      p_order_id: orderId,
    });

    if (rpcError) {
      console.error('Wallet credit failed:', rpcError);
    }

    // 2. Grant library access (digital) or update stock (physical)
    if (listing.type === 'digital') {
      const { error: libError } = await supabase
        .from('library_access')
        .upsert({
          user_id: buyerId,
          listing_id: item.listing_id,
          can_download_snapshot: false,
          purchased_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,listing_id',
          ignoreDuplicates: true,
        });

      if (libError) {
        console.error('Library access grant failed:', libError);
      }
    } else {
      // Physical: decrement stock
      const newStock = Math.max(0, (listing.stock || 0) - item.quantity);
      await supabase
        .from('listings')
        .update({ stock: newStock })
        .eq('id', item.listing_id);
    }
  }

  console.log(`Processed ${items.length} items for order ${orderId}`);
}

// Also handle GET for CinetPay verification pings
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Webhook endpoint active',
    timestamp: new Date().toISOString(),
  });
}
