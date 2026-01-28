"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";

// --- ACTION INSCRIPTION ---
export async function signUpAction(data: RegisterInput) {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Création du compte dans Supabase Auth
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: {
        full_name: data.fullName,
        role: data.role, // 'user' ou 'seller'
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Mettre à jour le profil avec le bon rôle
  // Le trigger SQL crée le profil mais peut ne pas copier le rôle correctement
  if (authData.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: data.role,
        full_name: data.fullName,
      })
      .eq("id", authData.user.id);

    if (profileError) {
      console.error("Error updating profile role:", profileError);
      // Ne pas faire échouer l'inscription pour ça
    }
  }

  return { success: true };
}

// --- ACTION CONNEXION ---
export async function signInAction(data: LoginInput) {
  const supabase = await createClient();

  // 1. Connexion
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: "Email ou mot de passe incorrect." };
  }

  // 2. Récupérer l'utilisateur et son rôle
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Utilisateur introuvable" };
  }

  // Récupérer le rôle depuis la table profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Utiliser le rôle de profiles, sinon celui de user_metadata, sinon 'user'
  const role = profile?.role || user.user_metadata?.role || "user";

  // 3. Redirection selon le rôle
  if (role === "admin") {
    redirect("/admin");
  } else if (role === "seller") {
    redirect("/seller/dashboard");
  } else {
    redirect("/marketplace");
  }
}
