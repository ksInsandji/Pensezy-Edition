import Link from "next/link";
import Image from "next/image";
import { Download, Box, Book, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  listing: {
    id: string;
    book_id?: string;
    price: number;
    type: "physical" | "digital" | "hybrid";
    stock?: number | null;
    book: {
      id: string;
      title: string;
      author: string;
      cover_url: string | null;
      description?: string | null;
    };
    hasMultipleVariants?: boolean;
  };
}

export function ProductCard({ listing }: ProductCardProps) {
  const { book } = listing;
  const isHybrid = listing.type === "hybrid" || listing.hasMultipleVariants;

  return (
    <div className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <Link
        href={`/marketplace/${listing.id}`}
        className="block aspect-[3/4] bg-muted relative overflow-hidden"
      >
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={`Couverture de ${book.title}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Book className="w-16 h-16 text-primary/30" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {isHybrid ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground shadow-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Hybride
            </span>
          ) : listing.type === "digital" ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-sm">
              <Download className="w-3 h-3 mr-1" />
              E-book
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-accent-foreground shadow-sm">
              <Box className="w-3 h-3 mr-1" />
              Physique
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/marketplace/${listing.id}`}>
          <h3 className="text-lg font-bold text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3">{book.author}</p>

        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="block text-xs text-muted-foreground mb-0.5">
              {isHybrid ? "À partir de" : "Prix"}
            </span>
            <span className="text-xl font-bold text-foreground">
              {listing.price.toLocaleString()}{" "}
              <span className="text-sm font-normal text-muted-foreground">FCFA</span>
            </span>
          </div>
          <Link href={`/marketplace/${listing.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-primary/20 hover:bg-primary/5 text-primary"
            >
              Voir
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
