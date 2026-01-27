"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Loader2, Smartphone, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

type PaymentStatus = "pending" | "processing" | "completed" | "failed";

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>("processing");
  const [checkCount, setCheckCount] = useState(0);

  const orderId = searchParams.get("orderId");
  const maxChecks = 20; // 20 * 5s = ~100s max wait

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }

    const checkPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?orderId=${orderId}`);
        const data = await response.json();

        if (data.success || data.status === "completed") {
          setStatus("completed");
          // Redirect to success page after a brief moment
          setTimeout(() => {
            router.push(`/payment/success?orderId=${orderId}`);
          }, 2000);
        } else if (data.status === "failed" || data.status === "cancelled") {
          setStatus("failed");
        } else {
          // Still processing, check again
          setCheckCount((prev) => prev + 1);
        }
      } catch {
        // Network error, try again
        setCheckCount((prev) => prev + 1);
      }
    };

    // Initial check
    if (status === "processing" && checkCount < maxChecks) {
      const timer = setTimeout(checkPayment, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderId, status, checkCount, router]);

  // Render based on status
  if (status === "completed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement confirmé !
          </h1>
          <p className="text-gray-600">
            Redirection vers votre espace...
          </p>
          <Loader2 className="w-6 h-6 mx-auto mt-4 text-blue-600 animate-spin" />
        </Card>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Paiement non abouti
          </h1>
          <p className="text-gray-600 mb-6">
            Le paiement n&apos;a pas été validé ou a été annulé.
          </p>
          <div className="space-y-3">
            <Link href="/checkout" className="block">
              <Button className="w-full bg-blue-900 hover:bg-blue-800">
                Réessayer
              </Button>
            </Link>
            <Link href="/cart" className="block">
              <Button variant="outline" className="w-full">
                Retour au panier
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Processing state (default)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
          <Smartphone className="w-10 h-10 text-orange-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Confirmez sur votre téléphone
        </h1>

        <p className="text-gray-600 mb-6">
          Une demande de paiement a été envoyée à votre téléphone.
          Veuillez valider la transaction sur votre mobile.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">
              En attente de confirmation
            </span>
          </div>
          <p className="text-xs text-orange-700">
            Vous avez quelques minutes pour valider le paiement via le menu USSD de votre opérateur.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Vérification en cours...</span>
        </div>

        <div className="text-xs text-gray-400 mb-4">
          Vérification {checkCount + 1}/{maxChecks}
        </div>

        {orderId && (
          <p className="text-sm text-gray-500">
            Commande: <span className="font-mono">{orderId.slice(0, 8)}...</span>
          </p>
        )}

        <div className="border-t border-gray-200 mt-6 pt-6 space-y-3">
          <p className="text-sm text-gray-600 mb-4">
            Vous n&apos;avez pas reçu la demande ?
          </p>
          <Link href="/checkout" className="block">
            <Button variant="outline" className="w-full">
              Réessayer avec un autre moyen
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
