"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { updateListingStatus } from "../actions";

interface ProductAdminActionsProps {
  listingId: string;
  currentStatus: string;
}

export function ProductAdminActions({ listingId, currentStatus }: ProductAdminActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: "active" | "rejected") => {
    setIsLoading(true);
    try {
      const result = await updateListingStatus(listingId, newStatus);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: newStatus === "active" ? "Produit approuve" : "Produit rejete",
          description:
            newStatus === "active"
              ? "Le produit est maintenant visible sur le marketplace."
              : "Le produit a ete rejete.",
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

  if (currentStatus === "active") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange("rejected")}
        disabled={isLoading}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1" />
            Desactiver
          </>
        )}
      </Button>
    );
  }

  if (currentStatus === "rejected") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange("active")}
        disabled={isLoading}
        className="text-green-600 border-green-200 hover:bg-green-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Reactiver
          </>
        )}
      </Button>
    );
  }

  // Pending status - show both buttons
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => handleStatusChange("active")}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Approuver
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleStatusChange("rejected")}
        disabled={isLoading}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <XCircle className="w-4 h-4 mr-1" />
            Rejeter
          </>
        )}
      </Button>
    </div>
  );
}
