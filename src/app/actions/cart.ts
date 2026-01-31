"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type CartItemData = {
  listingId: string;
  quantity: number;
};

/**
 * Obtenir ou créer le panier de l'utilisateur connecté
 */
async function getOrCreateCart(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  // Chercher le panier existant
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existingCart) {
    return existingCart.id;
  }

  // Créer un nouveau panier
  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating cart:", error);
    throw new Error("Impossible de créer le panier");
  }

  return newCart.id;
}

/**
 * Synchroniser le panier local avec la base de données
 * Appelé quand l'utilisateur se connecte
 */
export async function syncCartToDatabase(items: CartItemData[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  try {
    const cartId = await getOrCreateCart(supabase, user.id);

    // Utiliser upsert pour éviter les conflits de clé unique
    if (items.length > 0) {
      for (const item of items) {
        const { error } = await supabase
          .from("cart_items")
          .upsert(
            {
              cart_id: cartId,
              listing_id: item.listingId,
              quantity: item.quantity,
            },
            {
              onConflict: "cart_id,listing_id",
            }
          );

        if (error) {
          console.error("Error syncing cart item:", error);
        }
      }
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Charger le panier depuis la base de données
 */
export async function loadCartFromDatabase() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { items: [] };
  }

  try {
    // Récupérer le panier avec les items et les détails des listings
    const { data: cart } = await supabase
      .from("carts")
      .select(`
        id,
        cart_items(
          listing_id,
          quantity,
          listing:listings(
            id,
            price,
            type,
            stock,
            book:books(id, title, author, cover_url)
          )
        )
      `)
      .eq("user_id", user.id)
      .single();

    if (!cart || !cart.cart_items) {
      return { items: [] };
    }

    // Transformer les données pour le format du store
    const items = cart.cart_items
      .filter((item: any) => item.listing) // Filtrer les listings supprimés
      .map((item: any) => ({
        listingId: item.listing_id,
        bookId: item.listing.book?.id || "",
        title: item.listing.book?.title || "Produit inconnu",
        author: item.listing.book?.author || "",
        coverUrl: item.listing.book?.cover_url || null,
        price: item.listing.price || 0,
        type: item.listing.type,
        quantity: item.quantity,
        maxStock: item.listing.type === "physical" ? item.listing.stock : null,
      }));

    return { items };
  } catch (e: any) {
    console.error("Error loading cart:", e);
    return { items: [] };
  }
}

/**
 * Ajouter un item au panier (sauvegarde en DB)
 */
export async function addItemToCart(listingId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  try {
    const cartId = await getOrCreateCart(supabase, user.id);

    // Vérifier si l'item existe déjà
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("listing_id", listingId)
      .single();

    if (existingItem) {
      // Mettre à jour la quantité
      await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);
    } else {
      // Ajouter nouvel item
      await supabase.from("cart_items").insert({
        cart_id: cartId,
        listing_id: listingId,
        quantity,
      });
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Supprimer un item du panier
 */
export async function removeItemFromCart(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cart) {
      await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id)
        .eq("listing_id", listingId);
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Vider le panier
 */
export async function clearCartInDatabase() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cart) {
      await supabase.from("cart_items").delete().eq("cart_id", cart.id);
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Mettre à jour la quantité d'un item dans le panier
 */
export async function updateCartItemQuantity(listingId: string, quantity: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  try {
    const { data: cart } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (cart) {
      await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("cart_id", cart.id)
        .eq("listing_id", listingId);
    }

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Récupérer tous les paniers (Admin uniquement)
 */
export async function getAllCarts() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté", carts: [] };
  }

  // Vérifier que c'est un admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Non autorisé", carts: [] };
  }

  try {
    // Récupérer les paniers avec leurs items
    const { data: carts, error } = await supabase
      .from("carts")
      .select(`
        id,
        user_id,
        created_at,
        updated_at,
        cart_items(
          id,
          listing_id,
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
      return { error: error.message, carts: [] };
    }

    // Filtrer les paniers vides et récupérer les infos des utilisateurs
    if (carts && carts.length > 0) {
      // Ne garder que les paniers avec au moins un item
      const nonEmptyCarts = carts.filter((c) => c.cart_items && c.cart_items.length > 0);

      if (nonEmptyCarts.length === 0) {
        return { carts: [] };
      }

      const userIds = nonEmptyCarts.map((c) => c.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      // Associer les profils aux paniers
      const cartsWithUsers = nonEmptyCarts.map((cart) => ({
        ...cart,
        user: profiles?.find((p) => p.id === cart.user_id) || null,
      }));

      return { carts: cartsWithUsers };
    }

    return { carts: [] };
  } catch (e: any) {
    return { error: e.message, carts: [] };
  }
}

/**
 * Supprimer un panier (Admin uniquement)
 */
export async function deleteCart(cartId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  // Vérifier que c'est un admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Non autorisé" };
  }

  try {
    // Supprimer les items du panier d'abord
    await supabase.from("cart_items").delete().eq("cart_id", cartId);

    // Supprimer le panier
    const { error } = await supabase.from("carts").delete().eq("id", cartId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/carts");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

/**
 * Valider un panier et créer une commande payée (Admin uniquement)
 */
export async function validateCart(cartId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non connecté" };
  }

  // Vérifier que c'est un admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Non autorisé" };
  }

  try {
    // Récupérer le panier avec ses items
    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select(`
        id,
        user_id,
        cart_items(
          listing_id,
          quantity,
          listing:listings(id, price, type, stock)
        )
      `)
      .eq("id", cartId)
      .single();

    if (cartError || !cart) {
      return { error: "Panier introuvable" };
    }

    if (!cart.cart_items || cart.cart_items.length === 0) {
      return { error: "Panier vide" };
    }

    // Calculer le total
    const total = cart.cart_items.reduce((sum: number, item: any) => {
      return sum + (item.listing?.price || 0) * item.quantity;
    }, 0);

    // Créer la commande avec statut "paid"
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: cart.user_id,
        total_amount: total,
        status: "paid",
        payment_method: "admin_validation",
      })
      .select()
      .single();

    if (orderError || !order) {
      return { error: "Erreur création commande: " + orderError?.message };
    }

    // Créer les order_items avec commission plateforme (ex: 10%)
    const PLATFORM_COMMISSION_RATE = 0.10; // 10%
    const orderItems = cart.cart_items.map((item: any) => {
      const priceAtPurchase = item.listing?.price || 0;
      const platformCommission = priceAtPurchase * item.quantity * PLATFORM_COMMISSION_RATE;
      return {
        order_id: order.id,
        listing_id: item.listing_id,
        quantity: item.quantity,
        price_at_purchase: priceAtPurchase,
        platform_commission: platformCommission,
      };
    });

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      // Rollback: supprimer la commande
      await supabase.from("orders").delete().eq("id", order.id);
      return { error: "Erreur création items: " + itemsError.message };
    }

    // Pour chaque item numérique, créer l'accès à la bibliothèque
    for (const item of cart.cart_items) {
      if (item.listing?.type === "digital") {
        // Récupérer le book_id depuis le listing
        const { data: listing } = await supabase
          .from("listings")
          .select("book_id")
          .eq("id", item.listing_id)
          .single();

        if (listing) {
          await supabase.from("user_books").upsert({
            user_id: cart.user_id,
            book_id: listing.book_id,
            purchase_type: "purchase",
          }, {
            onConflict: "user_id,book_id",
          });
        }
      }

      // Décrémenter le stock pour les produits physiques
      if (item.listing?.type === "physical" && item.listing?.stock > 0) {
        await supabase.rpc("decrement_stock", {
          listing_id: item.listing_id,
          amount: item.quantity,
        });
      }
    }

    // Vider le panier (items puis le panier lui-même)
    await supabase.from("cart_items").delete().eq("cart_id", cartId);
    await supabase.from("carts").delete().eq("id", cartId);

    revalidatePath("/admin/carts");
    revalidatePath("/admin/orders");

    return { success: true, orderId: order.id };
  } catch (e: any) {
    return { error: e.message };
  }
}
