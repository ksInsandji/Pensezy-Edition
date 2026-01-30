import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const PAGE_SIZE = 12;

// Type pour un livre avec ses variantes
interface BookWithVariants {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  sellerId: string;
  sellerName: string | null;
  hasDigital: boolean;
  hasPhysical: boolean;
  lowestPrice: number;
  digitalListingId: string | null;
  physicalListingId: string | null;
  primaryListingId: string;
  createdAt: string;
}

export default async function MarketplacePage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const query = searchParams.q?.toString();
  const type = searchParams.type?.toString();
  const page = Number(searchParams.page) || 1;

  // Recuperer uniquement les listings actifs (approuves)
  let dbQuery = supabase
    .from("listings")
    .select(
      `
      *,
      book:books!inner(*),
      seller:profiles(full_name)
    `
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  // Filtrer par type si spécifié
  if (type === "physical") {
    dbQuery = dbQuery.eq("type", "physical");
  } else if (type === "digital") {
    dbQuery = dbQuery.eq("type", "digital");
  }

  // Filtrer par recherche
  if (query) {
    dbQuery = dbQuery.or(`book.title.ilike.%${query}%,book.author.ilike.%${query}%`);
  }

  const { data: listings, error } = await dbQuery;

  if (error) {
    console.error("Error fetching marketplace listings:", error);
  }

  // Grouper les listings par livre + vendeur pour éviter les doublons
  const booksMap = new Map<string, BookWithVariants>();

  listings?.forEach((listing: any) => {
    const key = `${listing.book_id}-${listing.seller_id}`;

    if (!booksMap.has(key)) {
      booksMap.set(key, {
        bookId: listing.book_id,
        title: listing.book.title,
        author: listing.book.author,
        coverUrl: listing.book.cover_url,
        description: listing.book.description,
        sellerId: listing.seller_id,
        sellerName: listing.seller?.full_name,
        hasDigital: listing.type === "digital",
        hasPhysical: listing.type === "physical",
        lowestPrice: listing.price,
        digitalListingId: listing.type === "digital" ? listing.id : null,
        physicalListingId: listing.type === "physical" ? listing.id : null,
        primaryListingId: listing.id,
        createdAt: listing.created_at,
      });
    } else {
      const existing = booksMap.get(key)!;

      // Mettre à jour les flags de variantes
      if (listing.type === "digital") {
        existing.hasDigital = true;
        existing.digitalListingId = listing.id;
      } else {
        existing.hasPhysical = true;
        existing.physicalListingId = listing.id;
      }

      // Garder le prix le plus bas
      if (listing.price < existing.lowestPrice) {
        existing.lowestPrice = listing.price;
        existing.primaryListingId = listing.id;
      }
    }
  });

  // Convertir en tableau et paginer
  const allBooks = Array.from(booksMap.values());
  const totalCount = allBooks.length;
  const from = (page - 1) * PAGE_SIZE;
  const paginatedBooks = allBooks.slice(from, from + PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-wrapper py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Le Catalogue</h1>
          <p className="text-muted-foreground">
            Découvrez nos ouvrages physiques et numériques.
          </p>
        </div>

        <ProductFilters />

        {paginatedBooks.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-medium text-foreground">Aucun résultat</h2>
            <p className="text-muted-foreground mt-2">
              Essayez de modifier vos critères de recherche.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedBooks.map((book) => (
                <ProductCard
                  key={`${book.bookId}-${book.sellerId}`}
                  listing={{
                    id: book.primaryListingId,
                    book_id: book.bookId,
                    price: book.lowestPrice,
                    type: book.hasDigital && book.hasPhysical ? "hybrid" : book.hasDigital ? "digital" : "physical",
                    book: {
                      id: book.bookId,
                      title: book.title,
                      author: book.author,
                      cover_url: book.coverUrl,
                      description: book.description,
                    },
                    hasMultipleVariants: book.hasDigital && book.hasPhysical,
                  }}
                />
              ))}
            </div>

            <PaginationControls totalCount={totalCount} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
    </div>
  );
}
