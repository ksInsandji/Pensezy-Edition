import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Package, BookOpen, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-900 font-bold text-3xl">
                    {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <h1 className="text-xl font-bold text-gray-900">{profile?.full_name || "Utilisateur"}</h1>
                <p className="text-sm text-gray-500 mb-6">{user.email}</p>

                <div className="space-y-3">
                    <Link href="/library" className="block">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <BookOpen className="w-4 h-4" />
                            Ma Bibliothèque
                        </Button>
                    </Link>

                    <Link href="/seller/dashboard" className="block">
                        <Button variant="outline" className="w-full justify-start gap-3">
                            <Package className="w-4 h-4" />
                            Espace Vendeur
                        </Button>
                    </Link>
                </div>
            </div>
        </div>

        {/* Orders History */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 font-display flex items-center gap-3">
                <Clock className="w-6 h-6" />
                Historique des commandes
            </h2>

            {!orders || orders.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Aucune commande</h3>
                    <p className="text-gray-500 mt-2 mb-6">Vous n'avez pas encore effectué d'achat.</p>
                    <Link href="/marketplace">
                        <Button>Parcourir le catalogue</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                                <div>
                                    <p className="text-sm text-gray-500">Commande du {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p className="font-semibold text-gray-900 text-sm">N° {order.id.slice(0, 8)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{order.total_amount.toLocaleString()} FCFA</p>
                                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-1">
                                        <CheckCircle className="w-3 h-3" />
                                        Payé
                                    </div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item: any) => (
                                    <div key={item.id} className="p-4 flex gap-4">
                                        <div className="w-16 h-20 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                                             {item.listing?.book?.cover_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={item.listing.book.cover_url} className="w-full h-full object-cover" alt="" />
                                             ) : (
                                                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                     <BookOpen className="w-6 h-6" />
                                                 </div>
                                             )}
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{item.listing?.book?.title || "Livre inconnu"}</h4>
                                            <p className="text-sm text-gray-500">{item.listing?.book?.author}</p>
                                            <div className="mt-1 flex items-center gap-3">
                                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">
                                                    {item.listing?.type === 'digital' ? 'Numérique' : 'Physique'}
                                                </span>
                                                <span className="text-sm font-medium">x{item.quantity}</span>
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
  );
}
