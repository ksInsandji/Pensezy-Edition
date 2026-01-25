import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  BookOpen, 
  Smartphone, 
  Star, 
  ShieldCheck,
  Zap,
  ArrowRight,
  BookMarked,
  TrendingUp,
  //Users
} from "lucide-react";

export default function HomePage() {
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
    { name: "Scolaire", icon: BookOpen, color: "from-blue-500 to-indigo-600", bgColor: "bg-blue-50", textColor: "text-blue-600" },
    { name: "Romans", icon: BookMarked, color: "from-purple-500 to-pink-600", bgColor: "bg-purple-50", textColor: "text-purple-600" },
    { name: "Tech", icon: Smartphone, color: "from-green-500 to-emerald-600", bgColor: "bg-green-50", textColor: "text-green-600" },
    { name: "Business", icon: TrendingUp, color: "from-orange-500 to-red-600", bgColor: "bg-orange-50", textColor: "text-orange-600" },
    { name: "Sciences", icon: ShieldCheck, color: "from-teal-500 to-cyan-600", bgColor: "bg-teal-50", textColor: "text-teal-600" },
    { name: "Loisirs", icon: Star, color: "from-yellow-500 to-orange-600", bgColor: "bg-yellow-50", textColor: "text-yellow-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === HERO SECTION MODERNISÉE === */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background avec Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 via-white to-blue-400/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-30"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge moderne */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 tracking-wide">Nouvelle génération de librairie</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>

            {/* Titre principal */}
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.9] mb-8">
              <span className="block">Pensezy</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 animate-gradient">
                Edition
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed font-light">
              La première librairie hybride du Cameroun
            </p>
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              Achetez vos livres physiques <span className="font-semibold text-gray-700">ET</span> accédez instantanément à la version numérique sécurisée
            </p>

            {/* Barre de recherche révolutionnaire */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 p-2">
                  <div className="flex items-center">
                    <Search className="ml-6 text-gray-400 w-6 h-6" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un livre, auteur, ISBN..." 
                      className="flex-1 px-4 py-4 text-lg text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                    />
                    <button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                      Explorer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/register" 
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Créer mon compte
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/catalog" 
                className="inline-flex items-center gap-3 px-8 py-4 text-gray-700 hover:text-gray-900 font-semibold transition-all group"
              >
                Découvrir le catalogue
                <div className="w-5 h-5 border-2 border-current rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-all">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === CATÉGORIES MODERNISÉES === */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explorer par catégorie</h2>
            <p className="text-xl text-gray-600">Trouvez exactement ce que vous cherchez</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, index) => (
              <button 
                key={index}
                className="group p-6 rounded-3xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 rounded-2xl ${cat.bgColor} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className={`font-bold text-sm ${cat.textColor} group-hover:text-gray-900 transition-colors`}>
                  {cat.name}
                </h3>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* === LIVRES PREMIUM === */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Sélection premium</h2>
              <p className="text-xl text-gray-600">Les livres les plus demandés cette semaine</p>
            </div>
            <Link 
              href="/catalog" 
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold group"
            >
              Voir tout le catalogue
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredBooks.map((book) => (
              <div key={book.id} className="group cursor-pointer">
                {/* Container de l'image avec effets avancés */}
                <div className="relative aspect-[3/4] mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-700 transform group-hover:-translate-y-3">
                  <Image 
                    src={book.cover} 
                    alt={book.title} 
                    fill
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4">
                    {book.type === 'digital' ? (
                      <div className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        Streaming
                      </div>
                    ) : (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Physique
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute inset-x-4 bottom-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <button className="w-full bg-white/95 backdrop-blur-sm text-gray-900 py-3 rounded-2xl font-bold shadow-lg hover:bg-white hover:shadow-xl transition-all">
                      Ajouter au panier
                    </button>
                  </div>
                </div>

                {/* Infos livre */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-orange-600 transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-500 font-medium">{book.author}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      {book.price.toLocaleString()}
                      <span className="text-lg font-normal text-gray-500 ml-1">F CFA</span>
                    </span>
                    {book.type === 'physique' && (
                      <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Stock
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === STATS & CONFIANCE === */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-black mb-2">50K+</div>
              <div className="text-gray-400">Livres disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">10K+</div>
              <div className="text-gray-400">Lecteurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">500+</div>
              <div className="text-gray-400">Auteurs partenaires</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black mb-2">99%</div>
              <div className="text-gray-400">Satisfaction client</div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Lecture 100% Sécurisée</h3>
              <p className="text-gray-400 leading-relaxed">
                Technologie de watermarking dynamique et streaming sécurisé pour protéger les droits d auteur
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Paiement Mobile</h3>
              <p className="text-gray-400 leading-relaxed">
                Orange Money, MTN MoMo, Visa/Mastercard. Solutions adaptées au marché camerounais
              </p>
            </div>

            <div className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4">Livraison Express</h3>
              <p className="text-gray-400 leading-relaxed">
                Livraison dans toutes les grandes villes du Cameroun. Accès numérique immédiat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA FINAL === */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Prêt à révolutionner <br />votre façon de lire ?
          </h2>
          <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
            Rejoignez des milliers de lecteurs qui ont adopté l expérience Pensezy Edition
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-3 px-12 py-5 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
