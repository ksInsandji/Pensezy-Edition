"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth";
import { signUpAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, MailCheck, AlertCircle, BookOpen, Store } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { toast } = useToast();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "user" },
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    setErrorMessage("");

    const result = await signUpAction(data);

    if (result?.error) {
      let msg = result.error;
      if (msg.toLowerCase().includes("rate limit")) {
        msg = "Trop de tentatives. Veuillez attendre quelques minutes.";
      } else if (msg.toLowerCase().includes("already registered")) {
        msg = "Cet email est déjà utilisé. Essayez de vous connecter.";
      }

      setErrorMessage(msg);
      toast({ variant: "destructive", title: "Erreur", description: msg });
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setIsLoading(false);
    }
  }

  // Écran de confirmation après inscription réussie
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <MailCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Vérifiez vos emails
          </h2>
          <p className="text-muted-foreground mb-2">
            Un lien de confirmation a été envoyé à :
          </p>
          <p className="font-semibold text-foreground mb-6">
            {form.getValues("email")}
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Prochaine étape :</strong> Ouvrez votre boîte mail
              et cliquez sur le lien de confirmation pour activer votre compte.
            </p>
          </div>
          <Link href="/login">
            <Button variant="outline" className="w-full">
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
        {/* Logo et titre */}
        <div className="text-center">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/Logo_Pensezy_Edition.png"
              alt="Pensezy Edition"
              width={48}
              height={48}
              className="mx-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Créer un compte</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rejoignez Pensezy Edition
          </p>
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Nom complet */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Nom complet
            </label>
            <Input
              {...form.register("fullName")}
              placeholder="Ex: Jean Dupont"
              className={form.formState.errors.fullName ? "border-destructive" : ""}
            />
            {form.formState.errors.fullName && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Adresse email
            </label>
            <Input
              {...form.register("email")}
              type="email"
              placeholder="exemple@email.com"
              className={form.formState.errors.email ? "border-destructive" : ""}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Mot de passe
            </label>
            <PasswordInput
              {...form.register("password")}
              className={form.formState.errors.password ? "border-destructive" : ""}
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-xs flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {form.formState.errors.password.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimum 8 caractères
            </p>
          </div>

          {/* Sélecteur de rôle */}
          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-foreground">
              Je veux utiliser Pensezy pour :
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${
                  form.watch("role") === "user"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  value="user"
                  {...form.register("role")}
                  className="sr-only"
                />
                <BookOpen className={`w-6 h-6 mx-auto mb-2 ${
                  form.watch("role") === "user" ? "text-primary" : "text-muted-foreground"
                }`} />
                <span className="font-semibold text-foreground block text-sm">
                  Acheter & Lire
                </span>
                <span className="text-xs text-muted-foreground">
                  Accès à la librairie
                </span>
              </label>

              <label
                className={`border rounded-xl p-4 cursor-pointer text-center transition-all ${
                  form.watch("role") === "seller"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  value="seller"
                  {...form.register("role")}
                  className="sr-only"
                />
                <Store className={`w-6 h-6 mx-auto mb-2 ${
                  form.watch("role") === "seller" ? "text-primary" : "text-muted-foreground"
                }`} />
                <span className="font-semibold text-foreground block text-sm">
                  Vendre
                </span>
                <span className="text-xs text-muted-foreground">
                  Publier mes œuvres
                </span>
              </label>
            </div>
          </div>

          {/* Bouton d'inscription */}
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 mt-2"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>

        {/* Lien vers connexion */}
        <div className="text-center text-sm border-t border-border pt-6">
          <span className="text-muted-foreground">Déjà un compte ? </span>
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
