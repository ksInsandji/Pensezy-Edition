"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { signInAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Gérer les messages de l'URL (callback, confirmation, etc.)
  useEffect(() => {
    const error = searchParams.get("error");
    const confirmed = searchParams.get("confirmed");

    if (error === "auth-code-error") {
      setErrorMessage("Le lien de confirmation a expiré ou est invalide. Veuillez vous réinscrire.");
    }

    if (confirmed === "true") {
      setSuccessMessage("Email confirmé ! Vous pouvez maintenant vous connecter.");
    }
  }, [searchParams]);

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await signInAction(data);

    // Si result est undefined, le redirect a fonctionné
    if (result?.error) {
      let msg = result.error;

      // Messages d'erreur plus clairs
      if (msg.includes("Invalid login credentials")) {
        msg = "Email ou mot de passe incorrect.";
      } else if (msg.includes("Email not confirmed")) {
        msg = "Veuillez confirmer votre email avant de vous connecter. Vérifiez votre boîte mail.";
      }

      setErrorMessage(msg);
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: msg,
      });
      setIsLoading(false);
    }
  }

  return (
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
        <h1 className="text-2xl font-bold text-foreground">Bon retour !</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connectez-vous à Pensezy Edition
        </p>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
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
        </div>

        {/* Bouton de connexion */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>

      {/* Lien vers inscription */}
      <div className="text-center text-sm border-t border-border pt-6">
        <span className="text-muted-foreground">Pas encore de compte ? </span>
        <Link
          href="/register"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          S&apos;inscrire
        </Link>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded animate-pulse" />
        <div className="h-8 w-32 mx-auto bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 mx-auto mt-2 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
