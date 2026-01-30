import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { OrderActions } from "./order-actions";
import { CartActions } from "./cart-actions";
import { ShoppingBag, Clock, CheckCircle, ShoppingCart, Package, User } from "lucide-react";

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
  const view = params.view?.toString() || "orders"; // "orders" ou "carts"

  // Fetch orders
  let ordersQuery = supabase
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

  if (statusFilter && view === "orders") {
    ordersQuery = ordersQuery.eq("status", statusFilter);
  }

  const { data: orders } = await ordersQuery;

  // Fetch carts with items
  const { data: carts } = await supabase
    .from("carts")
    .select(`
      id,
      user_id,
      updated_at,
      user:profiles!carts_user_id_fkey(id, full_name, email),
      cart_items(
        id,
        quantity,
        listing:listings(
          id,
          price,
          type,
          book:books(id, title, author, cover_url)
        )
      )
    `)
    .order("updated_at", { ascending: false });

  // Filter carts that have items
  const nonEmptyCarts = carts?.filter((cart: any) => cart.cart_items?.length > 0) || [];

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
    { label: "Commandes", value: totalOrders || 0, icon: ShoppingBag, color: "text-blue-600" },
    { label: "En attente", value: pendingOrders || 0, icon: Clock, color: "text-yellow-600" },
    { label: "Payees", value: paidOrders || 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Paniers actifs", value: nonEmptyCarts.length, icon: ShoppingCart, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des commandes</h1>
        <p className="text-muted-foreground">
          Validez les commandes et gerez les paniers utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* View Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <a
          href="/admin/orders?view=orders"
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            view === "orders"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Commandes
        </a>
        <a
          href="/admin/orders?view=carts"
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            view === "carts"
              ? "bg-purple-600 text-white"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          Paniers ({nonEmptyCarts.length})
        </a>
      </div>

      {view === "orders" ? (
        <>
          {/* Status Filters for Orders */}
          <div className="flex gap-2 flex-wrap">
            <a
              href="/admin/orders?view=orders"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !statusFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Toutes
            </a>
            <a
              href="/admin/orders?view=orders&status=pending"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "pending"
                  ? "bg-yellow-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              En attente
            </a>
            <a
              href="/admin/orders?view=orders&status=paid"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "paid"
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Payees
            </a>
            <a
              href="/admin/orders?view=orders&status=cancelled"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === "cancelled"
                  ? "bg-red-500 text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Annulees
            </a>
          </div>

          {/* Orders List */}
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order: any) => (
                <Card key={order.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
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
                            ? "Payee"
                            : order.status === "pending"
                            ? "En attente"
                            : "Annulee"}
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
                                {item.listing?.type === "digital" ? "Numerique" : "Physique"} x{" "}
                                {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-medium">
                              {item.price_at_purchase?.toLocaleString()} FCFA
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <p className="text-2xl font-bold text-foreground mb-4">
                        {order.total_amount?.toLocaleString()} FCFA
                      </p>
                      <OrderActions
                        orderId={order.id}
                        buyerId={order.buyer_id}
                        currentStatus={order.status}
                      />
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
        </>
      ) : (
        <>
          {/* Carts View */}
          {nonEmptyCarts.length > 0 ? (
            <div className="space-y-4">
              {nonEmptyCarts.map((cart: any) => {
                const totalAmount = cart.cart_items.reduce((sum: number, item: any) => {
                  return sum + (item.listing?.price || 0) * item.quantity;
                }, 0);

                return (
                  <Card key={cart.id} className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Panier actif
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {cart.cart_items.length} article(s)
                          </span>
                        </div>

                        <div className="mb-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {cart.user?.full_name || "Utilisateur inconnu"}
                            </p>
                            <p className="text-sm text-muted-foreground">{cart.user?.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Derniere mise a jour: {new Date(cart.updated_at).toLocaleString("fr-FR")}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {cart.cart_items.map((item: any) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                            >
                              {item.listing?.book?.cover_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={item.listing.book.cover_url}
                                  alt=""
                                  className="w-10 h-14 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-14 bg-muted rounded flex items-center justify-center">
                                  <Package className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {item.listing?.book?.title || "Produit inconnu"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.listing?.type === "digital" ? "Numerique" : "Physique"} x{" "}
                                  {item.quantity}
                                </p>
                              </div>
                              <span className="text-sm font-medium">
                                {(item.listing?.price * item.quantity)?.toLocaleString()} FCFA
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-2xl font-bold text-foreground mb-4">
                          {totalAmount.toLocaleString()} FCFA
                        </p>
                        <CartActions
                          cartId={cart.id}
                          userId={cart.user_id}
                          itemCount={cart.cart_items.length}
                        />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun panier actif</h3>
              <p className="text-muted-foreground">
                Aucun utilisateur n&apos;a d&apos;articles dans son panier
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
