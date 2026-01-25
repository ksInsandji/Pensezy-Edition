import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Badge } from "lucide-react"; // Import incorrect, Badge usually ui component

export default async function BookPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // 1. Fetch listing details joined with book and seller profile
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      books (
        *,
        created_by
      ),
      profiles!seller_id (
        full_name,
        avatar_url
      )
    `)
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const book = listing.books;
  const seller = listing.profiles; // Supabase returns object because of single relation? Check types.
  // Actually relationships: listings -> seller_id (profiles). Yes.

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="md:flex">
          {/* Cover Image Section */}
          <div className="md:w-1/3 bg-gray-50 p-8 flex items-center justify-center">
            <div className="relative w-48 h-72 shadow-xl rounded-lg overflow-hidden">
               {book?.cover_url ? (
                 <img
                   src={book.cover_url}
                   alt={book.title}
                   className="object-cover w-full h-full"
                 />
               ) : (
                 <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                   No Cover
                 </div>
               )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:w-2/3 flex flex-col">
            <div className="mb-4">
               <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 ${listing.type === 'digital' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {listing.type === 'digital' ? 'Format Numérique (Ebook)' : 'Format Papier'}
               </span>
               <h1 className="text-3xl font-bold text-gray-900 mb-2">{book?.title}</h1>
               <p className="text-xl text-gray-600">par {book?.author}</p>
            </div>

            <div className="prose text-gray-500 mb-8 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p>{book?.description || "Aucune description disponible."}</p>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3 mb-8 p-4 bg-gray-50 rounded-lg max-w-md">
              <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">
                {seller?.full_name?.charAt(0).toUpperCase() || 'V'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Vendu par {seller?.full_name || 'Vendeur inconnu'}</p>
                <p className="text-xs text-gray-500">Vendeur certifié Pensezy</p>
              </div>
            </div>

            {/* Purchase Action */}
            <div className="flex items-center justify-between border-t pt-6 mt-auto">
              <div>
                <p className="text-sm text-gray-500">Prix</p>
                <p className="text-3xl font-bold text-blue-900">{listing.price} FCFA</p>
              </div>

              <AddToCartButton
                item={{
                  listingId: listing.id,
                  bookId: book?.id!,
                  title: book?.title!,
                  author: book?.author!,
                  coverUrl: book?.cover_url!,
                  price: listing.price,
                  type: listing.type,
                  maxStock: listing.stock
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
