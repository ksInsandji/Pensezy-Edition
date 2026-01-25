import { createClient } from "@/lib/supabase/server";
import { PlusCircle, Book, Download, Box } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductActions } from "./product-actions";

export default async function SellerProductsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch listings with book details
  const { data: listings, error } = await supabase
    .from("listings")
    .select(`
      *,
      book:books(*)
    `)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter un livre
        </Link>
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing: any) => (
            <div
              key={listing.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-100 relative">
                {listing.book?.cover_url ? (
                   // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.book.cover_url}
                    alt={listing.book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Book className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {listing.type === "digital" ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Download className="w-3 h-3 mr-1" />
                      Numérique
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Box className="w-3 h-3 mr-1" />
                      Physique
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {listing.book?.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{listing.book?.author}</p>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xl font-bold text-gray-900">
                    {listing.price.toLocaleString()} FCFA
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 mr-2">
                        {listing.type === 'physical' && `Stock: ${listing.stock}`}
                    </div>
                    <ProductActions id={listing.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
          <Book className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Aucun produit</h3>
          <p className="text-gray-500 mb-6">Commencez par ajouter votre premier livre.</p>
          <Link
            href="/seller/products/new"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Mettre en vente
          </Link>
        </div>
      )}
    </div>
  );
}
