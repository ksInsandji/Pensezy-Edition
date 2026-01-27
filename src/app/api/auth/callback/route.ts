import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Paramètres possibles
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/marketplace";

  const supabase = await createClient();

  // Méthode 1: PKCE flow avec code (OAuth, magic link avec PKCE)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[Auth Callback] Code exchange error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
  }

  // Méthode 2: Email OTP flow avec token_hash (confirmation email, reset password)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Pour une confirmation d'email, rediriger vers login avec message de succès
      if (type === "email" || type === "signup") {
        return NextResponse.redirect(`${origin}/login?confirmed=true`);
      }
      // Pour d'autres types (recovery, etc.), rediriger vers next
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error("[Auth Callback] OTP verification error:", error.message);
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
  }

  // Aucun paramètre valide trouvé
  console.error("[Auth Callback] No valid auth parameters found");
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}
