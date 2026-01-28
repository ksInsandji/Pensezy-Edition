import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { initializePayment, PaymentInitData, PaymentMethod } from '@/lib/payment';

export const dynamic = 'force-dynamic';

interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour effectuer un paiement.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: InitiatePaymentRequest = await request.json();
    const { orderId, amount, paymentMethod, phoneNumber } = body;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Données de paiement incomplètes.' },
        { status: 400 }
      );
    }

    // Verify order exists and belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, total_amount, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée.' },
        { status: 404 }
      );
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé.' },
        { status: 403 }
      );
    }

    // Don't allow payment if already paid
    if (order.status === 'paid') {
      return NextResponse.json(
        { error: 'Cette commande a déjà été payée.' },
        { status: 400 }
      );
    }

    // Validate phone number for Mobile Money
    if ((paymentMethod === 'mobile_money_mtn' || paymentMethod === 'mobile_money_orange') && !phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis pour Mobile Money.' },
        { status: 400 }
      );
    }

    // Get user profile for customer name
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    // Create payment record in database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount: amount,
        currency: 'XAF',
        method: paymentMethod,
        phone_number: phoneNumber || null,
        status: 'pending',
        metadata: {
          user_id: user.id,
          user_email: user.email,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment record creation failed:', paymentError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du paiement.' },
        { status: 500 }
      );
    }

    // Update order with payment reference
    await supabase
      .from('orders')
      .update({
        payment_id: payment.id,
        payment_method: paymentMethod,
      })
      .eq('id', orderId);

    // Initialize payment with CinetPay
    const paymentData: PaymentInitData = {
      orderId: orderId,
      amount: amount,
      currency: 'XAF',
      description: `Commande Pensezy Edition #${orderId.slice(0, 8)}`,
      customerEmail: user.email || '',
      customerName: profile?.full_name || user.email?.split('@')[0] || 'Client',
      customerPhone: phoneNumber,
      paymentMethod: paymentMethod,
      metadata: {
        payment_id: payment.id,
        order_id: orderId,
        user_id: user.id,
      },
    };

    const result = await initializePayment(paymentData);

    if (!result.success || !result.paymentUrl) {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: result.error || 'Initialization failed',
        })
        .eq('id', payment.id);

      return NextResponse.json(
        { error: result.error || 'Échec de l\'initialisation du paiement.' },
        { status: 500 }
      );
    }

    // Update payment with CinetPay info
    await supabase
      .from('payments')
      .update({
        payment_url: result.paymentUrl,
        provider_payment_token: result.paymentToken,
        status: 'processing',
      })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      paymentUrl: result.paymentUrl,
      message: 'Redirection vers la page de paiement...',
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Une erreur inattendue est survenue.' },
      { status: 500 }
    );
  }
}
