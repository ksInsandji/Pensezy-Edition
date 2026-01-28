import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { OrderActions } from "./order-actions";
import { ShoppingBag, Clock, CheckCircle, XCircle, Package } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const statusFilter = params.status?.toString();

  let query = supabase
    .from("orders")
    .select(
      `
      *,
      buyer:profiles!orders_buyer_id_fkey(id, full_name, email),
      order_items(
        *,
        listing:listings(
          *,
          book:books(title, author, cover_url)
        )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: orders, error } = await query;

  // Stats
  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: paidOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid");

  const stats = [
    { label: "Total", value: totalOrders || 0, icon: ShoppingBag, color: "text-blue-600" },
    { label: "En attente", value: pendingOrders || 0, icon: Clock, color: "text-yellow-600" },
    { label: "Payées", value: paidOrders || 0, icon: CheckCircle, color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des commandes</h1>
        <p className="text-muted-foreground">
          Validez les commandes et gérez les paiements
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <a
          href="/admin/orders"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !statusFilter
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Toutes
        </a>
        <a
          href="/admin/orders?status=pending"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "pending"
              ? "bg-yellow-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          En attente
        </a>
        <a
          href="/admin/orders?status=paid"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "paid"
              ? "bg-green-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Payées
        </a>
        <a
          href="/admin/orders?status=cancelled"
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === "cancelled"
              ? "bg-red-500 text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Annulées
        </a>
      </div>

      {/* Orders List */}
      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status === "paid"
                        ? "Payée"
                        : order.status === "pending"
                        ? "En attente"
                        : "Annulée"}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="font-medium text-foreground">
                      {order.buyer?.full_name || "Client inconnu"}
                    </p>
                    <p className="text-sm text-muted-foreground">{order.buyer?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("fr-FR")}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.order_items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                      >
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.listing?.book?.title || "Produit inconnu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.listing?.type === "digital" ? "Numérique" : "Physique"} x{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {item.unit_price?.toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Actions */}
                <div className="lg:text-right">
                  <p className="text-2xl font-bold text-foreground mb-4">
                    {order.total_amount?.toLocaleString()} FCFA
                  </p>

                  {order.status === "pending" && (
                    <OrderActions orderId={order.id} buyerId={order.buyer_id} />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucune commande</h3>
          <p className="text-muted-foreground">
            {statusFilter
              ? `Aucune commande avec le statut "${statusFilter}"`
              : "Aucune commande pour le moment"}
          </p>
        </Card>
      )}
    </div>
  );
}
