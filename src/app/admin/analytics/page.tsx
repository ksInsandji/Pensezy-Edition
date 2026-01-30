import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserPlus,
  ShoppingBag,
  BookOpen,
  TrendingUp,
  Calendar,
  DollarSign,
  Activity,
  Eye,
  Store,
} from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const period = params.period?.toString() || "30"; // Default 30 jours

  // Calculer la date de debut selon la periode
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - parseInt(period));
  const startDateISO = startDate.toISOString();

  // ======= STATISTIQUES UTILISATEURS =======

  // Total utilisateurs
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // Nouveaux utilisateurs dans la periode
  const { count: newUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDateISO);

  // Utilisateurs par role
  const { count: totalReaders } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user");

  const { count: totalSellers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller");

  const { count: totalAdmins } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  // Nouveaux vendeurs dans la periode
  const { count: newSellers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller")
    .gte("created_at", startDateISO);

  // ======= STATISTIQUES PRODUITS =======

  // Total produits
  const { count: totalProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });

  // Produits actifs
  const { count: activeProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  // Nouveaux produits dans la periode
  const { count: newProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDateISO);

  // Produits par type
  const { count: digitalProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("type", "digital");

  const { count: physicalProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("type", "physical");

  // ======= STATISTIQUES COMMANDES =======

  // Total commandes
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  // Commandes dans la periode
  const { count: periodOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startDateISO);

  // Commandes payees dans la periode
  const { count: paidOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid")
    .gte("created_at", startDateISO);

  // Total revenus (commandes payees)
  const { data: revenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid");

  const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // Revenus dans la periode
  const { data: periodRevenueData } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .gte("created_at", startDateISO);

  const periodRevenue = periodRevenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

  // ======= STATISTIQUES LIVRES =======

  // Total livres
  const { count: totalBooks } = await supabase
    .from("books")
    .select("*", { count: "exact", head: true });

  // Livres dans la bibliotheque (achats)
  const { count: libraryAccess } = await supabase
    .from("user_books")
    .select("*", { count: "exact", head: true });

  // Acces bibliotheque dans la periode
  const { count: newLibraryAccess } = await supabase
    .from("user_books")
    .select("*", { count: "exact", head: true })
    .gte("purchased_at", startDateISO);

  // ======= TENDANCES RECENTES =======

  // Dernieres inscriptions
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  // Dernieres commandes
  const { data: recentOrders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      buyer:profiles!orders_buyer_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(5);

  const periods = [
    { value: "7", label: "7 jours" },
    { value: "30", label: "30 jours" },
    { value: "90", label: "90 jours" },
    { value: "365", label: "1 an" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Indicateurs de performance de la plateforme
          </p>
        </div>

        {/* Filtre de periode */}
        <div className="flex gap-2 flex-wrap">
          {periods.map((p) => (
            <a
              key={p.value}
              href={`/admin/analytics?period=${p.value}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalUsers || 0}</p>
              <p className="text-sm text-muted-foreground">Utilisateurs totaux</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{newUsers || 0}</p>
              <p className="text-sm text-muted-foreground">Nouveaux ({period}j)</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Revenus totaux (FCFA)</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {periodRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Revenus ({period}j)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Details par categorie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Utilisateurs */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Utilisateurs
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Lecteurs</span>
              <span className="font-semibold text-foreground">{totalReaders || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Vendeurs</span>
              <span className="font-semibold text-foreground">{totalSellers || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Administrateurs</span>
              <span className="font-semibold text-foreground">{totalAdmins || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Nouveaux vendeurs ({period}j)</span>
              <span className="font-semibold text-green-600">+{newSellers || 0}</span>
            </div>
          </div>
        </Card>

        {/* Produits */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Produits
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Total livres</span>
              <span className="font-semibold text-foreground">{totalBooks || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Listings actifs</span>
              <span className="font-semibold text-foreground">{activeProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Numeriques</span>
              <span className="font-semibold text-foreground">{digitalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Physiques</span>
              <span className="font-semibold text-foreground">{physicalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Nouveaux ({period}j)</span>
              <span className="font-semibold text-green-600">+{newProducts || 0}</span>
            </div>
          </div>
        </Card>

        {/* Commandes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Commandes
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Total commandes</span>
              <span className="font-semibold text-foreground">{totalOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Commandes ({period}j)</span>
              <span className="font-semibold text-foreground">{periodOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Payees ({period}j)</span>
              <span className="font-semibold text-green-600">{paidOrders || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Acces bibliotheque</span>
              <span className="font-semibold text-foreground">{libraryAccess || 0}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Nouveaux acces ({period}j)</span>
              <span className="font-semibold text-green-600">+{newLibraryAccess || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activites recentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inscriptions recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Inscriptions recentes
          </h3>
          {recentUsers && recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{user.full_name || "Sans nom"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "seller"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "admin"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {user.role === "seller" ? "Vendeur" : user.role === "admin" ? "Admin" : "Lecteur"}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune inscription recente</p>
          )}
        </Card>

        {/* Commandes recentes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Commandes recentes
          </h3>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-foreground">
                      {order.buyer?.full_name || "Client inconnu"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {order.total_amount?.toLocaleString()} FCFA
                    </p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {order.status === "paid" ? "Payee" : order.status === "pending" ? "En attente" : "Annulee"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Aucune commande recente</p>
          )}
        </Card>
      </div>

      {/* Note informative */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              A propos des analytics
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Ces statistiques sont basees sur les donnees de la base. Pour des analytics plus
              avances (visites, pages vues, sources de trafic), integrez Google Analytics ou
              un outil similaire.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
