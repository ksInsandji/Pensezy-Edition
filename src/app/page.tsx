import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  BookOpen, 
  Smartphone, 
  Star, 
  //ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function HomePage() {
  // NOUVELLES IMAGES : Simulations de couvertures de livres (cohérentes)
  const featuredBooks = [
    {
      id: 1,
      title: "L'Art de Coder en Python",
      author: "Jean Dupont",
      price: 15000,
      type: "physique", 
      cover: "https://images-na.ssl-images-amazon.com/images/I/51T5M6b3k3L._SX331_BO1,204,203,200_.jpg" 
    },
    {
      id: 2,
      title: "Économie Camerounaise",
      author: "Dr. Ambe",
      price: 5000,
      type: "digital",
      cover: "https://m.media-amazon.com/images/I/71d4-7sG6XL._AC_UF1000,1000_QL80_.jpg"
    },
    {
      id: 3,
      title: "Cuisine du Terroir",
      author: "Chef Marie",
      price: 12000,
      type: "physique",
      cover: "https://m.media-amazon.com/images/I/81W316d1KLL._AC_UF1000,1000_QL80_.jpg"
    },
    {
      id: 4,
      title: "Startup Guide 2024",
      author: "Tech Hub",
      price: 8000,
      type: "digital",
      cover: "https://m.media-amazon.com/images/I/819f-8g5KIL._AC_UF1000,1000_QL80_.jpg"
    }
  ];

  const categories = [
    { name: "Scolaire", icon: BookOpen },
    { name: "Romans", icon: BookOpen },
    { name: "Tech", icon: Smartphone },
    { name: "Business", icon: Zap },
    { name: "Sciences", icon: ShieldCheck },
    { name: "Loisirs", icon: Star },
  ];

  return (
    <div className="min-h-screen">
      {/* --- HERO SECTION (AMÉLIORÉE) --- */}
      {/* Ajout d'un dégradé de fond et d'un motif subtil */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-stone-50 pt-20 pb-32 px-4 overflow-hidden">
        {/* Motif décoratif */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px'}}></div>
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-white text-orange-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm border border-orange-100">
            🚀 Nouveau Concept
          </span>
          
          <h1 className="text-5xl md:text-7xl font-playfair font-bold text-stone-900 mb-8 leading-tight tracking-tight">
            La librairie hybride <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
              du Cameroun
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-stone-500 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Une expérience d&apos;achat unique : Recevez vos livres physiques ou lisez-les instantanément en streaming sécurisé.
          </p>

          {/* Barre de recherche ultra-propre */}
          <div className="relative max-w-2xl mx-auto mb-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center bg-white rounded-full shadow-xl overflow-hidden border border-stone-100">
              <Search className="ml-6 text-stone-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Titre, auteur ou ISBN..." 
                className="w-full px-4 py-4 text-stone-800 placeholder-stone-400 outline-none"
              />
              <button className="bg-stone-900 hover:bg-black text-white px-8 py-3 font-medium transition-colors text-sm">
                Rechercher
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register" 
              className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-0.5"
            >
              Commencer
            </Link>
            <Link 
              href="/catalog" 
              className="px-8 py-3.5 text-stone-600 hover:text-stone-900 font-medium transition-colors"
            >
              Explorer le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* --- CATÉGORIES (Cleaner) --- */}
      <section className="py-16 px-4 border-b border-stone-100">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <button 
                key={index}
                className="flex flex-col items-center justify-center group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-stone-500 group-hover:text-orange-600 group-hover:border-orange-200 group-hover:shadow-md transition-all duration-300 mb-3">
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900 transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* --- LIVRES (Grille Premium) --- */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-playfair font-bold text-stone-900">Sélection du moment</h2>
              <p className="text-stone-500 mt-2 font-light">Nos meilleures ventes cette semaine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
            {featuredBooks.map((book) => (
              <div key={book.id} className="group">
                {/* Image Container avec ombre portée au survol */}
                <div className="relative aspect-[2/3] mb-4 rounded-xl overflow-hidden bg-stone-100 shadow-lg group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
                  <Image 
                    src={book.cover} 
                    alt={book.title} 
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {book.type === 'digital' && (
                      <span className="bg-white/90 backdrop-blur text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                        Digital
                      </span>
                    )}
                  </div>

                  {/* Bouton panier rapide au survol */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button className="w-full bg-stone-900 text-white py-3 rounded-lg font-medium text-sm shadow-lg hover:bg-orange-600 transition-colors">
                      Ajouter au panier
                    </button>
                  </div>
                </div>

                {/* Info Produit */}
                <div>
                  <h3 className="font-bold text-lg text-stone-900 leading-snug mb-1 group-hover:text-orange-600 transition-colors">{book.title}</h3>
                  <p className="text-sm text-stone-400 mb-2">{book.author}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-stone-900">{book.price.toLocaleString()} F</span>
                    {book.type === 'physique' && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded">En stock</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION CONFIANCE (Plus aérée) --- */}
      <section className="py-20 bg-stone-50 border-t border-stone-200">
        <div className="container mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200">
            <div className="px-4">
              <ShieldCheck className="w-10 h-10 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-2">Lecture Sécurisée</h3>
              <p className="text-stone-500 text-sm">Protection anti-copie et filigrane dynamique pour les auteurs.</p>
            </div>
            <div className="px-4">
              <Smartphone className="w-10 h-10 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-2">100% Mobile</h3>
              <p className="text-stone-500 text-sm">Paiement via Orange Money, MTN MoMo et Cartes Visa/Mastercard.</p>
            </div>
            <div className="px-4">
              <Zap className="w-10 h-10 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-stone-900 mb-2">Livraison Rapide</h3>
              <p className="text-stone-500 text-sm">Livraison à domicile à Yaoundé, Douala et environs.</p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}