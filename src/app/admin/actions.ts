"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Helper to check admin
async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== 'admin') throw new Error("Forbidden");

  return supabase;
}

export async function updateListingStatus(listingId: string, status: 'active' | 'rejected') {
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
    await supabase.from("wallet_transactions").update({ status: 'completed' }).eq("id", transactionId);
    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
