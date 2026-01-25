import { createClient } from "@/lib/supabase/server";
import { AdminListingList } from "./admin-listings";
import { AdminWithdrawalList } from "./admin-withdrawals";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Get Pending Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*, book:books(*), seller:profiles(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 2. Get Pending Withdrawals
  const { data: withdrawals } = await supabase
    .from("wallet_transactions")
    .select("*, profile:profiles(*)") // Assuming profiles relation is set on user_id
    .eq("type", "withdrawal")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <AdminListingList listings={listings || []} />
      <AdminWithdrawalList withdrawals={withdrawals || []} />
    </div>
  );
}
