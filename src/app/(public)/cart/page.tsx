"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const cartStore = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-12 text-center">Chargement du panier...</div>;

  const items = cartStore.items;
  const total = cartStore.getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Découvrez notre catalogue pour trouver votre prochaine lecture.</p>
        <Link href="/browse">
          <Button>Explorer le catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre Panier</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div key={item.listingId} className="flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              {/* Image */}
              <div className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                 {item.coverUrl ? (
                   <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                 )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="font-bold text-gray-900">{item.price * item.quantity} FCFA</p>
                  </div>
                  <p className="text-sm text-gray-500">{item.author}</p>
                  <span className={`inline-flex mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${item.type === 'digital' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {item.type === 'digital' ? 'Numérique' : 'Physique'}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-4">
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    {item.type === 'physical' ? (
                      <>
                        <button
                          onClick={() => cartStore.updateQuantity(item.listingId, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-6 text-center">{item.quantity}</span>
                        <button
                           onClick={() => cartStore.updateQuantity(item.listingId, item.quantity + 1)}
                           className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">Qté: 1 (Numérique)</span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => cartStore.removeItem(item.listingId)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Résumé de la commande</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{total} FCFA</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className="text-green-600 font-medium">Calculé à l'étape suivante</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>{total} FCFA</span>
              </div>
            </div>

            <Button className="w-full bg-blue-900 hover:bg-blue-800 py-6 text-lg">
              Commander
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-xs text-gray-500 mt-4 text-center">
              Paiement sécurisé par Mobile Money et Carte Bancaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
