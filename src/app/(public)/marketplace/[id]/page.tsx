import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { Download, Box, Book, Info, ShieldCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("*, book:books(*)")
    .eq("id", id)
    .single();

  if (!listing) return { title: "Produit non trouvé" };

  return {
    title: `${listing.book.title} | Pensezy Edition`,
    description: `Achetez ${listing.book.title} de ${listing.book.author} sur Pensezy Edition.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      book:books(*),
      seller:profiles(*)
    `)
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const { book, seller } = listing;

  // Check ownership if user is logged in
  let isOwned = false;
  if (user) {
    const { data: ownership } = await supabase
        .from("library_access")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .single();
    if (ownership) isOwned = true;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
        {/* Product Image */}
        <div className="product-image-container relative bg-gray-100 rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-square shadow-sm border border-gray-100">
          {book.cover_url ? (
             // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Book className="w-32 h-32 opacity-20" />
            </div>
          )}

          <div className="absolute top-4 left-4">
             {listing.type === "digital" ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 shadow-md backdrop-blur-sm bg-opacity-90">
                  <Download className="w-4 h-4 mr-1.5" />
                  Format Numérique
                </span>
            ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 shadow-md backdrop-blur-sm bg-opacity-90">
                  <Box className="w-4 h-4 mr-1.5" />
                  Livre Physique
                </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-10 lg:mt-0 flex flex-col justify-center">
          <nav className="flex mb-6 text-sm text-gray-500">
            <Link href="/marketplace" className="hover:text-blue-900 transition-colors">Catalogue</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{book.title}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-display mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-500 mb-6">
            par <span className="font-semibold text-gray-900">{book.author}</span>
          </p>

          <div className="border-t border-b border-gray-100 py-6 mb-8">
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {listing.price.toLocaleString()} <span className="text-xl font-normal text-gray-500">FCFA</span>
            </p>

            {listing.type === "physical" && (
                <p className={`text-sm font-medium ${listing.stock > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-2`}>
                    {listing.stock > 0 ? (
                        <>
                            <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                            En stock ({listing.stock} exemplaires)
                        </>
                    ) : (
                        <>
                            <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                            Rupture de stock
                        </>
                    )}
                </p>
            )}

             {listing.type === "digital" && (
                <p className="text-sm text-purple-700 font-medium flex items-center mt-2 bg-purple-50 p-2 rounded-lg inline-block">
                   <Download className="w-4 h-4 mr-2" />
                   Lecture immédiate après achat
                </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="prose prose-sm text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Résumé
                </h3>
                <p>{book.description || "Aucune description disponible pour cet ouvrage."}</p>
            </div>

            {book.isbn && (
                <div className="text-sm text-gray-500">
                    <span className="font-medium text-gray-900">ISBN :</span> {book.isbn}
                </div>
            )}

            <div className="text-sm text-gray-500 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-green-600" />
                 Vendu par <span className="font-medium text-gray-900 underline decoration-dotted">{seller?.full_name || "Vendeur Certifié"}</span>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-100">
            {isOwned && listing.type === 'digital' ? (
                <Link href={`/read/${listing.id}`}>
                    <Button size="lg" className="w-full md:w-auto min-w-[200px] bg-green-600 hover:bg-green-700 gap-2">
                        <BookOpen className="h-5 w-5" />
                        Accéder à la lecture
                    </Button>
                </Link>
            ) : (
                <AddToCartButton
                    listingId={listing.id}
                    bookId={book.id}
                    title={book.title}
                    author={book.author}
                    price={listing.price}
                    type={listing.type}
                    coverUrl={book.cover_url}
                    maxStock={listing.stock}
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
