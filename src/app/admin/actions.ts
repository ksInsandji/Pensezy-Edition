"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Vérifier d'abord user_metadata puis profiles
  let isAdmin = user.user_metadata?.role === "admin";
  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) throw new Error("Forbidden");

  return supabase;
}

export async function updateListingStatus(listingId: string, status: "active" | "rejected") {
  try {
    const supabase = await checkAdmin();
    await supabase.from("listings").update({ status }).eq("id", listingId);
    revalidatePath("/admin");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeWithdrawal(transactionId: string) {
  try {
    const supabase = await checkAdmin();
    await supabase
      .from("wallet_transactions")
      .update({ status: "completed" })
      .eq("id", transactionId);
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Valider une commande sans paiement (gratuit)
 * Utilisé par l'admin pour offrir des produits ou valider des commandes spéciales
 */
export async function validateOrderWithoutPayment(orderId: string, buyerId: string) {
  try {
    const supabase = await checkAdmin();

    // 1. Récupérer la commande avec ses items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
        *,
        order_items(
          *,
          listing:listings(id, type, book_id, seller_id)
        )
      `
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return { error: "Commande non trouvée" };
    }

    if (order.status !== "pending") {
      return { error: "Cette commande a déjà été traitée" };
    }

    // 2. Mettre à jour le statut de la commande
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return { error: "Erreur lors de la mise à jour de la commande" };
    }

    // 3. Créer les entrées user_books pour les livres numériques
    const userBooks = order.order_items
      .filter((item: any) => item.listing?.type === "digital")
      .map((item: any) => ({
        user_id: buyerId,
        book_id: item.listing.book_id,
        purchased_at: new Date().toISOString(),
        purchase_type: "gift", // Marqué comme cadeau
        order_item_id: item.id,
      }));

    if (userBooks.length > 0) {
      const { error: userBooksError } = await supabase.from("user_books").insert(userBooks);

      if (userBooksError) {
        console.error("Error creating user_books:", userBooksError);
        // Ne pas faire échouer la validation pour ça
      }
    }

    // 4. Mettre à jour le stock pour les livres physiques
    for (const item of order.order_items) {
      if (item.listing?.type === "physical") {
        await supabase.rpc("decrement_stock", {
          listing_id: item.listing.id,
          amount: item.quantity,
        });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    console.error("Error validating order:", e);
    return { error: e.message };
  }
}

/**
 * Annuler une commande
 */
export async function cancelOrder(orderId: string) {
  try {
    const supabase = await checkAdmin();

    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (error) {
      return { error: "Erreur lors de l'annulation" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Modifier le rôle d'un utilisateur
 */
export async function updateUserRole(userId: string, role: "user" | "seller" | "admin") {
  try {
    const supabase = await checkAdmin();

    const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

    if (error) {
      return { error: "Erreur lors de la mise à jour du rôle" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(userId: string) {
  try {
    const supabase = await checkAdmin();

    // Note: Ceci ne supprime que le profil, pas le compte auth
    // Pour supprimer complètement, il faudrait utiliser l'API admin de Supabase
    const { error } = await supabase.from("profiles").delete().eq("id", userId);

    if (error) {
      return { error: "Erreur lors de la suppression" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
