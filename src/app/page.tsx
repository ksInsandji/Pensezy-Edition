import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ShieldCheck, Zap, Smartphone, BookOpen, Search, TrendingUp, Users, Award, Package, Headphones, CheckCircle, Star } from "lucide-react";
import Link from "next/link";
import "./globals.css";
import { Database } from "@/types/database.types";


type ListingWithBook = Database['public']['Tables']['listings']['Row'] & {
  book: Database['public']['Tables']['books']['Row'];
};

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  const { data: rawListings } = await supabase
    .from("listings")
    .select("*, book:books!inner(*)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(8);

  const latestListings = (rawListings as unknown as ListingWithBook[]) || [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero Section - Avec vraie mise en valeur */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24 lg:py-32 overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-wrapper relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge avec animation */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/20 shadow-lg">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-sm font-medium">Plateforme N°1 au Cameroun</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Vos auteurs camerounais préférés,{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                à portée de clic
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
              Découvrez des milliers d&apos;œuvres. Livres physiques livrés chez vous ou lecture instantanée 100% sécurisée.
            </p>
            
            {/* Barre de recherche avec effet */}
            <div className="max-w-2xl mx-auto mb-12">
              <form action="/marketplace" method="GET" className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
                  <Search className="w-6 h-6 text-gray-400 ml-2" />
                  <Input
                    type="search"
                    name="q"
                    placeholder="Rechercher un livre, un auteur..."
                    className="flex-1 border-0 focus-visible:ring-0 text-gray-900 placeholder:text-gray-400 h-14 text-lg bg-transparent"
                  />
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white h-14 px-8 rounded-xl font-semibold shadow-lg"
                  >
                    Rechercher
                  </Button>
                </div>
              </form>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-700 hover:bg-blue-50 font-bold h-14 px-10 rounded-xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105 text-lg"
                >
                  Parcourir le catalogue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/seller/dashboard">
                <Button 
                  size="lg" 
                  className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 h-14 px-10 rounded-xl font-bold text-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Espace vendeur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Avec couleurs */}
      <section className="bg-white border-y border-gray-200 py-12 shadow-sm">
        <div className="container-wrapper">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-sm font-medium text-gray-600">Auteurs actifs</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">10K+</div>
              <div className="text-sm font-medium text-gray-600">Livres vendus</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">98%</div>
              <div className="text-sm font-medium text-gray-600">Satisfaction</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform">
              <div className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-sm font-medium text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Avec vraies couleurs */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="container-wrapper">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5">
              Pourquoi Pensezy Edition
            </h2>
            <p className="text-xl text-gray-600 font-light">
              Une plateforme pensée pour les auteurs et lecteurs camerounais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 - Vert */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-emerald-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Paiement Mobile</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Orange Money, MTN Mobile Money et cartes bancaires intégrés pour votre confort.
                </p>
              </div>
            </div>

            {/* Feature 2 - Violet */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-violet-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Lecture Instantanée</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Achetez et lisez en 30 secondes avec notre technologie sécurisée nouvelle génération.
                </p>
              </div>
            </div>

            {/* Feature 3 - Bleu */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Protection Auteurs</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Filigrane personnalisé et streaming anti-piratage pour protéger vos œuvres.
                </p>
              </div>
            </div>

            {/* Feature 4 - Orange */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Livraison Rapide</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  48h pour Yaoundé et Douala avec suivi en temps réel de votre colis.
                </p>
              </div>
            </div>

            {/* Feature 5 - Rose */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">90% pour vous</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Seulement 10% de commission. Les auteurs gardent le maximum de leurs revenus.
                </p>
              </div>
            </div>

            {/* Feature 6 - Cyan */}
            <div className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-cyan-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-sky-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-gray-900">Support Dédié</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Assistance WhatsApp 7j/7 en français par une équipe camerounaise dédiée.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-24 bg-white">
        <div className="container-wrapper">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                Nouveautés
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                Dernières Sorties
              </h2>
              <p className="text-xl text-gray-600">
                Les livres les plus récents de nos auteurs
              </p>
            </div>
            
            <Link 
              href="/marketplace" 
              className="hidden lg:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors group text-lg"
            >
              Voir tout
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          {latestListings.length === 0 ? (
            <div className="text-center py-24 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl border-2 border-dashed border-gray-300">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Le catalogue se remplit...</h3>
              <p className="text-gray-600 text-lg">Revenez bientôt pour découvrir nos premières pépites littéraires !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {latestListings.slice(0, 8).map((listing) => (
                <ProductCard 
                  key={listing.id} 
                  listing={listing} 
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/*<div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>*/}
        
        <div className="container-wrapper relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5">
              Comment ça marche
            </h2>
            <p className="text-xl text-blue-100 font-light">
              Simple, rapide et sécurisé en 3 étapes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-bold text-2xl mb-4">Parcourez</h3>
              <p className="text-blue-100 leading-relaxed text-lg">
                Explorez notre catalogue et trouvez votre prochain coup de cœur littéraire
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-bold text-2xl mb-4">Achetez</h3>
              <p className="text-blue-100 leading-relaxed text-lg">
                Payez en toute sécurité avec Mobile Money ou carte bancaire
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="font-bold text-2xl mb-4">Profitez</h3>
              <p className="text-blue-100 leading-relaxed text-lg">
                Lisez instantanément ou recevez votre livre physique chez vous
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="container-wrapper max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
              FAQ
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Questions Fréquentes
            </h2>
          </div>
          
          <div className="space-y-6">
            {[
              {
                q: "Les livres numériques sont-ils protégés ?",
                a: "Oui, chaque page porte un filigrane personnalisé avec votre email. Nous utilisons une technologie de streaming qui empêche le téléchargement et le partage illégal."
              },
              {
                q: "Quels sont les délais de livraison ?",
                a: "48h pour Yaoundé et Douala, 3-5 jours pour les autres villes du Cameroun. Vous recevez un SMS de suivi dès l'expédition."
              },
              {
                q: "Comment devenir vendeur ?",
                a: "Cliquez sur 'Espace vendeur', créez votre compte et soumettez vos livres. Notre équipe valide vos publications sous 24h. Commission de seulement 10%."
              },
              {
                q: "Puis-je lire sur mobile et tablette ?",
                a: "Absolument ! Notre liseuse fonctionne sur tous les navigateurs modernes. Pas besoin d'installer d'application, tout se passe en ligne."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-xl mb-3 text-gray-900">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Vendeur */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container-wrapper relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full mb-8 border border-white/20">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">Rejoignez 500+ auteurs qui nous font confiance</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
            Vous êtes auteur<br className="hidden sm:block" /> ou éditeur ?
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Publiez vos œuvres et touchez des milliers de lecteurs camerounais. 
            Gestion simplifiée, paiements rapides, support dédié.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/seller/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-12 h-16 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                Commencer à vendre
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 h-16 px-12 text-lg font-bold rounded-2xl"
            >
              En savoir plus
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Commission 10%
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Paiements rapides
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Support dédié 24/7
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
