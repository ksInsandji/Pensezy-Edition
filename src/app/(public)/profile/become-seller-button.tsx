"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Store, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BecomeSellerButtonProps {
  userId: string;
}

export function BecomeSellerButton({ userId }: BecomeSellerButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleBecomeSeller = async () => {
    setIsLoading(true);

    try {
      const supabase = createClient();

      // Update the user's role to seller
      const { error } = await supabase
        .from("profiles")
        .update({ role: "seller" })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Felicitations !",
        description: "Vous etes maintenant vendeur sur Pensezy Edition.",
      });

      // Redirect to seller dashboard
      router.push("/seller/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error becoming seller:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de devenir vendeur. Veuillez reessayer.",
      });
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-foreground">Devenir Vendeur</h4>
            <p className="text-sm text-muted-foreground mt-1">
              En devenant vendeur, vous pourrez :
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Publier et vendre vos livres (numeriques et physiques)</li>
              <li>Gerer vos commandes et vos stocks</li>
              <li>Recevoir des paiements sur votre portefeuille</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            onClick={handleBecomeSeller}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmer
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="w-full bg-primary hover:bg-primary/90 gap-2"
    >
      <Store className="w-4 h-4" />
      Devenir Vendeur
    </Button>
  );
}
