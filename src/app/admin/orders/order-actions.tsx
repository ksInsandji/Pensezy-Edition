"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Loader2, Gift } from "lucide-react";
import { validateOrderWithoutPayment, cancelOrder } from "../actions";

interface OrderActionsProps {
  orderId: string;
  buyerId: string;
}

export function OrderActions({ orderId, buyerId }: OrderActionsProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleValidate = async () => {
    if (!confirm("Voulez-vous valider cette commande sans paiement ? Le client aura accès aux produits.")) {
      return;
    }

    setIsValidating(true);
    try {
      const result = await validateOrderWithoutPayment(orderId, buyerId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Commande validée",
          description: "La commande a été validée avec succès. Le client peut maintenant accéder à ses achats.",
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Voulez-vous annuler cette commande ?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await cancelOrder(orderId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Commande annulée",
          description: "La commande a été annulée.",
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={handleValidate}
        disabled={isValidating || isCancelling}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        {isValidating ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Gift className="w-4 h-4 mr-2" />
        )}
        Valider gratuitement
      </Button>

      <Button
        onClick={handleCancel}
        disabled={isValidating || isCancelling}
        variant="outline"
        className="border-red-200 text-red-600 hover:bg-red-50"
      >
        {isCancelling ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4 mr-2" />
        )}
        Annuler
      </Button>
    </div>
  );
}
