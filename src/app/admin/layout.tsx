import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BookOpen,
  Settings,
  CreditCard,
  BarChart3,
  Shield,
  Home,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Commandes" },
  { href: "/admin/products", icon: BookOpen, label: "Produits" },
  { href: "/admin/payments", icon: CreditCard, label: "Paiements" },
  { href: "/admin/settings", icon: Settings, label: "Parametres" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Vérifier le rôle admin - d'abord dans user_metadata puis dans profiles
  let isAdmin = user.user_metadata?.role === "admin";

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  if (!isAdmin) {
    redirect("/marketplace");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border z-50 hidden md:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/Logo_Pensezy_Edition.png"
                alt="Pensezy Edition"
                width={40}
                height={40}
              />
              <div>
                <span className="font-bold text-foreground">Pensezy</span>
                <span className="block text-xs text-accent font-medium">Administration</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}

            <div className="border-t border-border my-4" />

            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Retour au site</span>
            </Link>
          </nav>

          {/* Admin Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email?.split("@")[0]}
                </p>
                <p className="text-xs text-primary font-medium">Administrateur</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Image
            src="/Logo_Pensezy_Edition.png"
            alt="Pensezy Edition"
            width={32}
            height={32}
          />
          <span className="font-bold text-foreground">Admin</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="p-4 md:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
