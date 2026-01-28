import { createClient } from "@/lib/supabase/server";
import { AdminOrdersList } from "./admin-orders-list";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, buyer:profiles(*)")
    .order("created_at", { ascending: false });

  return <AdminOrdersList orders={orders || []} />;
}
