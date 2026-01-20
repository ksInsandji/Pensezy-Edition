import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, BookOpen, ShoppingBag, Wallet } from "lucide-react";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Vérification du rôle (optionnelle si middleware fait le job, mais plus sûre ici)
  // Note: On pourrait aussi vérifier 'profiles' mais pour l'instant metadata suffit si synchro

  const navigation = [
    { name: "Tableau de bord", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Mes Produits", href: "/seller/products", icon: BookOpen },
    { name: "Commandes", href: "/seller/orders", icon: ShoppingBag },
    { name: "Porte-monnaie", href: "/seller/wallet", icon: Wallet },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-900">Espace Vendeur</h1>
        </div>
        <nav className="px-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-blue-900 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 p-4 w-64 border-t">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata.full_name || 'Vendeur'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
