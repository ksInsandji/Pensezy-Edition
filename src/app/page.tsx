import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Zap, Smartphone, BookOpen } from "lucide-react";
import Link from "next/link";

// Importation des types pour éviter le "any"
// Remplacez '@/types/supabase' par le chemin exact vers votre fichier
import { Database } from "@/types/database.types";

type ListingWithBook = Database['public']['Tables']['listings']['Row'] & {
  book: Database['public']['Tables']['books']['Row']
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Fetch Latest Products
  const { data: latestListings } = await supabase
    .from("listings")
    .select("*, book:books!inner(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white py-20 lg:py-32 overflow-hidden">
         {/* Abstract Background */}
         <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
         </div>

         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight mb-6">
                La littérature camerounaise <br className="hidden md:block" /> physique et numérique.
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {/* Correction Apostrophe ligne 37 */}
                Accédez à des milliers d&apos;ouvrages. Commandez vos livres papiers ou lisez instantanément nos e-books sécurisés.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/marketplace">
                    <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 font-semibold h-12 px-8">
                        Parcourir le catalogue
                    </Button>
                </Link>
                <Link href="/seller/dashboard">
                    <Button size="lg" variant="outline" className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white h-12 px-8">
                        Vendre mes livres
                    </Button>
                </Link>
            </div>
         </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Paiement Mobile</h3>
                    <p className="text-gray-500">Payez simplement avec Orange Money et MTN Mobile Money.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 bg-purple-100 text-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Lecture Instantanée</h3>
                    <p className="text-gray-500">Accédez à vos e-books immédiatement après achat sur notre liseuse sécurisée.</p>
                </div>
                <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 text-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Protection Auteurs</h3>
                    <p className="text-gray-500">Vos œuvres sont protégées contre le piratage grâce à notre technologie de streaming.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 bg-gray-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 font-display">Dernières Nouveautés</h2>
                <Link href="/marketplace" className="text-blue-900 font-medium hover:underline flex items-center">
                    Tout voir <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
            </div>

            {!latestListings || latestListings.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">Le catalogue se remplit petit à petit...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Correction Typage ligne 99 : remplacement de any par le type ListingWithBook */}
                    {latestListings.map((listing: ListingWithBook) => (
                        <ProductCard key={listing.id} listing={listing} />
                    ))}
                </div>
            )}
         </div>
      </section>

      {/* CTA Seller */}
      <section className="py-20 bg-stone-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h2 className="text-3xl font-bold mb-4 font-display">Vous êtes auteur ou éditeur ?</h2>
            <p className="text-gray-400 mb-8 text-lg">
                Rejoignez Pensezy Edition et distribuez vos œuvres au Cameroun et dans le monde entier, en toute sécurité.
            </p>
            <Link href="/seller/dashboard">
                <Button size="lg" className="bg-white text-stone-900 hover:bg-gray-200">
                    Commencer à vendre
                </Button>
            </Link>
        </div>
      </section>

    </div>
  );
}