import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
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
  LogOut,
  Bell,
  Search
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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Vérification simplifiée du rôle admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && user.user_metadata?.role !== "admin") {
    redirect("/marketplace");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar Fixe (N'est plus perturbée par la Navbar principale) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/Logo_Pensezy_Edition.png" alt="Logo" width={35} height={35} />
            <div>
              <span className="font-bold text-slate-900 block leading-none">Pensezy</span>
              <span className="text-[10px] text-orange-500 font-bold uppercase">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:text-blue-600" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-1">
          {/* Nouveau bouton de déconnexion réelle */}
          <LogoutButton />
        </div>
      </aside>

      {/* Contenu Principal avec son propre Header */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen h-screen overflow-y-auto">
        {/* Nouveau Header spécifique à l'Admin (Remplace visuellement la Navbar globale) */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-full w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Rechercher un utilisateur, un livre..." className="bg-transparent text-sm outline-none w-full" />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</span>
              <span className="text-[10px] text-green-600 font-medium">Session Admin Active</span>
            </div>
          </div>
        </header>

        {/* Zone de rendu des pages (children) */}
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}