import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function BrowsePage() {
  const supabase = await createClient();

  // Fetch listings with book details
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      *,
      books (
        title,
        author,
        cover_url,
        category
      )
    `)
    .eq("stock", 1) // Simple filter for availability (can be improved)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Catalogue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings && listings.length > 0 ? (
          listings.map((item) => (
            <Card key={item.id} className="overflow-hidden flex flex-col h-full hoverable">
              <div className="aspect-[2/3] bg-gray-200 relative">
                 {item.books?.cover_url ? (
                   <img src={item.books.cover_url} alt={item.books.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400">
                     No Cover
                   </div>
                 )}
                 <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${item.type === 'digital' ? 'bg-purple-500 text-white' : 'bg-green-500 text-white'}`}>
                    {item.type === 'digital' ? 'Ebook' : 'Papier'}
                 </span>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 line-clamp-1">{item.books?.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{item.books?.author}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-blue-900">{item.price} FCFA</span>
                  <Link href={`/book/${item.id}`}>
                    <Button size="sm" variant="outline">Voir</Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Aucun livre disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
