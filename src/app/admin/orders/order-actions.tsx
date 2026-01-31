"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog, ConfirmDialogVariant } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Loader2,
  Gift,
  MoreVertical,
  RotateCcw,
  Ban,
  Trash2,
} from "lucide-react";
import { validateOrderWithoutPayment, cancelOrder, invalidateOrder, deleteOrder } from "../actions";

interface OrderActionsProps {
  orderId: string;
  buyerId: string;
  currentStatus: string;
}

type DialogConfig = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: ConfirmDialogVariant;
  action: () => Promise<void>;
};

export function OrderActions({ orderId, buyerId, currentStatus }: OrderActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const executeAction = async (action: () => Promise<any>, successTitle: string, successDescription: string) => {
    setIsLoading(true);
    try {
      const result = await action();

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: successTitle,
          description: successDescription,
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

  const openValidateDialog = () => {
    setDialogConfig({
      open: true,
      title: "Valider la commande",
      description: "Voulez-vous valider cette commande sans paiement ? Le client aura accès aux produits immédiatement.",
      confirmText: "Valider",
      variant: "success",
      action: async () => {
        await executeAction(
          () => validateOrderWithoutPayment(orderId, buyerId),
          "Commande validée",
          "La commande a été validée avec succès. Le client peut maintenant accéder à ses achats."
        );
      },
    });
  };

  const openCancelDialog = () => {
    setDialogConfig({
      open: true,
      title: "Annuler la commande",
      description: "Voulez-vous annuler cette commande ? Cette action changera le statut de la commande.",
      confirmText: "Annuler la commande",
      variant: "warning",
      action: async () => {
        await executeAction(
          () => cancelOrder(orderId),
          "Commande annulée",
          "La commande a été annulée."
        );
      },
    });
  };

  const openInvalidateDialog = (newStatus: "pending" | "cancelled") => {
    if (newStatus === "pending") {
      setDialogConfig({
        open: true,
        title: "Remettre en attente",
        description: "Voulez-vous remettre cette commande en attente ? Le statut sera changé en 'pending'.",
        confirmText: "Remettre en attente",
        variant: "warning",
        action: async () => {
          await executeAction(
            () => invalidateOrder(orderId, newStatus),
            "Commande en attente",
            "La commande a été remise en attente."
          );
        },
      });
    } else {
      setDialogConfig({
        open: true,
        title: "Annuler la commande",
        description: "Voulez-vous annuler cette commande ?",
        confirmText: "Annuler",
        variant: "warning",
        action: async () => {
          await executeAction(
            () => invalidateOrder(orderId, newStatus),
            "Commande annulée",
            "La commande a été annulée."
          );
        },
      });
    }
  };

  const openDeleteDialog = () => {
    setDialogConfig({
      open: true,
      title: "Supprimer définitivement",
      description: "Cette action est IRRÉVERSIBLE. La commande et tous ses détails seront supprimés de la base de données.",
      confirmText: "Supprimer",
      variant: "danger",
      action: async () => {
        await executeAction(
          () => deleteOrder(orderId),
          "Commande supprimée",
          "La commande a été supprimée définitivement."
        );
      },
    });
  };

  const closeDialog = () => {
    setDialogConfig(null);
  };

  return (
    <>
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
        <DropdownMenuContent align="end" className="w-52">
          {/* Valider gratuitement - disponible sauf si deja payee */}
          {currentStatus !== "paid" && (
            <DropdownMenuItem onClick={openValidateDialog}>
              <Gift className="w-4 h-4 mr-2 text-green-600" />
              Valider gratuitement
            </DropdownMenuItem>
          )}

          {/* Re-valider - disponible si deja payee (pour corriger des acces manquants) */}
          {currentStatus === "paid" && (
            <DropdownMenuItem onClick={openValidateDialog}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              Re-valider les accès
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Remettre en attente - disponible si payee ou annulee */}
          {(currentStatus === "paid" || currentStatus === "cancelled") && (
            <DropdownMenuItem onClick={() => openInvalidateDialog("pending")}>
              <RotateCcw className="w-4 h-4 mr-2 text-yellow-600" />
              Remettre en attente
            </DropdownMenuItem>
          )}

          {/* Annuler - disponible sauf si deja annulee */}
          {currentStatus !== "cancelled" && (
            <DropdownMenuItem
              onClick={openCancelDialog}
              className="text-red-600 focus:text-red-600"
            >
              <Ban className="w-4 h-4 mr-2" />
              Annuler
            </DropdownMenuItem>
          )}

          {/* Supprimer définitivement - seulement pour les commandes annulées */}
          {currentStatus === "cancelled" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={openDeleteDialog}
                className="text-red-700 focus:text-red-700 focus:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modern Confirm Dialog */}
      {dialogConfig && (
        <ConfirmDialog
          open={dialogConfig.open}
          onOpenChange={(open) => !open && closeDialog()}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          cancelText="Annuler"
          variant={dialogConfig.variant}
          onConfirm={dialogConfig.action}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
