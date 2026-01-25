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
