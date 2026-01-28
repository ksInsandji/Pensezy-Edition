import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingBag, Wallet, Users } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect("/");
  }

  const navigation = [
    { name: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
    { name: "Produits", href: "/admin/products", icon: Package },
    { name: "Commandes", href: "/admin/orders", icon: ShoppingBag },
    { name: "Retraits", href: "/admin/withdrawals", icon: Wallet },
    // { name: "Utilisateurs", href: "/admin/users", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-red-900 font-display">Admin Pensezy</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-900 transition-colors"
                >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                </Link>
            ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-bold">
                    A
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Superviseur</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}
