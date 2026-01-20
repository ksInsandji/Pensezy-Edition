"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { signInAction } from "../actions"; // On importe notre action serveur
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast"; // Pour les notifications
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    
    // Appel de l'action serveur
    const result = await signInAction(data);
    
    // Si result est undefined, c'est que le redirect a marché (le code s'arrête)
    // Sinon, c'est qu'il y a une erreur
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: result.error,
      });
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Bon retour !</h2>
          <p className="mt-2 text-sm text-slate-600">
            Connectez-vous à Pensezy Edition
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input {...form.register("email")} type="email" placeholder="exemple@email.com" />
              {form.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <Input {...form.register("password")} type="password" />
              {form.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Se connecter
          </Button>

          <div className="text-center text-sm">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-medium text-blue-900 hover:text-blue-800">
              S'inscrire
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}