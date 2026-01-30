import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, BookOpen, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileEditForm } from "./profile-edit-form";
import { BecomeSellerButton } from "./become-seller-button";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Get Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // 2. Get Orders with Items
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items (
        id,
        price_at_purchase,
        quantity,
        listing:listings (
            id,
            type,
            book:books (title, author, cover_url)
        )
      )
    `)
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const isSeller = profile?.role === 'seller' || profile?.role === 'admin';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Paye
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            En attente
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Annule
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-gray-600 text-xs font-medium">
            {status}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card with Edit Form */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <ProfileEditForm
                userId={user.id}
                initialData={{
                  fullName: profile?.full_name || "",
                  email: user.email || "",
                  phone: profile?.phone || "",
                  address: profile?.address || "",
                  avatarUrl: profile?.avatar_url || null,
                }}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-3">
              <h3 className="font-semibold text-foreground mb-4">Actions rapides</h3>

              <Link href="/library" className="block">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BookOpen className="w-4 h-4" />
                  Ma Bibliotheque
                </Button>
              </Link>

              {isSeller ? (
                <Link href="/seller/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3">
                    <Package className="w-4 h-4" />
                    Espace Vendeur
                  </Button>
                </Link>
              ) : (
                <BecomeSellerButton userId={user.id} />
              )}
            </div>

            {/* Account Info */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-4">Informations du compte</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Role</span>
                  <span className="font-medium text-foreground capitalize">
                    {profile?.role === 'seller' ? 'Vendeur' :
                     profile?.role === 'admin' ? 'Administrateur' : 'Lecteur'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Membre depuis</span>
                  <span className="font-medium text-foreground">
                    {new Date(profile?.created_at || user.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                {isSeller && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solde vendeur</span>
                    <span className="font-medium text-foreground">
                      {(profile?.wallet_balance || 0).toLocaleString()} FCFA
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6" />
              Historique des commandes
            </h2>

            {!orders || orders.length === 0 ? (
              <div className="bg-card p-12 rounded-xl shadow-sm border border-border text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Aucune commande</h3>
                <p className="text-muted-foreground mt-2 mb-6">Vous n&apos;avez pas encore effectue d&apos;achat.</p>
                <Link href="/marketplace">
                  <Button>Parcourir le catalogue</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <div key={order.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    <div className="bg-muted/50 px-6 py-4 flex items-center justify-between border-b border-border">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Commande du {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="font-semibold text-foreground text-sm">N° {order.id.slice(0, 8)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">{order.total_amount.toLocaleString()} FCFA</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                    <div className="divide-y divide-border">
                      {order.items.map((item: any) => (
                        <div key={item.id} className="p-4 flex gap-4">
                          <div className="w-16 h-20 bg-muted rounded border border-border flex-shrink-0 overflow-hidden">
                            {item.listing?.book?.cover_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.listing.book.cover_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <BookOpen className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{item.listing?.book?.title || "Livre inconnu"}</h4>
                            <p className="text-sm text-muted-foreground">{item.listing?.book?.author}</p>
                            <div className="mt-1 flex items-center gap-3">
                              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground capitalize">
                                {item.listing?.type === 'digital' ? 'Numerique' : 'Physique'}
                              </span>
                              <span className="text-sm font-medium text-foreground">x{item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
