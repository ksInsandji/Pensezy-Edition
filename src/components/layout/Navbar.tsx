"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, User as UserIcon, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const cartCount = useCartStore((state) => state.getCount());

  useEffect(() => {
    // On regroupe l'initialisation pour éviter les rendus en cascade
    const initializeNavbar = async () => {
      // 1. Hydratation du store Zustand (système externe)
      await useCartStore.persist.rehydrate();
      
      // 2. Récupération de l'utilisateur actuel
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 3. Signalement du montage terminé pour l'UI
      setMounted(true);
    };

    initializeNavbar();

    // Écoute des changements de session (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation Desktop */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl text-primary">Pensezy Edition</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/marketplace" className="text-foreground/90 hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-primary text-sm font-medium transition-colors">
                Catalogue
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium transition-colors">
                À propos
              </Link>
            </div>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link href="/seller/dashboard">
                  <Button variant="outline" size="sm">Espace Vendeur</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserIcon className="h-4 w-4" />
                    Mon Compte
                  </Button>
                </Link>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">Se connecter</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-900">S&apos;inscrire</Button>
                </Link>
              </>
            )}
            
            <Link href="/cart">
              <Button variant="outline" size="sm" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Bouton Menu Mobile */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/marketplace" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              Catalogue
            </Link>
            <Link href="/about" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
              À propos
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}