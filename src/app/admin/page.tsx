import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  Users,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import { AdminListingList } from "./admin-listings";
import { AdminWithdrawalList } from "./admin-withdrawals";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Récupérer les statistiques en parallèle
  const [
    { count: usersCount },
    { count: sellersCount },
    { count: booksCount },
    { count: ordersCount },
    { count: pendingOrdersCount },
    { data: recentOrders },
    { data: pendingListings },
    { data: pendingWithdrawals },
    { data: recentUsers },
  ] = await Promise.all([
    // Total utilisateurs
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    // Total vendeurs
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller"),
    // Total livres
    supabase.from("books").select("*", { count: "exact", head: true }),
    // Total commandes
    supabase.from("orders").select("*", { count: "exact", head: true }),
    // Commandes en attente
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    // Commandes récentes
    supabase
      .from("orders")
      .select("*, buyer:profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
    // Listings en attente de validation
    supabase
      .from("listings")
      .select("*, book:books(*), seller:profiles(*)")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
    // Retraits en attente
    supabase
      .from("wallet_transactions")
      .select("*, profile:profiles(*)")
      .eq("type", "withdrawal")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    // Utilisateurs récents
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    {
      label: "Utilisateurs",
      value: usersCount || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      href: "/admin/users",
    },
    {
      label: "Vendeurs",
      value: sellersCount || 0,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      href: "/admin/users?role=seller",
    },
    {
      label: "Livres",
      value: booksCount || 0,
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      href: "/admin/products",
    },
    {
      label: "Commandes",
      value: ordersCount || 0,
      icon: ShoppingBag,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de la plateforme Pensezy Edition
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {((pendingOrdersCount && pendingOrdersCount > 0) ||
        (pendingListings && pendingListings.length > 0) ||
        (pendingWithdrawals && pendingWithdrawals.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pendingOrdersCount && pendingOrdersCount > 0 && (
            <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-900/10">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingOrdersCount} commande{pendingOrdersCount > 1 ? "s" : ""} en attente
                  </p>
                  <Link
                    href="/admin/orders?status=pending"
                    className="text-sm text-orange-600 hover:underline"
                  >
                    Voir les commandes
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {pendingListings && pendingListings.length > 0 && (
            <Card className="p-4 border-purple-200 bg-purple-50 dark:bg-purple-900/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingListings.length} produit{pendingListings.length > 1 ? "s" : ""} à
                    valider
                  </p>
                  <Link
                    href="/admin/products?status=pending"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    Voir les produits
                  </Link>
                </div>
              </div>
            </Card>
          )}

          {pendingWithdrawals && pendingWithdrawals.length > 0 && (
            <Card className="p-4 border-green-200 bg-green-50 dark:bg-green-900/10">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">
                    {pendingWithdrawals.length} retrait{pendingWithdrawals.length > 1 ? "s" : ""} en
                    attente
                  </p>
                  <Link
                    href="/admin/payments"
                    className="text-sm text-green-600 hover:underline"
                  >
                    Voir les retraits
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Commandes récentes</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {order.buyer?.full_name || order.buyer?.email || "Client"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {order.total_amount?.toLocaleString()} FCFA
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status === "paid"
                        ? "Payée"
                        : order.status === "pending"
                        ? "En attente"
                        : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucune commande récente</p>
          )}
        </Card>

        {/* Recent Users */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Nouveaux utilisateurs</h2>
            <Link
              href="/admin/users"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {user.full_name || "Sans nom"}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      user.role === "seller"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {user.role === "seller"
                      ? "Vendeur"
                      : user.role === "admin"
                      ? "Admin"
                      : "Lecteur"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun utilisateur récent</p>
          )}
        </Card>
      </div>

      {/* Pending Listings & Withdrawals */}
      <div className="space-y-8">
        <AdminListingList listings={pendingListings || []} />
        <AdminWithdrawalList withdrawals={pendingWithdrawals || []} />
      </div>
    </div>
  );
}
