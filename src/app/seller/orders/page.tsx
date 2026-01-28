import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, Calendar, User } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SellerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch orders where seller owns the item
  // Note: Using !inner on listings filters the order_items
  const { data: items } = await supabase
    .from("order_items")
    .select(`
      id,
      quantity,
      price_at_purchase,
      created_at,
      order:orders (
        created_at,
        buyer:profiles (full_name, email)
      ),
      listing:listings!inner (
        id,
        seller_id,
        book:books (title)
      )
    `)
    .eq("listing.seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Commandes Reçues</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-3">Produit</th>
                        <th className="px-6 py-3">Acheteur</th>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Quantité</th>
                        <th className="px-6 py-3 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">
                                {item.listing.book.title}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>{item.order?.buyer?.full_name || item.order?.buyer?.email || 'Anonyme'}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(item.created_at).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-blue-900">
                                {(item.price_at_purchase * item.quantity).toLocaleString()} FCFA
                            </td>
                        </tr>
                    ))}
                    {!items?.length && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                Aucune commande reçue pour le moment.
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
