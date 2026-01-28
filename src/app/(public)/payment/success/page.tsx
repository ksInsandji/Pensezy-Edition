"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2, BookOpen, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("transaction_id") || searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      setIsVerifying(false);
      setError("Aucune commande trouvée");
      return;
    }

    // Verify payment status
    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?orderId=${orderId}`);
        const data = await response.json();

        if (data.success || data.status === "completed") {
          setIsConfirmed(true);
        } else if (data.status === "processing" || data.status === "pending") {
          // Payment still processing, wait and retry
          setTimeout(verifyPayment, 3000);
          return;
        } else {
          setError(data.message || "Vérification en cours...");
        }
      } catch {
        setError("Erreur de vérification");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId]);

  if (isVerifying) {
    return (
      <Card className="max-w-md w-full p-8 text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Vérification du paiement...
        </h2>
        <p className="text-gray-600">
          Veuillez patienter pendant que nous confirmons votre paiement.
        </p>
      </Card>
    );
  }

  if (error && !isConfirmed) {
    return (
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Paiement en cours de traitement
        </h2>
        <p className="text-gray-600 mb-6">
          {error}. Vous recevrez une confirmation par email une fois le paiement validé.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Rafraîchir
          </Button>
          <Link href="/profile" className="block">
            <Button variant="ghost" className="w-full">
              Voir mes commandes
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Paiement réussi !
      </h1>

      <p className="text-gray-600 mb-6">
        Merci pour votre achat. Votre commande a été confirmée.
      </p>

      {orderId && (
        <p className="text-sm text-gray-500 mb-6">
          Référence: <span className="font-mono">{orderId.slice(0, 8)}...</span>
        </p>
      )}

      <div className="border-t border-gray-200 pt-6 space-y-3">
        <p className="text-sm text-gray-600 mb-4">
          Que souhaitez-vous faire maintenant ?
        </p>

        <Link href="/library" className="block">
          <Button className="w-full bg-blue-900 hover:bg-blue-800">
            <BookOpen className="w-4 h-4 mr-2" />
            Accéder à ma bibliothèque
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>

        <Link href="/marketplace" className="block">
          <Button variant="outline" className="w-full">
            <Package className="w-4 h-4 mr-2" />
            Continuer mes achats
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function PaymentSuccessFallback() {
  return (
    <Card className="max-w-md w-full p-8 text-center">
      <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Vérification du paiement...
      </h2>
      <p className="text-gray-600">
        Veuillez patienter pendant que nous confirmons votre paiement.
      </p>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<PaymentSuccessFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
