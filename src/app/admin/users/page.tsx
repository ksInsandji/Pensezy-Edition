import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Users, UserCheck, Store, Shield, Search } from "lucide-react";
import { UserActions } from "./user-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const roleFilter = params.role?.toString();
  const searchQuery = params.search?.toString();

  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (roleFilter) {
    query = query.eq("role", roleFilter);
  }

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
  }

  const { data: users, error } = await query;

  // Stats
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: sellersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller");
  const { count: adminsCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin");

  const stats = [
    { label: "Total", value: totalUsers || 0, icon: Users, color: "text-blue-600" },
    { label: "Lecteurs", value: (totalUsers || 0) - (sellersCount || 0) - (adminsCount || 0), icon: UserCheck, color: "text-green-600" },
    { label: "Vendeurs", value: sellersCount || 0, icon: Store, color: "text-purple-600" },
    { label: "Admins", value: adminsCount || 0, icon: Shield, color: "text-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestion des utilisateurs</h1>
        <p className="text-muted-foreground">
          Gérez les comptes et les rôles des utilisateurs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Rechercher par nom ou email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>
        </form>

        <div className="flex gap-2 flex-wrap">
          <a
            href="/admin/users"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !roleFilter
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Tous
          </a>
          <a
            href="/admin/users?role=user"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === "user"
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Lecteurs
          </a>
          <a
            href="/admin/users?role=seller"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === "seller"
                ? "bg-purple-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Vendeurs
          </a>
          <a
            href="/admin/users?role=admin"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              roleFilter === "admin"
                ? "bg-red-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            Admins
          </a>
        </div>
      </div>

      {/* Users Table */}
      {users && users.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Utilisateur</th>
                  <th className="text-left p-4 font-medium text-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-foreground">Inscription</th>
                  <th className="text-right p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                          {user.full_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium text-foreground">
                          {user.full_name || "Sans nom"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "seller"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Admin"
                          : user.role === "seller"
                          ? "Vendeur"
                          : "Lecteur"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-4">
                      <UserActions userId={user.id} currentRole={user.role} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucun utilisateur</h3>
          <p className="text-muted-foreground">
            {searchQuery || roleFilter
              ? "Aucun utilisateur ne correspond à vos critères"
              : "Aucun utilisateur inscrit pour le moment"}
          </p>
        </Card>
      )}
    </div>
  );
}
