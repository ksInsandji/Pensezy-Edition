"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XCircle, RefreshCw, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("transaction_id") || searchParams.get("orderId");
  const errorMessage = searchParams.get("error");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement échoué
        </h1>

        <p className="text-gray-600 mb-4">
          Votre paiement n&apos;a pas pu être traité. Aucun montant n&apos;a été débité.
        </p>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Causes possibles :
          </p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Solde Mobile Money insuffisant</li>
            <li>Carte bancaire refusée</li>
            <li>Connexion interrompue</li>
            <li>Paiement annulé par l&apos;utilisateur</li>
          </ul>
        </div>

        {orderId && (
          <p className="text-sm text-gray-500 mb-6">
            Référence: <span className="font-mono">{orderId.slice(0, 8)}...</span>
          </p>
        )}

        <div className="space-y-3">
          <Link href="/checkout" className="block">
            <Button className="w-full bg-blue-900 hover:bg-blue-800">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer le paiement
            </Button>
          </Link>

          <Link href="/cart" className="block">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au panier
            </Button>
          </Link>

          <Link
            href="mailto:support@pensezy.com?subject=Problème de paiement"
            className="block"
          >
            <Button variant="ghost" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Contacter le support
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
