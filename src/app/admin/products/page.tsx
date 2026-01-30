import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { BookOpen, CheckCircle, Clock, XCircle, Search, Eye } from "lucide-react";
import Link from "next/link";
import { ProductAdminActions } from "./product-admin-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const statusFilter = params.status?.toString();
  const searchQuery = params.search?.toString();

  let query = supabase
    .from("listings")
    .select(
      `
      *,
      book:books(id, title, author, cover_url, category),
      seller:profiles(id, full_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  if (searchQuery) {
    // Note: searching through joined tables is limited, use basic filter
    query = query.or(`book.title.ilike.%${searchQuery}%`);
  }

  const { data: listings, error } = await query;

  // Stats
  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true });
  const { count: activeListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");
  const { count: pendingListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  const { count: rejectedListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "rejected");

  const stats = [
    { label: "Total", value: totalListings || 0, icon: BookOpen, color: "text-blue-600" },
    { label: "Actifs", value: activeListings || 0, icon: CheckCircle, color: "text-green-600" },
    { label: "En attente", value: pendingListings || 0, icon: Clock, color: "text-yellow-600" },
    { label: "Rejetes", value: rejectedListings || 0, icon: XCircle, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des produits</h1>
        <p className="text-muted-foreground">
          Validez et gerez les produits des vendeurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Rechercher un livre..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/products"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !statusFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Tous
          </a>
          <a
            href="/admin/products?status=pending"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-yellow-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            En attente
          </a>
          <a
            href="/admin/products?status=active"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "active"
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Actifs
          </a>
          <a
            href="/admin/products?status=rejected"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === "rejected"
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Rejetes
          </a>
        </div>
      </div>

      {/* Products List */}
      {listings && listings.length > 0 ? (
        <div className="space-y-4">
          {listings.map((listing: any) => (
            <Card key={listing.id} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Cover */}
                <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {listing.book?.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.book.cover_url}
                      alt={listing.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {listing.book?.title || "Titre inconnu"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        par {listing.book?.author || "Auteur inconnu"}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === "active"
                          ? "bg-green-100 text-green-700"
                          : listing.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {listing.status === "active"
                        ? "Actif"
                        : listing.status === "pending"
                        ? "En attente"
                        : "Rejete"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Type: <span className="text-foreground">{listing.type === "digital" ? "Numerique" : "Physique"}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Prix: <span className="text-foreground font-medium">{listing.price?.toLocaleString()} FCFA</span>
                    </span>
                    {listing.type === "physical" && (
                      <span className="text-muted-foreground">
                        Stock: <span className="text-foreground">{listing.stock}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">
                    Vendeur: {listing.seller?.full_name || listing.seller?.email || "Inconnu"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link href={`/marketplace/${listing.id}`}>
                    <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
                      <Eye className="w-5 h-5" />
                    </button>
                  </Link>
                  <ProductAdminActions
                    listingId={listing.id}
                    currentStatus={listing.status}
                    currentPrice={listing.price || 0}
                    currentStock={listing.stock || 0}
                    productType={listing.type}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucun produit</h3>
          <p className="text-muted-foreground">
            {statusFilter
              ? `Aucun produit avec le statut "${statusFilter}"`
              : "Aucun produit pour le moment"}
          </p>
        </Card>
      )}
    </div>
  );
}
