"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginInput, RegisterInput } from "@/lib/validations/auth";

// --- ACTION INSCRIPTION ---
export async function signUpAction(data: RegisterInput) {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 1. Création du compte dans Supabase Auth
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: {
        full_name: data.fullName,
        // On stocke le rôle dans les métadonnées pour y accéder vite
        // Note: Le trigger SQL que je t'ai donné remplira aussi la table 'profiles'
        role: data.role, 
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si l'email confirmation est désactivé sur Supabase, on peut connecter direct
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

  // 2. Vérification du rôle pour la redirection
  // On récupère le profil complet pour être sûr
  const { data: { user } } = await supabase.auth.getUser();
  
  // On lit le rôle stocké soit dans metadata, soit en faisant une requête DB
  // Ici, utilisons une requête DB pour être 100% sûr du rôle actuel

  if (!user?.id) {
     return { error: "Utilisateur introuvable" };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role || 'user';

  // 3. Redirection intelligente
  // Note: 'role' typé par Supabase peut être plus restrictif que ce qu'on attend.
  // On caste en string pour la comparaison souple.
  const userRole = role as string;

  if (userRole === 'admin') {
    redirect('/admin/validations');
  } else if (userRole === 'seller' || user?.user_metadata.role === 'seller') {
    // Si l'utilisateur est un vendeur, direction son dashboard
    redirect('/seller/products');
  } else {
    // Sinon (acheteur), direction le catalogue
    redirect('/browse');
  }
}