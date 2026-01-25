import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Colonne Brand */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-white">
            <BookOpen className="h-6 w-6" />
            <span className="font-playfair text-xl font-bold">Pensezy Edition</span>
          </div>
          {/* CORRECTION ICI : remplacement des apostrophes */}
          <p className="text-sm leading-relaxed text-stone-400">
            La plateforme de référence pour l&apos;achat de livres physiques et numériques. Protégez vos droits d&apos;auteur, lisez en toute liberté.
          </p>
        </div>

        {/* Liens Rapides */}
        <div>
          <h3 className="text-white font-semibold mb-4">Explorer</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/catalog" className="hover:text-white transition-colors">Catalogue</Link></li>
            <li><Link href="/best-sellers" className="hover:text-white transition-colors">Meilleures ventes</Link></li>
            <li><Link href="/new-releases" className="hover:text-white transition-colors">Nouveautés</Link></li>
          </ul>
        </div>

        {/* Aide */}
        <div>
          <h3 className="text-white font-semibold mb-4">Aide</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/terms" className="hover:text-white transition-colors">Conditions générales</Link></li>
          </ul>
        </div>

        {/* Newsletter (Placeholder) */}
        <div>
          <h3 className="text-white font-semibold mb-4">Restez informé</h3>
          <div className="flex">
            <input 
              type="email" 
              placeholder="Votre email" 
              className="bg-stone-800 text-white px-3 py-2 text-sm rounded-l-md outline-none border border-stone-700 focus:border-stone-500 w-full"
            />
            <button className="bg-stone-700 hover:bg-stone-600 text-white px-4 py-2 text-sm rounded-r-md transition-colors">
              OK
            </button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-stone-800 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} Pensezy Edition. Tous droits réservés.
      </div>
    </footer>
  );
}