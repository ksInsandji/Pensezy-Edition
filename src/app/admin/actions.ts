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
 * Peut être utilisé sur n'importe quel statut de commande (pending, cancelled, etc.)
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

    // Permettre la validation même si déjà payée (re-validation) ou annulée
    // Seule restriction: ne pas re-créer les accès si déjà existants

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

    // 3. Créer les entrées user_books pour les livres numériques (si pas déjà existants)
    for (const item of order.order_items) {
      if (item.listing?.type === "digital") {
        // Vérifier si l'accès existe déjà
        const { data: existingAccess } = await supabase
          .from("user_books")
          .select("id")
          .eq("user_id", buyerId)
          .eq("book_id", item.listing.book_id)
          .single();

        if (!existingAccess) {
          await supabase.from("user_books").insert({
            user_id: buyerId,
            book_id: item.listing.book_id,
            purchased_at: new Date().toISOString(),
            purchase_type: "gift",
            order_item_id: item.id,
          });
        }
      }
    }

    // 4. Mettre à jour le stock pour les livres physiques (seulement si pas déjà traité)
    if (order.status !== "paid") {
      for (const item of order.order_items) {
        if (item.listing?.type === "physical") {
          await supabase.rpc("decrement_stock", {
            listing_id: item.listing.id,
            amount: item.quantity,
          });
        }
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

/**
 * Modifier un produit (admin peut modifier n'importe quel produit)
 */
export async function adminUpdateProduct(
  listingId: string,
  data: {
    price?: number;
    stock?: number;
    status?: "active" | "pending" | "rejected";
    discount_percent?: number;
  }
) {
  try {
    const supabase = await checkAdmin();

    const updateData: Record<string, any> = {};
    if (data.price !== undefined) updateData.price = data.price;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.discount_percent !== undefined) updateData.discount_percent = data.discount_percent;

    const { error } = await supabase
      .from("listings")
      .update(updateData)
      .eq("id", listingId);

    if (error) {
      return { error: "Erreur lors de la mise à jour du produit" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Supprimer un produit (admin peut supprimer n'importe quel produit)
 */
export async function adminDeleteProduct(listingId: string) {
  try {
    const supabase = await checkAdmin();

    // Récupérer le book_id pour vérifier s'il faut aussi supprimer le livre
    const { data: listing } = await supabase
      .from("listings")
      .select("book_id")
      .eq("id", listingId)
      .single();

    // Supprimer le listing
    const { error } = await supabase.from("listings").delete().eq("id", listingId);

    if (error) {
      return { error: "Erreur lors de la suppression du produit" };
    }

    // Vérifier s'il reste d'autres listings pour ce livre
    if (listing?.book_id) {
      const { count } = await supabase
        .from("listings")
        .select("*", { count: "exact", head: true })
        .eq("book_id", listing.book_id);

      // Si plus de listings, supprimer aussi le livre
      if (count === 0) {
        await supabase.from("books").delete().eq("id", listing.book_id);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Invalider une commande (remettre en pending ou annuler)
 */
export async function invalidateOrder(orderId: string, newStatus: "pending" | "cancelled") {
  try {
    const supabase = await checkAdmin();

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        paid_at: newStatus === "pending" ? null : undefined
      })
      .eq("id", orderId);

    if (error) {
      return { error: "Erreur lors de la mise à jour de la commande" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Supprimer définitivement une commande annulée
 * Seules les commandes avec le statut "cancelled" peuvent être supprimées
 */
export async function deleteOrder(orderId: string) {
  try {
    const supabase = await checkAdmin();

    // Vérifier que la commande existe et est annulée
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Commande non trouvée" };
    }

    if (order.status !== "cancelled") {
      return { error: "Seules les commandes annulées peuvent être supprimées" };
    }

    // Supprimer d'abord les order_items
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error deleting order items:", itemsError);
      return { error: "Erreur lors de la suppression des items de commande" };
    }

    // Supprimer la commande
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (orderError) {
      console.error("Error deleting order:", orderError);
      return { error: "Erreur lors de la suppression de la commande" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    console.error("Error in deleteOrder:", e);
    return { error: e.message };
  }
}

// ==================== GESTION DES PANIERS ====================

/**
 * Recuperer tous les paniers des utilisateurs
 */
export async function getAllUserCarts() {
  try {
    const supabase = await checkAdmin();

    const { data: carts, error } = await supabase
      .from("carts")
      .select(`
        id,
        user_id,
        updated_at,
        user:profiles!carts_user_id_fkey(id, full_name, email),
        cart_items(
          id,
          quantity,
          listing:listings(
            id,
            price,
            type,
            book:books(id, title, author, cover_url)
          )
        )
      `)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching carts:", error);
      return { error: "Erreur lors de la recuperation des paniers" };
    }

    return { carts };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Valider un panier (convertir en commande payee)
 * Le client obtient acces aux produits sans payer
 */
export async function validateCartAsOrder(cartId: string, userId: string) {
  try {
    const supabase = await checkAdmin();

    // 1. Recuperer les items du panier
    const { data: cartItems, error: cartError } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        listing:listings(id, price, type, book_id, seller_id)
      `)
      .eq("cart_id", cartId);

    if (cartError || !cartItems || cartItems.length === 0) {
      return { error: "Panier vide ou introuvable" };
    }

    // 2. Calculer le total
    const totalAmount = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.listing?.price || 0) * item.quantity;
    }, 0);

    // 3. Creer la commande
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: userId,
        total_amount: totalAmount,
        status: "paid",
        payment_method: "admin_gift",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError || !order) {
      return { error: "Erreur lors de la creation de la commande" };
    }

    // 4. Creer les items de commande et accorder les acces
    for (const item of cartItems) {
      const listing = item.listing as any;
      if (!listing) continue;

      // Creer l'item de commande
      await supabase.from("order_items").insert({
        order_id: order.id,
        listing_id: listing.id,
        quantity: item.quantity,
        price_at_purchase: listing.price,
      });

      // Accorder l'acces pour les produits numeriques
      if (listing.type === "digital") {
        const { data: existingAccess } = await supabase
          .from("user_books")
          .select("id")
          .eq("user_id", userId)
          .eq("book_id", listing.book_id)
          .single();

        if (!existingAccess) {
          await supabase.from("user_books").insert({
            user_id: userId,
            book_id: listing.book_id,
            purchased_at: new Date().toISOString(),
            purchase_type: "gift",
          });
        }
      }

      // Mettre a jour le stock pour les produits physiques
      if (listing.type === "physical") {
        await supabase.rpc("decrement_stock", {
          listing_id: listing.id,
          amount: item.quantity,
        });
      }
    }

    // 5. Vider le panier
    await supabase.from("cart_items").delete().eq("cart_id", cartId);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true, orderId: order.id };
  } catch (e: any) {
    console.error("Error validating cart:", e);
    return { error: e.message };
  }
}

/**
 * Supprimer un item specifique d'un panier utilisateur
 */
export async function removeCartItem(cartItemId: string) {
  try {
    const supabase = await checkAdmin();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (error) {
      return { error: "Erreur lors de la suppression de l'item" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Vider completement un panier utilisateur
 */
export async function clearUserCart(cartId: string) {
  try {
    const supabase = await checkAdmin();

    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) {
      return { error: "Erreur lors du vidage du panier" };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

// ==================== RECHERCHE ADMIN ====================

/**
 * Recherche globale pour l'admin (utilisateurs, livres, commandes)
 */
export async function adminSearch(query: string) {
  try {
    const supabase = await checkAdmin();

    if (!query || query.length < 2) {
      return { results: { users: [], books: [], orders: [] } };
    }

    const searchTerm = `%${query}%`;

    // Rechercher utilisateurs
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(5);

    // Rechercher livres
    const { data: books } = await supabase
      .from("books")
      .select("id, title, author, cover_url")
      .or(`title.ilike.${searchTerm},author.ilike.${searchTerm}`)
      .limit(5);

    // Rechercher commandes par ID
    const { data: orders } = await supabase
      .from("orders")
      .select(`
        id,
        total_amount,
        status,
        buyer:profiles!orders_buyer_id_fkey(full_name, email)
      `)
      .ilike("id", searchTerm)
      .limit(5);

    return {
      results: {
        users: users || [],
        books: books || [],
        orders: orders || [],
      },
    };
  } catch (e: any) {
    return { error: e.message };
  }
}
