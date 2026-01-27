import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/checkout");
  }

  return <CheckoutForm user={user} />;
}
