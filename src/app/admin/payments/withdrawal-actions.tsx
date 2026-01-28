"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Loader2 } from "lucide-react";
import { completeWithdrawal } from "../actions";

interface WithdrawalActionsProps {
  transactionId: string;
}

export function WithdrawalActions({ transactionId }: WithdrawalActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleComplete = async () => {
    if (!confirm("Confirmez-vous avoir effectue ce retrait ?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeWithdrawal(transactionId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Retrait valide",
          description: "Le retrait a ete marque comme effectue.",
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
    <div className="flex justify-end">
      <Button
        size="sm"
        onClick={handleComplete}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-1" />
            Valider
          </>
        )}
      </Button>
    </div>
  );
}
