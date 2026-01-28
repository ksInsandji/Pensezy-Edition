import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Download, Box, Book, Info, ShieldCheck, AlertCircle, Smartphone, Package } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductVariantSelector } from "@/components/products/product-variant-selector";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
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
  const { id } = await params;
  const supabase = await createClient();

  // Récupérer le listing demandé
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

  // Récupérer TOUTES les variantes pour ce livre (du même vendeur)
  const { data: allListings } = await supabase
    .from("listings")
    .select("*")
    .eq("book_id", book.id)
    .eq("seller_id", listing.seller_id);

  const variants = allListings || [listing];
  const digitalVariant = variants.find((v) => v.type === "digital");
  const physicalVariant = variants.find((v) => v.type === "physical");
  const hasMultipleVariants = variants.length > 1;

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="min-h-screen bg-background">
      <div className="container-wrapper py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm text-muted-foreground">
          <Link href="/marketplace" className="hover:text-primary transition-colors">
            Catalogue
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px]">
            {book.title}
          </span>
        </nav>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Product Image */}
          <div className="relative bg-muted rounded-2xl overflow-hidden aspect-[3/4] lg:aspect-square border border-border">
            {book.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Book className="w-32 h-32 text-muted-foreground/20" />
              </div>
            )}

            {/* Badges pour les variantes disponibles */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {hasMultipleVariants ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/90 text-accent-foreground shadow-md backdrop-blur-sm">
                  Hybride
                </span>
              ) : listing.type === "digital" ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/90 text-primary-foreground shadow-md backdrop-blur-sm">
                  <Download className="w-4 h-4 mr-1.5" />
                  Numérique
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/90 text-accent-foreground shadow-md backdrop-blur-sm">
                  <Box className="w-4 h-4 mr-1.5" />
                  Physique
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-8 lg:mt-0 flex flex-col">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-2">
              {book.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              par <span className="font-semibold text-foreground">{book.author}</span>
            </p>

            {/* Message si c'est le propriétaire */}
            {isOwner && (
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">C&apos;est votre produit</p>
                  <p className="text-sm text-muted-foreground">
                    Vous ne pouvez pas acheter vos propres livres.{" "}
                    <Link href="/seller/products" className="text-primary hover:underline">
                      Gérer mes produits
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Variantes disponibles */}
            {hasMultipleVariants ? (
              <div className="border border-border rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Formats disponibles
                </h3>
                <ProductVariantSelector
                  bookId={book.id}
                  bookTitle={book.title}
                  bookAuthor={book.author}
                  coverUrl={book.cover_url}
                  digitalVariant={
                    digitalVariant
                      ? {
                          id: digitalVariant.id,
                          price: digitalVariant.price,
                          allowDownload: digitalVariant.allow_download,
                        }
                      : null
                  }
                  physicalVariant={
                    physicalVariant
                      ? {
                          id: physicalVariant.id,
                          price: physicalVariant.price,
                          stock: physicalVariant.stock,
                        }
                      : null
                  }
                  isOwner={isOwner}
                />
              </div>
            ) : (
              <div className="border-t border-b border-border py-6 mb-6">
                <p className="text-4xl font-bold text-foreground mb-2">
                  {listing.price.toLocaleString()}{" "}
                  <span className="text-xl font-normal text-muted-foreground">FCFA</span>
                </p>

                {listing.type === "physical" && (
                  <p
                    className={`text-sm font-medium ${
                      listing.stock > 0 ? "text-green-600" : "text-destructive"
                    } flex items-center mt-2`}
                  >
                    {listing.stock > 0 ? (
                      <>
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        En stock ({listing.stock} exemplaires)
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 bg-destructive rounded-full mr-2"></span>
                        Rupture de stock
                      </>
                    )}
                  </p>
                )}

                {listing.type === "digital" && (
                  <p className="text-sm text-primary font-medium flex items-center mt-2 bg-primary/10 p-2 rounded-lg inline-block">
                    <Download className="w-4 h-4 mr-2" />
                    Lecture immédiate après achat
                  </p>
                )}

                {/* Bouton d'ajout au panier pour variante unique */}
                {!isOwner && (
                  <div className="mt-6">
                    <ProductVariantSelector
                      bookId={book.id}
                      bookTitle={book.title}
                      bookAuthor={book.author}
                      coverUrl={book.cover_url}
                      digitalVariant={
                        listing.type === "digital"
                          ? {
                              id: listing.id,
                              price: listing.price,
                              allowDownload: listing.allow_download,
                            }
                          : null
                      }
                      physicalVariant={
                        listing.type === "physical"
                          ? {
                              id: listing.id,
                              price: listing.price,
                              stock: listing.stock,
                            }
                          : null
                      }
                      isOwner={isOwner}
                      defaultSelected={listing.type}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Description et infos */}
            <div className="space-y-6">
              <div className="prose prose-sm text-muted-foreground">
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Résumé
                </h3>
                <p className="text-foreground/80">
                  {book.description || "Aucune description disponible pour cet ouvrage."}
                </p>
              </div>

              {book.isbn && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">ISBN :</span> {book.isbn}
                </div>
              )}

              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Vendu par{" "}
                <span className="font-medium text-foreground">
                  {seller?.full_name || "Vendeur Certifié"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
