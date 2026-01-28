import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CreditCard, Clock, CheckCircle, XCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { WithdrawalActions } from "./withdrawal-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const statusFilter = params.status?.toString();
  const typeFilter = params.type?.toString();

  let query = supabase
    .from("wallet_transactions")
    .select(
      `
      *,
      profile:profiles(id, full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (typeFilter) {
    query = query.eq("type", typeFilter);
  }

  const { data: transactions, error } = await query;

  // Stats
  const { count: totalTransactions } = await supabase
    .from("wallet_transactions")
    .select("*", { count: "exact", head: true });
  const { count: pendingWithdrawals } = await supabase
    .from("wallet_transactions")
    .select("*", { count: "exact", head: true })
    .eq("type", "withdrawal")
    .eq("status", "pending");
  const { count: completedWithdrawals } = await supabase
    .from("wallet_transactions")
    .select("*", { count: "exact", head: true })
    .eq("type", "withdrawal")
    .eq("status", "completed");

  // Calculate total pending amount
  const { data: pendingAmountData } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("type", "withdrawal")
    .eq("status", "pending");

  const totalPendingAmount = pendingAmountData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  const stats = [
    { label: "Transactions", value: totalTransactions || 0, icon: CreditCard, color: "text-blue-600" },
    { label: "Retraits en attente", value: pendingWithdrawals || 0, icon: Clock, color: "text-yellow-600" },
    { label: "Retraits effectues", value: completedWithdrawals || 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Montant en attente", value: `${totalPendingAmount.toLocaleString()} FCFA`, icon: ArrowDownCircle, color: "text-orange-600", isText: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des paiements</h1>
        <p className="text-muted-foreground">
          Gerez les retraits et transactions des vendeurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className={`text-${stat.isText ? 'lg' : '2xl'} font-bold text-foreground`}>
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/payments"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter && !typeFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Toutes
        </a>
        <a
          href="/admin/payments?type=withdrawal&status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === "withdrawal" && statusFilter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Retraits en attente
        </a>
        <a
          href="/admin/payments?type=withdrawal&status=completed"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === "withdrawal" && statusFilter === "completed"
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Retraits effectues
        </a>
        <a
          href="/admin/payments?type=credit"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            typeFilter === "credit"
              ? "bg-blue-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Credits
        </a>
      </div>

      {/* Transactions List */}
      {transactions && transactions.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Type</th>
                  <th className="text-left p-4 font-medium text-foreground">Utilisateur</th>
                  <th className="text-left p-4 font-medium text-foreground">Montant</th>
                  <th className="text-left p-4 font-medium text-foreground">Statut</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-right p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {transaction.type === "withdrawal" ? (
                          <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-green-500" />
                        )}
                        <span className="text-foreground">
                          {transaction.type === "withdrawal" ? "Retrait" : "Credit"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.profile?.full_name || "Inconnu"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.profile?.email}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          transaction.type === "withdrawal" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {transaction.type === "withdrawal" ? "-" : "+"}
                        {transaction.amount?.toLocaleString()} FCFA
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.status === "completed"
                          ? "Effectue"
                          : transaction.status === "pending"
                          ? "En attente"
                          : "Echoue"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-4">
                      {transaction.type === "withdrawal" && transaction.status === "pending" && (
                        <WithdrawalActions transactionId={transaction.id} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucune transaction</h3>
          <p className="text-muted-foreground">
            {statusFilter || typeFilter
              ? "Aucune transaction ne correspond a vos criteres"
              : "Aucune transaction pour le moment"}
          </p>
        </Card>
      )}
    </div>
  );
}
