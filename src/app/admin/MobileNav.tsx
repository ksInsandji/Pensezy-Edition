"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogoutButton } from "./LogoutButton";
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
  Menu,
  X,
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

interface MobileNavProps {
  pendingOrders: number;
  pendingProducts: number;
}

export function MobileNav({ pendingOrders, pendingProducts }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <Image src="/Logo_Pensezy_Edition.png" alt="Logo" width={30} height={30} />
            <div>
              <span className="font-bold text-slate-900 block leading-none text-sm">Pensezy</span>
              <span className="text-[9px] text-orange-500 font-bold uppercase">Admin Panel</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all active:bg-blue-100"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
              {item.href === "/admin/orders" && pendingOrders > 0 && (
                <span className="ml-auto bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingOrders}
                </span>
              )}
              {item.href === "/admin/products" && pendingProducts > 0 && (
                <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingProducts}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white space-y-2">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl transition-colors font-medium"
          >
            <Home className="w-4 h-4" />
            Retour au site
          </Link>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

// Bottom Navigation for quick access on mobile
export function MobileBottomNav({ pendingOrders, pendingProducts }: MobileNavProps) {
  const quickNavItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Accueil" },
    { href: "/admin/orders", icon: ShoppingBag, label: "Commandes", badge: pendingOrders },
    { href: "/admin/products", icon: BookOpen, label: "Produits", badge: pendingProducts },
    { href: "/admin/users", icon: Users, label: "Users" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-40">
      <div className="flex justify-around items-center">
        {quickNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center p-2 text-slate-600 hover:text-blue-600 transition-colors relative"
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
