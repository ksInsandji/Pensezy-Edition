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
  Trash2,
  Loader2,
  MoreVertical,
  Gift,
} from "lucide-react";
import { validateCartAsOrder, clearUserCart } from "../actions";

interface CartActionsProps {
  cartId: string;
  userId: string;
  itemCount: number;
}

export function CartActions({ cartId, userId, itemCount }: CartActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleValidate = async () => {
    if (
      !confirm(
        `Voulez-vous valider ce panier comme commande payee ? L'utilisateur obtiendra acces aux ${itemCount} produit(s) sans payer.`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await validateCartAsOrder(cartId, userId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Panier valide",
          description: "Le panier a ete converti en commande payee. L'utilisateur a maintenant acces aux produits.",
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

  const handleClear = async () => {
    if (!confirm("Voulez-vous vider completement ce panier ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await clearUserCart(cartId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Panier vide",
          description: "Le panier a ete vide.",
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
        <DropdownMenuItem onClick={handleValidate}>
          <Gift className="w-4 h-4 mr-2 text-green-600" />
          Valider comme commande payee
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleClear}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Vider le panier
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
