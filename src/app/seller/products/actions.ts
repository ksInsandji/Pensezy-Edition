"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  description: z.string().optional(),
  price: z.number().min(0, "Le prix doit être positif"),
  type: z.enum(["physical", "digital"]),
  condition: z.enum(["new", "like_new", "good", "acceptable"]).optional(),
  stock: z.number().min(0).optional(),
});

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  // 1. Validate input
  const rawData = {
    title: formData.get("title"),
    author: formData.get("author"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    type: formData.get("type"),
    condition: formData.get("condition"),
    stock: Number(formData.get("stock")),
  };

  const validation = productSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.flatten().fieldErrors };
  }

  const data = validation.data;

  // 2. Insert Book (Metadata)
  // Note: Dans un vrai système, on chercherait d'abord si le livre existe déjà par ISBN
  const { data: book, error: bookError } = await supabase
    .from("books")
    .insert({
      title: data.title,
      author: data.author,
      description: data.description || "",
      created_by: user.id,
    })
    .select()
    .single();

  if (bookError || !book) {
    console.error(bookError);
    return { error: "Erreur lors de la création de la fiche livre." };
  }

  // 3. Insert Listing (Offer)
  const { error: listingError } = await supabase
    .from("listings")
    .insert({
      book_id: book.id,
      seller_id: user.id,
      type: data.type as "physical" | "digital",
      price: data.price,
      stock: data.type === 'physical' ? (data.stock || 1) : null,
      condition: data.type === 'physical' ? (data.condition as any || 'good') : null,
      // Pour le digital, on gérera l'upload de fichier dans une étape séparée ou via un signed upload url
    });

  if (listingError) {
    console.error(listingError);
    return { error: "Erreur lors de la création de l'offre." };
  }

  revalidatePath("/seller/products");
  redirect("/seller/products");
}
