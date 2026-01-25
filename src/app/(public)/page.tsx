"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, BookOpen, Truck, Smartphone, Star, 
  ArrowRight, Heart, ShoppingBag, User 
} from "lucide-react";
import { motion } from "framer-motion";
import "../globals.css";

// --- DONNÉES FICTIVES (Pour la démo) ---
const TRENDING_BOOKS = [
  { id: 1, title: "L'Aventure Ambiguë", author: "Cheikh Hamidou Kane", price: "4 500 FCFA", cover: "/api/placeholder/150/220", type: "mixed" },
  { id: 2, title: "Petit Pays", author: "Gaël Faye", price: "6 000 FCFA", cover: "/api/placeholder/150/220", type: "physical" },
  { id: 3, title: "Algorithmes Avancés", author: "Dr. Kamga", price: "2 000 FCFA", cover: "/api/placeholder/150/220", type: "digital" },
  { id: 4, title: "Cahier d'un retour...", author: "Aimé Césaire", price: "3 500 FCFA", cover: "/api/placeholder/150/220", type: "mixed" },
];

const TESTIMONIALS = [
  { id: 1, name: "Amina S.", role: "Étudiante", text: "Pouvoir lire mes cours en streaming dans le bus et recevoir le livre papier pour réviser à la maison, c'est génial." },
  { id: 2, name: "Marc T.", role: "Auteur Indépendant", text: "Enfin une plateforme qui protège mes œuvres contre le piratage tout en me payant rapidement." },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<"physical" | "digital">("physical");

  return (
    <div className="flex flex-col min-h-screen bg-stone-50 font-sans selection:bg-orange-200">
      
      {/* --- 1. HERO SECTION (Vibrante & Culturelle) --- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-orange-900 text-white pb-24 pt-32 px-4 rounded-b-[3rem] shadow-2xl">
        {/* CORRECTION : Motif de fond en pur CSS (Plus d'image externe qui plante) */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-orange-500/20 border border-orange-400 text-orange-200 text-sm font-medium mb-4">
              🚀 La Révolution du Livre en Afrique
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight font-serif">
              Lisez sans frontière,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200">
                Achetez sans limite.
              </span>
            </h1>
          </motion.div>

          {/* Barre de Recherche Centrale */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-2xl mx-auto relative group"
          >
            <div className="absolute inset-0 bg-orange-500 blur-xl opacity-20 group-hover:opacity-40 transition duration-500 rounded-full"></div>
            <div className="relative flex items-center bg-white p-2 rounded-full shadow-xl">
              <Search className="h-6 w-6 text-gray-400 ml-4" />
              <Input 
                placeholder="Rechercher un titre, un auteur, un ISBN..." 
                className="border-none shadow-none focus-visible:ring-0 text-lg text-gray-800 placeholder:text-gray-400 h-12"
              />
              <Button className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 text-lg">
                Explorer
              </Button>
            </div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-indigo-100 text-lg md:text-xl max-w-2xl mx-auto"
          >
            Physique ou Numérique ? Ne choisissez plus. <br className="hidden md:block"/>
            Pensezy Edition unifie votre bibliothèque.
          </motion.p>
        </div>
      </section>

      {/* --- 2. TRENDING BOOKS (Carrousel) --- */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 font-serif">🔥 Tendances du moment</h2>
            <p className="text-gray-500 mt-2">Les livres qui font bouger le Cameroun cette semaine.</p>
          </div>
          <Link href="/browse" className="text-orange-600 font-medium hover:underline flex items-center">
            Tout voir <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {/* Grille responsive de livres */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRENDING_BOOKS.map((book, index) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100"
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-gray-200 mb-3">
                 {/* Placeholder coloré pour remplacer l'image */}
                 <div className="absolute inset-0 bg-gradient-to-br from-stone-300 to-stone-400 flex items-center justify-center text-stone-500">
                    <BookOpen className="h-10 w-10 opacity-50" />
                 </div>
                 {/* Badge Type */}
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full">
                    {book.type === 'physical' ? 'Physique' : book.type === 'digital' ? 'PDF' : 'Hybride'}
                 </div>
              </div>
              <h3 className="font-bold text-gray-900 line-clamp-1">{book.title}</h3>
              <p className="text-sm text-gray-500">{book.author}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-orange-600">{book.price}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-orange-50 hover:text-orange-600">
                  <Heart className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- 3. HYBRID EXPERIENCE (Interactive) --- */}
      <section className="py-20 bg-indigo-950 text-white relative overflow-hidden">
         {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] opacity-20"></div>

        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold font-serif leading-tight">
              L&apos;Expérience Hybride <br/> <span className="text-orange-400">Pensezy</span>
            </h2>
            <p className="text-indigo-200 text-lg">
              Nous avons réuni le meilleur des deux mondes. Basculez entre le confort du papier et l&apos;accessibilité du numérique.
            </p>
            
            <div className="flex gap-4 p-1 bg-white/10 rounded-full w-fit backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab("physical")}
                className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${activeTab === 'physical' ? 'bg-orange-500 text-white shadow-lg' : 'text-indigo-200 hover:text-white'}`}
              >
                📦 Version Papier
              </button>
              <button 
                onClick={() => setActiveTab("digital")}
                className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${activeTab === 'digital' ? 'bg-blue-500 text-white shadow-lg' : 'text-indigo-200 hover:text-white'}`}
              >
                📱 Version Numérique
              </button>
            </div>

            <div className="pt-4">
               {activeTab === 'physical' ? (
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4">
                    <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400"><Truck className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-xl">Livraison à Domicile</h4>
                      <p className="text-indigo-200">Recevez votre livre partout au Cameroun sous 48h. Paiement à la livraison disponible.</p>
                    </div>
                 </motion.div>
               ) : (
                 <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Smartphone className="h-6 w-6" /></div>
                    <div>
                      <h4 className="font-bold text-xl">Lecture Streaming Sécurisée</h4>
                      <p className="text-indigo-200">Accédez à votre livre immédiatement après achat. Mode nuit, marque-page et anti-piratage inclus.</p>
                    </div>
                 </motion.div>
               )}
            </div>
          </div>

          {/* Visuel Abstrait Interactif */}
          <div className="relative h-[400px] w-full bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md flex items-center justify-center overflow-hidden">
             <motion.div
               key={activeTab}
               initial={{ scale: 0.8, opacity: 0, rotate: activeTab === 'physical' ? -10 : 10 }}
               animate={{ scale: 1, opacity: 1, rotate: 0 }}
               transition={{ type: "spring", stiffness: 100 }}
               className="relative"
             >
                {/* Icône Géante */}
                {activeTab === 'physical' ? (
                  <BookOpen className="h-48 w-48 text-orange-200 drop-shadow-2xl" strokeWidth={1} />
                ) : (
                  <Smartphone className="h-48 w-48 text-blue-200 drop-shadow-2xl" strokeWidth={1} />
                )}
             </motion.div>
          </div>
        </div>
      </section>

      {/* --- 4. SOCIAL PROOF --- */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 font-serif mb-12">Ils font confiance à Pensezy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 text-left">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 text-lg italic mb-6">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER SIMPLIFIÉ --- */}
      <footer className="bg-white border-t py-12 px-4 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500">© 2026 Pensezy Edition. Yaoundé, Cameroun.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-500 hover:text-orange-600">Conditions</Link>
            <Link href="#" className="text-gray-500 hover:text-orange-600">Aide</Link>
          </div>
        </div>
      </footer>

      {/* --- MOBILE APP NAVIGATION BAR (Fixed Bottom) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center text-orange-600">
          <div className="bg-orange-50 p-1 rounded-full"><BookOpen className="h-6 w-6" /></div>
          <span className="text-[10px] font-medium mt-1">Accueil</span>
        </Link>
        <Link href="/browse" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <Search className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Explorer</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-gray-400 hover:text-gray-600 relative">
          <ShoppingBag className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">0</span>
          <span className="text-[10px] font-medium mt-1">Panier</span>
        </Link>
        <Link href="/dashboard" className="flex flex-col items-center text-gray-400 hover:text-gray-600">
          <User className="h-6 w-6" />
          <span className="text-[10px] font-medium mt-1">Compte</span>
        </Link>
      </div>

    </div>
  );
}