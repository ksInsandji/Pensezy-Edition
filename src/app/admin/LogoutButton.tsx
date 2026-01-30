"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/"); // Redirige vers l'accueil après déconnexion
  };

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
    >
      <span>Déconnexion Admin</span>
      <LogOut className="h-4 w-4" />
    </button>
  );
}