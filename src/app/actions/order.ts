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
      // payment_method: params.paymentMethod -- If we had a column
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
      .select("type, stock")
      .eq("id", item.listingId)
      .single();

    if (listing) {
      if (listing.type === 'digital') {
         // 3. Grant Library Access
         const { error: libError } = await supabase
            .from("library_access")
            .insert({
                user_id: user.id,
                listing_id: item.listingId,
                can_download_snapshot: false
            });

         if (libError) console.error("Library access grant failed (maybe duplicate):", libError);

      } else {
          // 4. Update Stock (Physical)
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
