import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
import { AdminSearchBar } from "./AdminSearchBar";
import { AdminNotifications } from "./AdminNotifications";
import { MobileNav, MobileBottomNav } from "./MobileNav";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ShoppingCart,
  BookOpen,
  Settings,
  CreditCard,
  BarChart3,
  Home,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/users", icon: Users, label: "Utilisateurs" },
  { href: "/admin/carts", icon: ShoppingCart, label: "Paniers" },
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

  // Verification simplifiee du role admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin" && user.user_metadata?.role !== "admin") {
    redirect("/marketplace");
  }

  // Recuperer les stats pour les notifications
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: pendingProducts } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  // Nouveaux utilisateurs aujourd'hui
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: newUsersToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Desktop Sidebar - Hidden on mobile */}
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
              {item.href === "/admin/orders" && pendingOrders ? (
                <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              ) : null}
              {item.href === "/admin/products" && pendingProducts ? (
                <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingProducts}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Retour au site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen h-screen overflow-y-auto pb-16 md:pb-0">
        {/* Header */}
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-3 md:px-8 flex items-center justify-between shrink-0">
          {/* Mobile Menu Button */}
          <MobileNav pendingOrders={pendingOrders || 0} pendingProducts={pendingProducts || 0} />

          {/* Mobile Logo - Center */}
          <div className="md:hidden flex items-center gap-2">
            <Image src="/Logo_Pensezy_Edition.png" alt="Logo" width={28} height={28} />
            <span className="font-bold text-slate-900 text-sm">Admin</span>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block">
            <AdminSearchBar />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Notifications */}
            <AdminNotifications
              pendingOrders={pendingOrders || 0}
              pendingProducts={pendingProducts || 0}
              newUsers={newUsersToday || 0}
            />

            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block" />

            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900">{user.email?.split('@')[0]}</span>
              <span className="text-[10px] text-green-600 font-medium">Session Admin Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-3 md:p-8 flex-1">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav pendingOrders={pendingOrders || 0} pendingProducts={pendingProducts || 0} />
    </div>
  );
}
