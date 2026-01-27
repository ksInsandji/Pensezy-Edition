"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { signUpAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" }, // Par défaut, acheteur
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    const result = await signUpAction(data);

    if (result?.error) {
      toast({ variant: "destructive", title: "Erreur", description: result.error });
      setIsLoading(false);
    } else {
      toast({ 
        title: "Compte créé !", 
        description: "Vérifiez vos emails pour confirmer votre compte (si activé)." 
      });
      // Redirection manuelle ou message de succès
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-slate-600">Rejoignez Pensezy Edition</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          
          {/* Nom complet */}
          <div>
            <label className="text-sm font-medium">Nom complet</label>
            <Input {...form.register("fullName")} placeholder="Jean Dupont" />
            {form.formState.errors.fullName && <p className="text-red-500 text-xs">{form.formState.errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input {...form.register("email")} type="email" />
            {form.formState.errors.email && <p className="text-red-500 text-xs">{form.formState.errors.email.message}</p>}
          </div>

          {/* Mot de passe */}
          <div>
            <label className="text-sm font-medium">Mot de passe</label>
            <Input {...form.register("password")} type="password" />
            {form.formState.errors.password && <p className="text-red-500 text-xs">{form.formState.errors.password.message}</p>}
          </div>

          {/* SÉLECTEUR DE RÔLE : IMPORTANT */}
          <div className="pt-2">
            <label className="text-sm font-medium block mb-2">Je veux utiliser Pensezy pour :</label>
            <div className="grid grid-cols-2 gap-4">
              <label className={`border p-4 rounded-lg cursor-pointer text-center transition ${form.watch("role") === 'user' ? 'border-blue-900 bg-blue-50 ring-1 ring-blue-900' : 'hover:bg-slate-50'}`}>
                <input type="radio" value="user" {...form.register("role")} className="sr-only" />
                <span className="font-bold block">Acheter & Lire</span>
                <span className="text-xs text-slate-500">Accès à la librairie</span>
              </label>

              <label className={`border p-4 rounded-lg cursor-pointer text-center transition ${form.watch("role") === 'seller' ? 'border-blue-900 bg-blue-50 ring-1 ring-blue-900' : 'hover:bg-slate-50'}`}>
                <input type="radio" value="seller" {...form.register("role")} className="sr-only" />
                <span className="font-bold block">Vendre</span>
                <span className="text-xs text-slate-500">Gérer mes documents</span>
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-900 mt-4" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            S'inscrire
          </Button>
        </form>
      </div>
    </div>
  );
}