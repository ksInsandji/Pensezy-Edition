import { createClient } from "@/lib/supabase/server";
import { AllProductsList } from "./all-products-list";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("listings")
    .select("*, book:books(*), seller:profiles(*)")
    .order("created_at", { ascending: false });

  return <AllProductsList listings={listings || []} />;
}
