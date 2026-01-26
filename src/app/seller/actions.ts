"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/schemas";
import { z } from "zod";

type CreateProductParams = z.infer<typeof productSchema>;

export async function createProduct(params: CreateProductParams) {
  // Server-side validation
  const validation = productSchema.safeParse(params);
  if (!validation.success) {
    return { error: "Données invalides: " + validation.error.message };
  }
  const data = validation.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  // 1. Insert into Books
  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      title: data.title,
      author: data.author,
      isbn: data.isbn,
      description: data.description,
      cover_url: data.coverUrl,
      // category: "General", // Default for now
    })
    .select()
    .single();

  if (bookError) {
    console.error("Error inserting book:", bookError);
    return { error: "Erreur lors de la création du livre" };
  }

  // 2. Insert into Listings
  const { error: listingError } = await supabase
    .from("listings")
    .insert({
      book_id: book.id,
      seller_id: user.id,
      type: data.type,
      price: data.price,
      stock: data.type === "physical" ? data.stock : 0,
      file_path: data.type === "digital" ? data.filePath : null,
      allow_download: false, // Default
    });

  if (listingError) {
    console.error("Error inserting listing:", listingError);
    // Optional: Rollback book creation? For MVP, we'll leave it or handle it manually.
    return { error: "Erreur lors de la création de l'offre" };
  }

  revalidatePath("/seller/products");
  return { success: true };
}

export async function withdrawFunds(amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Non autorisé" };
  }

  const { error } = await supabase.rpc('request_withdrawal', {
    p_user_id: user.id,
    p_amount: amount
  });

  if (error) {
    console.error("Withdrawal error:", error);
    return { error: "Erreur lors du retrait : " + error.message };
  }

  revalidatePath("/seller/wallet");
  return { success: true };
}

export async function deleteProduct(listingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // Check ownership automatically via RLS usually, but good to be explicit or handle error
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

export async function updateProduct(listingId: string, data: Partial<CreateProductParams>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Non autorisé" };

  // 1. Get Listing to get Book ID
  const { data: listing } = await supabase
    .from("listings")
    .select("book_id, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.seller_id !== user.id) {
    return { error: "Produit introuvable ou accès refusé" };
  }

  // 2. Update Listing (Price, Stock)
  const { error: listingError } = await supabase
    .from("listings")
    .update({
      price: data.price,
      stock: data.type === 'physical' ? data.stock : 0,
    })
    .eq("id", listingId);

  if (listingError) return { error: "Erreur mise à jour offre" };

  // 3. Update Book (Title, Description, Author)
  // Note: If multiple listings share a book, this updates for everyone.
  // In our MVP logic "1 Listing creates 1 Book", it's fine.
  const { error: bookError } = await supabase
    .from("books")
    .update({
      title: data.title,
      author: data.author,
      description: data.description,
      isbn: data.isbn
    })
    .eq("id", listing.book_id);

  if (bookError) return { error: "Erreur mise à jour livre" };

  revalidatePath("/seller/products");
  revalidatePath("/marketplace");
  return { success: true };
}
