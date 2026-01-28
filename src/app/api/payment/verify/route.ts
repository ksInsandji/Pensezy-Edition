import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyPayment } from '@/lib/payment';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Get order ID from query params
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID requis' },
        { status: 400 }
      );
    }

    // Verify order belongs to user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, buyer_id, status, total_amount, payment_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (order.buyer_id !== user.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // If already paid, return success
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        status: 'completed',
        message: 'Paiement confirmé',
      });
    }

    // Get payment info
    const { data: payment } = await supabase
      .from('payments')
      .select('id, status, provider_transaction_id')
      .eq('order_id', orderId)
      .single();

    // If no payment record or still pending, check with CinetPay
    if (payment && payment.status === 'processing') {
      const verification = await verifyPayment(orderId);

      return NextResponse.json({
        success: verification.success,
        status: verification.status,
        message: verification.success
          ? 'Paiement confirmé'
          : 'Paiement en attente de confirmation',
      });
    }

    return NextResponse.json({
      success: false,
      status: payment?.status || 'pending',
      message: getStatusMessage(payment?.status || 'pending'),
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Erreur de vérification' },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  switch (status) {
    case 'completed':
      return 'Paiement confirmé';
    case 'processing':
      return 'Paiement en cours de traitement';
    case 'pending':
      return 'En attente du paiement';
    case 'failed':
      return 'Le paiement a échoué';
    case 'cancelled':
      return 'Paiement annulé';
    default:
      return 'Statut inconnu';
  }
}
