import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { BookOpen } from "lucide-react";

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

const PAGE_SIZE = 12;

export default async function MarketplacePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient();

  const query = searchParams.q?.toString();
  const type = searchParams.type?.toString();
  const page = Number(searchParams.page) || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Construction de la requête
  let dbQuery = supabase
    .from("listings")
    .select(`
      *,
      book:books!inner(*)
    `, { count: 'exact' })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (type === "physical") {
    dbQuery = dbQuery.eq("type", "physical");
  } else if (type === "digital") {
    dbQuery = dbQuery.eq("type", "digital");
  }

  if (query) {
    dbQuery = dbQuery.ilike("books.title", `%${query}%`);
  }

  const { data: listings, error, count } = await dbQuery;

  if (error) {
    console.error("Error fetching marketplace listings:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Le Catalogue</h1>
        <p className="text-gray-500">Découvrez nos ouvrages physiques et numériques.</p>
      </div>

      <ProductFilters />

      {!listings || listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900">Aucun résultat</h2>
          <p className="text-gray-500 mt-2">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing: any) => (
                    <ProductCard key={listing.id} listing={listing} />
                ))}
            </div>

            <PaginationControls totalCount={count || 0} pageSize={PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
