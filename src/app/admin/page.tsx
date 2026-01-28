import { createClient } from "@/lib/supabase/server";
import { AdminListingList } from "./admin-listings";
import { AdminWithdrawalList } from "./admin-withdrawals";
import { Users, ShoppingBag, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // KPIs
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
  const { count: ordersCount } = await supabase.from("orders").select("*", { count: 'exact', head: true });
  const { count: productsCount } = await supabase.from("listings").select("*", { count: 'exact', head: true });

  // 1. Get Pending Listings
  const { data: listings } = await supabase
    .from("listings")
    .select("*, book:books(*), seller:profiles(*)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // 2. Get Pending Withdrawals
  const { data: withdrawals } = await supabase
    .from("wallet_transactions")
    .select("*, profile:profiles(*)")
    .eq("type", "withdrawal")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Utilisateurs inscrits</p>
                <p className="text-3xl font-bold text-gray-900">{usersCount || 0}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <Users className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Commandes totales</p>
                <p className="text-3xl font-bold text-gray-900">{ordersCount || 0}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full text-green-600">
                <ShoppingBag className="w-6 h-6" />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">Produits en ligne</p>
                <p className="text-3xl font-bold text-gray-900">{productsCount || 0}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                <Package className="w-6 h-6" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Validations en attente</h2>
            <AdminListingList listings={listings || []} />
        </div>
        <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Retraits en attente</h2>
            <AdminWithdrawalList withdrawals={withdrawals || []} />
        </div>
      </div>
    </div>
  );
}
