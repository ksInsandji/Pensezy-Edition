"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema, ProductFormValues } from "@/lib/schemas";

/**
 * Créer un nouveau produit (version améliorée avec support hybride)
 */
export async function createProduct(params: ProductFormValues) {
  const validation = productSchema.safeParse(params);
  if (!validation.success) {
    return { error: "Données invalides: " + validation.error.message };
  }
  const data = validation.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  try {
    // 1. Créer le livre dans la table books
    const { data: book, error: bookError } = await supabase
      .from("books")
      .insert({
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        description: data.description || null,
        cover_url: data.coverUrl || null,
        category: data.category || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (bookError) {
      // Dans src/app/seller/actions.ts
      console.error("Error inserting book:", bookError);
      return { error: `Erreur lors de la création du livre : ${bookError.message}` };
    }

    // 2. Créer les listings selon le type de produit
    const listings: Array<{
      book_id: string;
      seller_id: string;
      type: "physical" | "digital";
      price: number;
      stock: number;
      file_path: string | null;
      allow_download: boolean;
    }> = [];

    // Version numérique
    if (data.productType === "digital" || data.productType === "hybrid") {
      if (data.digitalPrice === null || data.digitalPrice === undefined) {
        return { error: "Le prix numérique est requis pour ce type de produit" };
      }

      listings.push({
        book_id: book.id,
        seller_id: user.id,
        type: "digital",
        price: data.digitalPrice,
        stock: 0,
        file_path: data.filePath || null,
        allow_download: data.allowDownload,
      });
    }

    // Version physique
    if (data.productType === "physical" || data.productType === "hybrid") {
      if (data.physicalPrice === null || data.physicalPrice === undefined) {
        return { error: "Le prix physique est requis pour ce type de produit" };
      }

      listings.push({
        book_id: book.id,
        seller_id: user.id,
        type: "physical",
        price: data.physicalPrice,
        stock: data.stock || 0,
        file_path: null,
        allow_download: false,
      });
    }

    // Insérer tous les listings
    const { error: listingError } = await supabase.from("listings").insert(listings);

    if (listingError) {
      console.error("Error inserting listings:", listingError);
      // Supprimer le livre créé en cas d'échec
      await supabase.from("books").delete().eq("id", book.id);
      return { error: "Erreur lors de la création des offres: " + listingError.message };
    }

    revalidatePath("/seller/products");
    revalidatePath("/marketplace");
    return { success: true, bookId: book.id };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Demander un retrait de fonds
 */
export async function withdrawFunds(amount: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  const { error } = await supabase.rpc("request_withdrawal", {
    p_user_id: user.id,
    p_amount: amount,
  });

  if (error) {
    console.error("Withdrawal error:", error);
    return { error: "Erreur lors du retrait : " + error.message };
  }

  revalidatePath("/seller/wallet");
  return { success: true };
}

/**
 * Supprimer un produit
 */
export async function deleteProduct(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: "Erreur lors de la suppression : " + error.message };
  }

  revalidatePath("/seller/products");
  revalidatePath("/marketplace");
  return { success: true };
}

/**
 * Mettre à jour un produit (version améliorée avec support hybride)
 */
export async function updateProduct(
  bookId: string,
  data: {
    title?: string;
    author?: string;
    description?: string;
    isbn?: string;
    category?: string;
    digitalPrice?: number | null;
    physicalPrice?: number | null;
    stock?: number;
    allowDownload?: boolean;
    discountPercent?: number;
    coverUrl?: string | null;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // 1. Vérifier que le livre appartient au vendeur
  const { data: listings } = await supabase
    .from("listings")
    .select("id, type, seller_id")
    .eq("book_id", bookId)
    .eq("seller_id", user.id);

  if (!listings || listings.length === 0) {
    return { error: "Produit introuvable ou accès refusé" };
  }

  try {
    // 2. Mettre à jour le livre
    const bookUpdate: Record<string, unknown> = {};
    if (data.title) bookUpdate.title = data.title;
    if (data.author) bookUpdate.author = data.author;
    if (data.description !== undefined) bookUpdate.description = data.description;
    if (data.isbn !== undefined) bookUpdate.isbn = data.isbn;
    if (data.category !== undefined) bookUpdate.category = data.category;
    if (data.coverUrl !== undefined) bookUpdate.cover_url = data.coverUrl;

    if (Object.keys(bookUpdate).length > 0) {
      const { error: bookError } = await supabase
        .from("books")
        .update(bookUpdate)
        .eq("id", bookId);

      if (bookError) {
        console.error("Error updating book:", bookError);
        return { error: "Erreur mise à jour livre: " + bookError.message };
      }
    }

    // 3. Mettre à jour les listings
    for (const listing of listings) {
      const listingUpdate: Record<string, unknown> = {};

      if (listing.type === "digital") {
        if (data.digitalPrice !== undefined && data.digitalPrice !== null) {
          listingUpdate.price = data.digitalPrice;
        }
        if (data.allowDownload !== undefined) {
          listingUpdate.allow_download = data.allowDownload;
        }
      }

      if (listing.type === "physical") {
        if (data.physicalPrice !== undefined && data.physicalPrice !== null) {
          listingUpdate.price = data.physicalPrice;
        }
        if (data.stock !== undefined) {
          listingUpdate.stock = data.stock;
        }
      }

      if (Object.keys(listingUpdate).length > 0) {
        const { error: listingError } = await supabase
          .from("listings")
          .update(listingUpdate)
          .eq("id", listing.id);

        if (listingError) {
          console.error("Error updating listing:", listingError);
          return { error: "Erreur mise à jour offre: " + listingError.message };
        }
      }
    }

    revalidatePath("/seller/products");
    revalidatePath("/marketplace");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating product:", error);
    return { error: "Une erreur inattendue s'est produite" };
  }
}

/**
 * Récupérer un produit par bookId pour l'édition
 */
export async function getProductForEdit(bookId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Récupérer le livre
  const { data: book, error: bookError } = await supabase
    .from("books")
    .select("*")
    .eq("id", bookId)
    .single();

  if (bookError || !book) {
    return { error: "Livre introuvable" };
  }

  // Récupérer les listings du vendeur pour ce livre
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("*")
    .eq("book_id", bookId)
    .eq("seller_id", user.id);

  if (listingsError || !listings || listings.length === 0) {
    return { error: "Produit introuvable ou accès refusé" };
  }

  // Formater les données
  type ListingRow = {
    id: string;
    type: "digital" | "physical";
    price: number;
    stock: number;
    allow_download: boolean;
    file_path: string | null;
  };
  const digitalListing = listings.find((l: ListingRow) => l.type === "digital");
  const physicalListing = listings.find((l: ListingRow) => l.type === "physical");

  const hasDigital = !!digitalListing;
  const hasPhysical = !!physicalListing;

  let productType: "digital" | "physical" | "hybrid" = "digital";
  if (hasDigital && hasPhysical) productType = "hybrid";
  else if (hasPhysical) productType = "physical";

  return {
    data: {
      bookId: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      isbn: book.isbn,
      category: book.category,
      coverUrl: book.cover_url,
      productType,
      hasDigital,
      hasPhysical,
      digitalPrice: digitalListing?.price || null,
      physicalPrice: physicalListing?.price || null,
      stock: physicalListing?.stock || 0,
      allowDownload: digitalListing?.allow_download || false,
      filePath: digitalListing?.file_path || null,
      digitalListingId: digitalListing?.id || null,
      physicalListingId: physicalListing?.id || null,
    },
  };
}
