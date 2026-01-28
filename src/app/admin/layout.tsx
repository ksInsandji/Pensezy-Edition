import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check role in profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Redirect unprivileged users
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <h1 className="text-3xl font-bold text-red-900 font-display">Administration Pensezy</h1>
                <div className="text-sm text-gray-500">
                    Connecté en tant que Admin
                </div>
            </header>
            {children}
        </div>
    </div>
  );
}
