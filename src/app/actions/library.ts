"use server";
import { createClient } from "@/lib/supabase/server";

export async function updateReadingProgress(listingId: string, page: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("library_access")
    .update({ last_page_read: page })
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) console.error("Error saving progress:", error);
}
