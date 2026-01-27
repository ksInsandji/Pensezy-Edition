"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { signUpAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" }, // Par défaut, acheteur
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setErrorMessage(""); // Reset error
    const result = await signUpAction(data);

    if (result?.error) {
      let msg = result.error;
      if (msg.toLowerCase().includes("rate limit")) {
        msg = "Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.";
      }

      setErrorMessage(msg);
      toast({ variant: "destructive", title: "Erreur d'inscription", description: msg });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MailCheck className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérifiez vos emails</h2>
                <p className="text-gray-600 mb-6">
                    Un lien de confirmation a été envoyé à <strong>{form.getValues("email")}</strong>.
                    <br/>Cliquez dessus pour activer votre compte.
                </p>
                <Link href="/login">
                    <Button variant="outline" className="w-full">Retour à la connexion</Button>
                </Link>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-slate-600">Rejoignez Pensezy Edition</p>
        </div>

        {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{errorMessage}</p>
            </div>
        )}

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
            <PasswordInput {...form.register("password")} />
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