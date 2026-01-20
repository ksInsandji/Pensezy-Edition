import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Book, Truck, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-8">
            La culture à portée de main,<br className="hidden sm:block" />
            <span className="text-blue-200">Physique & Numérique</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100 mb-10">
            Pensezy Edition réinvente l'accès au livre en Afrique. Commandez vos ouvrages préférés livrés chez vous, ou lisez-les instantanément en streaming sécurisé.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/browse">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                Explorer le catalogue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-800">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Livraison Physique</h3>
              <p className="text-gray-600">
                Commandez vos livres papier et recevez-les rapidement grâce à notre réseau logistique optimisé.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Book className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Lecture Streaming</h3>
              <p className="text-gray-600">
                Accédez instantanément à vos livres numériques via notre liseuse sécurisée, accessible partout.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl text-center">
              <div className="w-12 h-12 bg-green-100 text-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Anti-Piratage</h3>
              <p className="text-gray-600">
                Technologie avancée protégeant les droits d'auteur tout en garantissant une expérience fluide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Vous êtes auteur ou éditeur ?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Rejoignez notre plateforme pour vendre vos ouvrages en toute sécurité et toucher un public plus large.
          </p>
          <Link href="/register">
             <Button size="lg" className="bg-blue-900">Devenir Vendeur</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
