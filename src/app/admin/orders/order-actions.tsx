"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Gift,
  MoreVertical,
  RotateCcw,
  Ban,
} from "lucide-react";
import { validateOrderWithoutPayment, cancelOrder, invalidateOrder } from "../actions";

interface OrderActionsProps {
  orderId: string;
  buyerId: string;
  currentStatus: string;
}

export function OrderActions({ orderId, buyerId, currentStatus }: OrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleValidate = async () => {
    if (
      !confirm(
        "Voulez-vous valider cette commande sans paiement ? Le client aura acces aux produits."
      )
    ) {
      return;
    }

    setIsLoading(true);
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
          title: "Commande validee",
          description:
            "La commande a ete validee avec succes. Le client peut maintenant acceder a ses achats.",
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
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Voulez-vous annuler cette commande ?")) {
      return;
    }

    setIsLoading(true);
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
          title: "Commande annulee",
          description: "La commande a ete annulee.",
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
      setIsLoading(false);
    }
  };

  const handleInvalidate = async (newStatus: "pending" | "cancelled") => {
    const message =
      newStatus === "pending"
        ? "Voulez-vous remettre cette commande en attente ?"
        : "Voulez-vous annuler cette commande ?";

    if (!confirm(message)) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await invalidateOrder(orderId, newStatus);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: newStatus === "pending" ? "Commande en attente" : "Commande annulee",
          description:
            newStatus === "pending"
              ? "La commande a ete remise en attente."
              : "La commande a ete annulee.",
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
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <MoreVertical className="w-4 h-4 mr-2" />
              Actions
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Valider gratuitement - disponible sauf si deja payee */}
        {currentStatus !== "paid" && (
          <DropdownMenuItem onClick={handleValidate}>
            <Gift className="w-4 h-4 mr-2 text-green-600" />
            Valider gratuitement
          </DropdownMenuItem>
        )}

        {/* Re-valider - disponible si deja payee (pour corriger des acces manquants) */}
        {currentStatus === "paid" && (
          <DropdownMenuItem onClick={handleValidate}>
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            Re-valider les acces
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Remettre en attente - disponible si payee ou annulee */}
        {(currentStatus === "paid" || currentStatus === "cancelled") && (
          <DropdownMenuItem onClick={() => handleInvalidate("pending")}>
            <RotateCcw className="w-4 h-4 mr-2 text-yellow-600" />
            Remettre en attente
          </DropdownMenuItem>
        )}

        {/* Annuler - disponible sauf si deja annulee */}
        {currentStatus !== "cancelled" && (
          <DropdownMenuItem
            onClick={handleCancel}
            className="text-red-600 focus:text-red-600"
          >
            <Ban className="w-4 h-4 mr-2" />
            Annuler
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
