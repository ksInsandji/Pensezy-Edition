"use client";

import { useCartStore } from "@/store/cart-store";
import { createOrderPending } from "@/app/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Smartphone, CreditCard, ShoppingBag, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { PaymentMethod } from "@/lib/payment/types";

type CheckoutPaymentMethod = "mobile_money_mtn" | "mobile_money_orange" | "card";

export function CheckoutForm({ user }: { user: User }) {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("mobile_money_mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    router.replace("/cart");
    return null;
  }

  const total = getTotal();
  const hasPhysicalItems = items.some(i => i.type === 'physical');
  const isMobileMoney = paymentMethod === "mobile_money_mtn" || paymentMethod === "mobile_money_orange";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Validate phone number for Mobile Money
      if (isMobileMoney && !phoneNumber.trim()) {
        setError("Veuillez entrer votre numéro de téléphone Mobile Money");
        setIsProcessing(false);
        return;
      }

      // Format phone number
      let formattedPhone = phoneNumber.replace(/\s/g, "");
      if (!formattedPhone.startsWith("+237") && !formattedPhone.startsWith("237")) {
        formattedPhone = "+237" + formattedPhone;
      }

      // Step 1: Create order with pending status
      const orderResult = await createOrderPending({
        items: items.map(i => ({
          listingId: i.listingId,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: total,
        paymentMethod: paymentMethod
      });

      if (orderResult.error || !orderResult.orderId) {
        setError(orderResult.error || "Erreur lors de la création de la commande");
        setIsProcessing(false);
        return;
      }

      // Step 2: Initialize payment with CinetPay
      const paymentResponse = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: orderResult.orderId,
          amount: total,
          paymentMethod: paymentMethod as PaymentMethod,
          phoneNumber: isMobileMoney ? formattedPhone : undefined
        })
      });

      const paymentData = await paymentResponse.json();

      if (!paymentData.success || !paymentData.paymentUrl) {
        setError(paymentData.error || "Erreur lors de l'initialisation du paiement");
        setIsProcessing(false);
        return;
      }

      // Clear cart before redirecting
      clearCart();

      // Step 3: Redirect to CinetPay payment page
      // For Mobile Money, we can also redirect to pending page to show instructions
      if (isMobileMoney) {
        // Open CinetPay in a new tab and show pending page
        window.open(paymentData.paymentUrl, "_blank");
        router.push(`/payment/pending?orderId=${orderResult.orderId}`);
      } else {
        // For card payment, redirect directly
        window.location.href = paymentData.paymentUrl;
      }

    } catch (err) {
      console.error("Checkout error:", err);
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">Paiement</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="md:col-span-2 space-y-6">

            {/* 1. Livraison (Conditionnel) */}
            {hasPhysicalItems && (
              <Card title="Adresse de livraison" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fullname" className="text-sm font-medium leading-none">Nom complet</label>
                    <Input id="fullname" name="fullname" defaultValue={user.user_metadata?.full_name || ""} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="delivery_phone" className="text-sm font-medium leading-none">Téléphone</label>
                    <Input id="delivery_phone" name="delivery_phone" placeholder="+237 ..." required />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label htmlFor="address" className="text-sm font-medium leading-none">Adresse / Quartier</label>
                    <Input id="address" name="address" placeholder="Ex: Akwa, Douala" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium leading-none">Ville</label>
                    <Input id="city" name="city" placeholder="Douala" required />
                  </div>
                </div>
              </Card>
            )}

            {/* 2. Moyen de paiement */}
            <Card title="Moyen de paiement" className="space-y-4">
              <div className="space-y-3">
                {/* MTN Mobile Money */}
                <label
                  className={`flex items-center border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'mobile_money_mtn' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('mobile_money_mtn')}
                >
                  <input type="radio" name="payment" value="mobile_money_mtn" checked={paymentMethod === 'mobile_money_mtn'} onChange={() => setPaymentMethod('mobile_money_mtn')} className="sr-only" />
                  <div className="flex-1 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center mr-3">
                      <span className="text-xs font-bold text-black">MTN</span>
                    </div>
                    <div>
                      <span className="font-medium block">MTN Mobile Money</span>
                      <span className="text-xs text-gray-500">Paiement rapide et sécurisé</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'mobile_money_mtn' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}></div>
                </label>

                {/* Orange Money */}
                <label
                  className={`flex items-center border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'mobile_money_orange' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('mobile_money_orange')}
                >
                  <input type="radio" name="payment" value="mobile_money_orange" checked={paymentMethod === 'mobile_money_orange'} onChange={() => setPaymentMethod('mobile_money_orange')} className="sr-only" />
                  <div className="flex-1 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium block">Orange Money</span>
                      <span className="text-xs text-gray-500">Paiement rapide et sécurisé</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'mobile_money_orange' ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}></div>
                </label>

                {/* Carte Bancaire */}
                <label
                  className={`flex items-center border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                  <div className="flex-1 flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center mr-3">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="font-medium block">Carte Bancaire</span>
                      <span className="text-xs text-gray-500">Visa / Mastercard</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}></div>
                </label>
              </div>

              {/* Phone number input for Mobile Money */}
              {isMobileMoney && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro {paymentMethod === "mobile_money_mtn" ? "MTN" : "Orange"} Money
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="6XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full"
                    required={isMobileMoney}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Vous recevrez une demande de validation sur ce numéro
                  </p>
                </div>
              )}
            </Card>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Erreur</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Récapitulatif */}
          <div className="md:col-span-1">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Votre commande
              </h3>
              <ul className="space-y-3 mb-6">
                {items.map(item => (
                  <li key={item.listingId} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate max-w-[150px]">{item.quantity}x {item.title}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
                <span className="font-bold text-gray-900">Total à payer</span>
                <span className="font-bold text-xl text-blue-900">{total.toLocaleString()} FCFA</span>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-900 hover:bg-blue-800"
                size="lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  `Payer ${total.toLocaleString()} FCFA`
                )}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-4">
                Paiement sécurisé via CinetPay. En validant, vous acceptez nos CGV.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
