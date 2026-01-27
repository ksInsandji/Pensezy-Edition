"use client";

import { useCartStore } from "@/store/cart-store";
import { createOrder } from "@/app/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Smartphone, CreditCard, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function CheckoutForm({ user }: { user: User }) {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mobile_money");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Mock payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const result = await createOrder({
        items: items.map(i => ({
          listingId: i.listingId,
          quantity: i.quantity,
          price: i.price
        })),
        totalAmount: total,
        paymentMethod
      });

      if (result.error) {
        alert("Erreur: " + result.error);
        return;
      }

      clearCart();
      router.push("/profile?success=true"); // Or specific success page
    } catch (error: any) {
        console.error(error);
        alert("Une erreur est survenue.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">Paiement</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Formulaire */}
        <div className="md:col-span-2 space-y-6">

          {/* 1. Livraison (Conditionnel) */}
          {hasPhysicalItems && (
              <Card title="Adresse de livraison" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="fullname" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nom complet</label>
                        <Input id="fullname" defaultValue={user.user_metadata?.full_name || ""} />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Téléphone</label>
                        <Input id="phone" placeholder="+237 ..." />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                        <label htmlFor="address" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Adresse / Quartier</label>
                        <Input id="address" placeholder="Ex: Akwa, Douala" />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="city" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Ville</label>
                        <Input id="city" placeholder="Douala" />
                    </div>
                </div>
              </Card>
          )}

          {/* 2. Paiement */}
          <Card title="Moyen de paiement" className="space-y-4">
            <div className="space-y-4">
                <label
                    className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'mobile_money' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('mobile_money')}
                >
                    <input type="radio" name="payment" value="mobile_money" checked={paymentMethod === 'mobile_money'} onChange={() => setPaymentMethod('mobile_money')} className="sr-only" />
                    <div className="flex-1 flex items-center">
                        <Smartphone className="w-5 h-5 mr-3 text-orange-600" />
                        <div>
                            <span className="font-medium block">Mobile Money</span>
                            <span className="text-xs text-gray-500">Orange / MTN (Cameroun)</span>
                        </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'mobile_money' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}></div>
                </label>

                <label
                    className={`flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    onClick={() => setPaymentMethod('card')}
                >
                    <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="sr-only" />
                    <div className="flex-1 flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-blue-900" />
                        <div>
                            <span className="font-medium block">Carte Bancaire</span>
                            <span className="text-xs text-gray-500">Visa / Mastercard</span>
                        </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}></div>
                </label>
            </div>
          </Card>
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
                            <span className="font-medium">{(item.price * item.quantity).toLocaleString()}</span>
                        </li>
                    ))}
                </ul>
                <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
                    <span className="font-bold text-gray-900">Total à payer</span>
                    <span className="font-bold text-xl text-blue-900">{total.toLocaleString()}</span>
                </div>

                <Button
                    className="w-full bg-blue-900 hover:bg-blue-800"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        "Payer maintenant"
                    )}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-4">
                    Paiement sécurisé. En validant, vous acceptez nos CGV.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
