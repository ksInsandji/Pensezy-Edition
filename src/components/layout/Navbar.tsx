"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  BookOpen,
  LogOut,
  LayoutDashboard,
  Library,
} from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { ThemeToggle } from "@/components/theme-toggle";
import { User } from "@supabase/supabase-js";
import { ModeToggle } from "@/components/ui/mode-toggle";

type UserRole = "user" | "seller" | "admin" | "moderator";

export function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const supabase = createClient();
  const cartCount = useCartStore((state) => state.getCount());

  useEffect(() => {
    const initializeNavbar = async () => {
      await useCartStore.persist.rehydrate();

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      // Récupérer le rôle de l'utilisateur
      if (currentUser) {
        // D'abord vérifier les métadonnées utilisateur (définies à l'inscription)
        const metadataRole = currentUser.user_metadata?.role as UserRole | undefined;

        if (metadataRole) {
          setUserRole(metadataRole);
        } else {
          // Sinon, chercher dans la table profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", currentUser.id)
            .single();

          setUserRole((profile?.role as UserRole) || "user");
        }
      }

      setMounted(true);
    };

    initializeNavbar();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        // Récupérer le rôle quand l'état change
        const metadataRole = session.user.user_metadata?.role as UserRole | undefined;
        if (metadataRole) {
          setUserRole(metadataRole);
        } else {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          setUserRole((profile?.role as UserRole) || "user");
        }
      } else {
        setUserRole(null);
      }

      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        router.refresh();
      }
    });

    // Handle scroll for glass effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    router.push("/");
    router.refresh();
  };

  // Déterminer si l'utilisateur peut accéder à l'espace vendeur
  const canAccessSeller = userRole === "seller" || userRole === "admin";
  const canAccessAdmin = userRole === "admin";

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-background border-b border-transparent"
      }`}
    >
      <div className="container-wrapper">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <Image
                src="/Logo_Pensezy_Edition.png"
                alt="Pensezy Edition"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="font-bold text-xl text-foreground hidden sm:block">
                Pensezy <span className="text-primary">Edition</span>
              </span>
            </Link>

            <div className="hidden md:ml-8 md:flex md:space-x-1">
              <Link
                href="/marketplace"
                className="text-foreground/70 hover:text-foreground hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Catalogue
              </Link>
              {/* Bibliotheque visible uniquement pour les non-admins */}
              {user && !canAccessAdmin && (
                <Link
                  href="/library"
                  className="text-foreground/70 hover:text-foreground hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Ma Bibliotheque
                </Link>
              )}
            </div>
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {user ? (
              <>
                {/* Menu Admin - affiche en premier et de maniere prominente pour les admins */}
                {canAccessAdmin && (
                  <Link href="/admin">
                    <Button
                      size="sm"
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Administration
                    </Button>
                  </Link>
                )}

                {/* Menu Vendeur - seulement pour les vendeurs (pas les admins) */}
                {userRole === "seller" && (
                  <Link href="/seller/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-foreground/70 hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Espace Vendeur
                    </Button>
                  </Link>
                )}

                {/* Mon Compte - cache pour les admins qui ont deja acces via admin panel */}
                {!canAccessAdmin && (
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-foreground/70 hover:text-foreground"
                    >
                      <UserIcon className="h-4 w-4" />
                      Mon Compte
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-foreground/70 hover:text-destructive hover:bg-destructive/10"
                  title="Deconnexion"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    S&apos;inscrire
                  </Button>
                </Link>
              </>
            )}

            <Link href="/cart">
              <Button
                variant="outline"
                size="icon"
                className="relative h-9 w-9 rounded-full border-border"
              >
                <ShoppingCart className="h-4 w-4" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="h-9 w-9 rounded-full"
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
          <div className="container-wrapper py-4 space-y-2">
            <Link
              href="/marketplace"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Catalogue</span>
            </Link>

            {/* Bibliotheque visible uniquement pour les non-admins */}
            {user && !canAccessAdmin && (
              <Link
                href="/library"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Library className="h-5 w-5 text-primary" />
                <span className="font-medium">Ma Bibliotheque</span>
              </Link>
            )}

            <div className="border-t border-border my-2" />

            {user ? (
              <>
                {/* Menu Admin Mobile - affiche en premier pour les admins */}
                {canAccessAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                    <span className="font-medium text-primary">Administration</span>
                  </Link>
                )}

                {/* Menu Vendeur Mobile - seulement pour les vendeurs (pas les admins) */}
                {userRole === "seller" && (
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Espace Vendeur</span>
                  </Link>
                )}

                {/* Mon Compte - cache pour les admins */}
                {!canAccessAdmin && (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Mon Compte</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Deconnexion</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link href="/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Se connecter
                  </Button>
                </Link>
                <Link href="/register" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    S&apos;inscrire
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
