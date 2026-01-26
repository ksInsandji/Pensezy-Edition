import Link from "next/link";
import { Download, Box, Book, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  listing: {
    id: string;
    price: number;
    type: "physical" | "digital";
    stock: number;
    book: {
      id: string;
      title: string;
      author: string;
      cover_url: string | null;
    };
  };
}

export function ProductCard({ listing }: ProductCardProps) {
  const { book } = listing;

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/marketplace/${listing.id}`} className="block h-64 bg-gray-100 relative overflow-hidden">
        {book.cover_url ? (
           // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
            <Book className="w-16 h-16 opacity-50" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
            {listing.type === "digital" ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 shadow-sm">
                  <Download className="w-3 h-3 mr-1" />
                  E-book
                </span>
            ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 shadow-sm">
                  <Box className="w-3 h-3 mr-1" />
                  Physique
                </span>
            )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/marketplace/${listing.id}`}>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-900 transition-colors">
            {book.title}
            </h3>
        </Link>
        <p className="text-sm text-gray-500 mb-3">{book.author}</p>

        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="block text-xs text-gray-400 mb-0.5">Prix</span>
            <span className="text-xl font-bold text-gray-900">
                {listing.price.toLocaleString()} <span className="text-sm font-normal text-gray-500">FCFA</span>
            </span>
          </div>

          <Link href={`/marketplace/${listing.id}`}>
            <Button size="sm" variant="outline" className="border-blue-200 hover:bg-blue-50 text-blue-900">
                Voir
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
