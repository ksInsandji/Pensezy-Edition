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

    // Supprimer les anciens items
    await supabase.from("cart_items").delete().eq("cart_id", cartId);

    // Insérer les nouveaux items
    if (items.length > 0) {
      const cartItems = items.map((item) => ({
        cart_id: cartId,
        listing_id: item.listingId,
        quantity: item.quantity,
      }));

      const { error } = await supabase.from("cart_items").insert(cartItems);
      if (error) {
        console.error("Error syncing cart items:", error);
        return { error: "Erreur lors de la synchronisation" };
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
