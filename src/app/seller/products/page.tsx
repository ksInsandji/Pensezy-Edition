import { createClient } from "@/lib/supabase/server";
import { PlusCircle, Book, Download, Box, Sparkles, Package, Eye } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProductActions } from "./product-actions";
import { Button } from "@/components/ui/button";

// Type pour un produit groupé par livre
interface GroupedProduct {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  hasDigital: boolean;
  hasPhysical: boolean;
  digitalPrice: number | null;
  physicalPrice: number | null;
  digitalStock: number;
  physicalStock: number;
  digitalListingId: string | null;
  physicalListingId: string | null;
  primaryListingId: string;
  createdAt: string;
}

export default async function SellerProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch listings with book details
  const { data: listings } = await supabase
    .from("listings")
    .select(
      `
      *,
      book:books(*)
    `
    )
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // Grouper les listings par livre
  const productsMap = new Map<string, GroupedProduct>();

  listings?.forEach((listing: any) => {
    const bookId = listing.book_id;

    if (!productsMap.has(bookId)) {
      productsMap.set(bookId, {
        bookId,
        title: listing.book.title,
        author: listing.book.author,
        coverUrl: listing.book.cover_url,
        hasDigital: listing.type === "digital",
        hasPhysical: listing.type === "physical",
        digitalPrice: listing.type === "digital" ? listing.price : null,
        physicalPrice: listing.type === "physical" ? listing.price : null,
        digitalStock: 0,
        physicalStock: listing.type === "physical" ? listing.stock : 0,
        digitalListingId: listing.type === "digital" ? listing.id : null,
        physicalListingId: listing.type === "physical" ? listing.id : null,
        primaryListingId: listing.id,
        createdAt: listing.created_at,
      });
    } else {
      const existing = productsMap.get(bookId)!;

      if (listing.type === "digital") {
        existing.hasDigital = true;
        existing.digitalPrice = listing.price;
        existing.digitalListingId = listing.id;
      } else {
        existing.hasPhysical = true;
        existing.physicalPrice = listing.price;
        existing.physicalStock = listing.stock;
        existing.physicalListingId = listing.id;
      }
    }
  });

  const products = Array.from(productsMap.values());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Produits</h1>
          <p className="text-muted-foreground">
            {products.length} livre{products.length > 1 ? "s" : ""} en vente
          </p>
        </div>
        <Link href="/seller/products/new">
          <Button className="bg-primary hover:bg-primary/90">
            <PlusCircle className="w-4 h-4 mr-2" />
            Ajouter un livre
          </Button>
        </Link>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const isHybrid = product.hasDigital && product.hasPhysical;
            const lowestPrice = Math.min(
              product.digitalPrice || Infinity,
              product.physicalPrice || Infinity
            );

            return (
              <div
                key={product.bookId}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                {/* Image */}
                <div className="aspect-[4/3] bg-muted relative">
                  {product.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.coverUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                      <Book className="w-12 h-12 text-primary/30" />
                    </div>
                  )}

                  {/* Badge type */}
                  <div className="absolute top-2 right-2">
                    {isHybrid ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Hybride
                      </span>
                    ) : product.hasDigital ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground">
                        <Download className="w-3 h-3 mr-1" />
                        Numérique
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground">
                        <Box className="w-3 h-3 mr-1" />
                        Physique
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{product.author}</p>

                  {/* Variantes info */}
                  <div className="space-y-2 mb-4">
                    {product.hasDigital && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Download className="w-4 h-4" />
                          Numérique
                        </span>
                        <span className="font-medium text-foreground">
                          {product.digitalPrice?.toLocaleString()} FCFA
                        </span>
                      </div>
                    )}
                    {product.hasPhysical && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Package className="w-4 h-4" />
                          Physique
                        </span>
                        <span className="font-medium text-foreground">
                          {product.physicalPrice?.toLocaleString()} FCFA
                          <span className="text-xs text-muted-foreground ml-1">
                            ({product.physicalStock} en stock)
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Link href={`/marketplace/${product.primaryListingId}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Voir
                      </Button>
                    </Link>
                    <ProductActions
                      id={product.primaryListingId}
                      bookId={product.bookId}
                      hasDigital={product.hasDigital}
                      hasPhysical={product.hasPhysical}
                      digitalListingId={product.digitalListingId}
                      physicalListingId={product.physicalListingId}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
          <Book className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucun produit</h3>
          <p className="text-muted-foreground mb-6">
            Commencez par ajouter votre premier livre.
          </p>
          <Link href="/seller/products/new">
            <Button className="bg-primary hover:bg-primary/90">
              <PlusCircle className="w-4 h-4 mr-2" />
              Mettre en vente
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
