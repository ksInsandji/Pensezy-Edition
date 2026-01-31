import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, BookOpen, ShoppingBag, Wallet, Home, Menu } from "lucide-react";

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

  const navigation = [
    { name: "Tableau de bord", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Mes Produits", href: "/seller/products", icon: BookOpen },
    { name: "Commandes", href: "/seller/orders", icon: ShoppingBag },
    { name: "Porte-monnaie", href: "/seller/wallet", icon: Wallet },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/Logo_Pensezy_Edition.png" alt="Logo" width={30} height={30} />
            <span className="font-bold text-blue-900">Espace Vendeur</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
        <div className="flex justify-around items-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-900 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1 font-medium">{item.name.split(' ')[0]}</span>
            </Link>
          ))}
          <Link
            href="/"
            className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">Accueil</span>
          </Link>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex md:flex-col md:fixed md:inset-y-0">
        <div className="p-6 border-b border-gray-100">
          <Link href="/seller/dashboard" className="flex items-center gap-3">
            <Image src="/Logo_Pensezy_Edition.png" alt="Logo" width={35} height={35} />
            <div>
              <span className="font-bold text-blue-900 block leading-none">Pensezy</span>
              <span className="text-[10px] text-orange-500 font-bold uppercase">Espace Vendeur</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-900 transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
          >
            <Home className="w-4 h-4 mr-3" />
            Retour au site
          </Link>
          <div className="flex items-center gap-3 mt-4 px-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata.full_name || 'Vendeur'}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
