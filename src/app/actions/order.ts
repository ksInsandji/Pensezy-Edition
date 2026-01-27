"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type OrderItemInput = {
  listingId: string;
  quantity: number;
  price: number;
};

type CreateOrderParams = {
  items: OrderItemInput[];
  totalAmount: number;
  paymentMethod: string;
};

/**
 * Create an order with PENDING status (for real payment flow)
 * The order items are created but library access / stock / seller credit
 * will only be processed after payment confirmation via webhook
 */
export async function createOrderPending(params: CreateOrderParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour commander." };
  }

  // 1. Create Order with PENDING status
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      total_amount: params.totalAmount,
      status: "pending", // Will be updated to "paid" by webhook
      payment_method: params.paymentMethod,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation failed:", orderError);
    return { error: "Erreur lors de la création de la commande." };
  }

  // 2. Create Order Items (but don't process them yet - wait for payment)
  for (const item of params.items) {
    const { error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        listing_id: item.listingId,
        quantity: item.quantity,
        price_at_purchase: item.price
      });

    if (itemError) {
      console.error("Item creation failed:", itemError);
    }
  }

  return { success: true, orderId: order.id };
}

/**
 * Legacy function: Create order and immediately mark as paid
 * Used for testing or mock payment scenarios
 * @deprecated Use createOrderPending + real payment flow instead
 */
export async function createOrder(params: CreateOrderParams) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté pour commander." };
  }

  // 1. Create Order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      total_amount: params.totalAmount,
      status: "paid", // MVP: Auto-paid mock
      payment_method: params.paymentMethod,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation failed:", orderError);
    return { error: "Erreur lors de la création de la commande." };
  }

  // 2. Process Items
  for (const item of params.items) {
    // 2a. Create Order Item
    const { error: itemError } = await supabase
      .from("order_items")
      .insert({
        order_id: order.id,
        listing_id: item.listingId,
        quantity: item.quantity,
        price_at_purchase: item.price
      });

    if (itemError) {
        console.error("Item creation failed:", itemError);
        // Continue to try other items or library access (MVP resilience)
    }

    // 2b. Fetch listing type to know if digital or physical
    // Optimization: We could pass type from client, but verify here is safer.
    const { data: listing } = await supabase
      .from("listings")
      .select("type, stock, seller_id")
      .eq("id", item.listingId)
      .single();

    if (listing) {
      // 3. Process Financial Transaction (Credit Seller)
      const totalPrice = item.price * item.quantity;
      const { error: rpcError } = await supabase.rpc('process_sale', {
        p_listing_id: item.listingId,
        p_seller_id: listing.seller_id,
        p_quantity: item.quantity,
        p_total_price: totalPrice,
        p_order_id: order.id
      });

      if (rpcError) console.error("Wallet update failed:", rpcError);

      if (listing.type === 'digital') {
         // 4. Grant Library Access
         const { error: libError } = await supabase
            .from("library_access")
            .insert({
                user_id: user.id,
                listing_id: item.listingId,
                can_download_snapshot: false
            });

         if (libError) console.error("Library access grant failed (maybe duplicate):", libError);

      } else {
          // 5. Update Stock (Physical)
          const newStock = Math.max(0, listing.stock - item.quantity);
          await supabase
            .from("listings")
            .update({ stock: newStock })
            .eq("id", item.listingId);
      }
    }
  }

  revalidatePath("/marketplace"); // Update stocks

  return { success: true, orderId: order.id };
}
