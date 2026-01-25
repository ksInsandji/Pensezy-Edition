"use client";

import Link from "next/link";
import { BookOpen, ShoppingCart, Search, User } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-stone-800" />
          <span className="font-playfair text-xl font-bold text-stone-900">
            Pensezy Edition
          </span>
        </Link>

        {/* Navigation Desktop (Cachée sur mobile pour l'instant) */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600">
          <Link href="/catalog" className="hover:text-stone-900 transition-colors">
            Catalogue
          </Link>
          <Link href="/authors" className="hover:text-stone-900 transition-colors">
            Auteurs
          </Link>
          <Link href="/about" className="hover:text-stone-900 transition-colors">
            À propos
          </Link>
        </nav>

        {/* Actions Droite */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <Link href="/cart" className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors relative">
            <ShoppingCart className="h-5 w-5" />
            {/* Badge compteur panier (ex: 0) */}
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
              0
            </span>
          </Link>

          <Link href="/login" className="hidden md:flex items-center space-x-2 px-4 py-2 text-sm font-medium text-stone-600 border border-stone-300 rounded-md hover:bg-stone-50 transition-colors">
            <User className="h-4 w-4" />
            <span>Connexion</span>
          </Link>
        </div>
      </div>
    </header>
  );
}