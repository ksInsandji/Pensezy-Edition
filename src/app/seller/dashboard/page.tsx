import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Wallet, BookOpen, ShoppingBag, TrendingUp } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Get Wallet Balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  // 2. Get Products Count
  const { count: productsCount } = await supabase
    .from("listings")
    .select("*", { count: 'exact', head: true })
    .eq("seller_id", user.id);

  // 3. Get Sales Count (Approximation via transactions 'sale')
  const { count: salesCount } = await supabase
    .from("wallet_transactions")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", user.id)
    .eq("type", "sale");

  const balance = profile?.wallet_balance || 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 font-display">Tableau de bord</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="bg-blue-900 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-blue-100 font-medium">Solde disponible</p>
            <div className="p-2 bg-blue-800 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-200" />
            </div>
          </div>
          <p className="text-3xl font-bold">{balance.toLocaleString()} FCFA</p>
          <p className="text-xs text-blue-200 mt-2 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            Mise à jour en temps réel
          </p>
        </div>

        {/* Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 font-medium">Livres en vente</p>
            <div className="p-2 bg-purple-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{productsCount || 0}</p>
          <p className="text-xs text-gray-400 mt-2">
            Actifs et en attente
          </p>
        </div>

        {/* Sales */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 font-medium">Total des ventes</p>
            <div className="p-2 bg-green-50 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{salesCount || 0}</p>
          <p className="text-xs text-gray-400 mt-2">
            Transactions réussies
          </p>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Conseils pour vendre plus</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Soignez vos couvertures</h3>
                <p className="text-sm text-gray-600">Une image de qualité augmente vos chances de vente par 3.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Description détaillée</h3>
                <p className="text-sm text-gray-600">Donnez envie aux lecteurs avec un résumé accrocheur.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
