import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LibraryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Récupérer les livres numériques achetés via library_access
  // On joint listings -> books
  const { data: libraryItems, error } = await supabase
    .from("library_access")
    .select(`
      id,
      listing:listings (
        id,
        type,
        book:books (
          id,
          title,
          author,
          cover_url
        )
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    console.error("Library fetch error:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-display">Ma Bibliothèque</h1>
      </div>

      {!libraryItems || libraryItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900">Votre bibliothèque est vide</h2>
          <p className="text-gray-500 mt-2 mb-6">Vous n'avez pas encore acheté de livres numériques.</p>
          <Link href="/marketplace?type=digital">
            <Button className="bg-blue-900 hover:bg-blue-800">
              Découvrir les E-books
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {libraryItems.map((item: any) => {
             const book = item.listing.book;
             return (
              <div key={item.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
                {/* Cover */}
                <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                   {book.cover_url ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Book className="w-12 h-12 opacity-30" />
                    </div>
                  )}

                  {/* Overlay Action */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Link href={`/read/${item.listing.id}`}>
                        <Button className="rounded-full bg-white text-gray-900 hover:bg-gray-100 font-medium">
                            Lire maintenant
                        </Button>
                    </Link>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                    <h3 className="font-semibold text-gray-900 truncate" title={book.title}>{book.title}</h3>
                    <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
