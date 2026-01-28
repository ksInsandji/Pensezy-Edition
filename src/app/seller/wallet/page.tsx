import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { WithdrawSection } from "./withdraw-section";
import { Wallet } from "lucide-react";

export default async function WalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get Profile for Balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  // Get Transactions
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const balance = profile?.wallet_balance || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mon Porte-monnaie</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-blue-900 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white/10 rounded-full">
                    <Wallet className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-blue-100 text-sm">Solde actuel</p>
                    <p className="text-3xl font-bold">{balance.toLocaleString()} FCFA</p>
                </div>
            </div>
            <div className="text-sm text-blue-200">
                Vos gains sont disponibles immédiatement après achat.
            </div>
        </div>

        {/* Withdraw Section */}
        <WithdrawSection balance={balance} />
      </div>

      {/* Transactions History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Historique des transactions</h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Montant</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {transactions?.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{tx.description || '-'}</td>
                            <td className="px-6 py-4 capitalize">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    tx.type === 'sale' ? 'bg-green-100 text-green-800' :
                                    tx.type === 'withdrawal' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {tx.type}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} FCFA
                            </td>
                        </tr>
                    ))}
                    {!transactions?.length && (
                        <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                Aucune transaction pour le moment.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
