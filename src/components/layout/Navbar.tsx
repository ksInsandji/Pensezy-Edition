"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BookOpen, ShoppingCart, User, Menu, X } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Logo & Desktop Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-900" />
              <span className="font-bold text-xl text-blue-900">Pensezy Edition</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/browse" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 text-sm font-medium">
                Catalogue
              </Link>
              <Link href="/about" className="text-gray-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium">
                À propos
              </Link>
            </div>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {(user.user_metadata?.role === 'seller' || user.user_metadata?.role === 'admin') && (
                  <Link href="/seller/dashboard">
                     <Button variant="outline" size="sm">Espace Vendeur</Button>
                  </Link>
                )}
                 <Link href="/profile">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
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
                  <Button size="sm" className="bg-blue-900">S'inscrire</Button>
                </Link>
              </>
            )}
            <Link href="/cart">
                <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {/* Badge placeholder */}
                </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/browse" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Catalogue
            </Link>
            <Link href="/about" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              À propos
            </Link>
          </div>
          <div className="pt-4 pb-4 border-t border-gray-200">
             {user ? (
              <div className="space-y-2 px-4">
                 {(user.user_metadata?.role === 'seller' || user.user_metadata?.role === 'admin') && (
                  <Link href="/seller/dashboard" className="block w-full">
                     <Button variant="outline" className="w-full justify-start">Espace Vendeur</Button>
                  </Link>
                )}
                 <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="space-y-2 px-4">
                <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full">Se connecter</Button>
                </Link>
                <Link href="/register" className="block w-full">
                  <Button className="w-full bg-blue-900">S'inscrire</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
