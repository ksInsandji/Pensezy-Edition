"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-stone-50" />; // Eviter flash hydration
  }

  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 inline-block">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-6" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-500 mb-8">Découvrez nos ouvrages et commencez votre lecture.</p>
            <Link href="/marketplace">
            <Button className="bg-blue-900 hover:bg-blue-800">
                Parcourir le catalogue
            </Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 font-display">Mon Panier</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
        {/* Cart Items List */}
        <section className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <ul role="list" className="divide-y divide-gray-100">
            {items.map((item) => (
              <li key={item.listingId} className="p-6 flex items-center sm:items-start">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-28 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                  {item.coverUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingBag className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between">
                  <div className="pr-8">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link href={`/marketplace/${item.listingId}`} className="hover:text-blue-900">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{item.author}</p>
                    <div className="mt-2 flex items-center gap-2">
                         {item.type === 'digital' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Numérique
                            </span>
                         ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Physique
                            </span>
                         )}
                         <p className="text-sm font-medium text-gray-900">
                            {item.price.toLocaleString()} FCFA
                        </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 sm:mt-0 flex flex-col items-end justify-between">

                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                            onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-2 text-sm font-medium text-gray-900 min-w-[1.5rem] text-center">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                            disabled={item.type === 'digital' || (item.maxStock !== null && item.maxStock !== undefined && item.quantity >= item.maxStock)}
                            className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.listingId)}
                      className="mt-4 text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order Summary */}
        <section className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Résumé de la commande</h2>

            <div className="flow-root">
              <dl className="-my-4 text-sm divide-y divide-gray-100">
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Sous-total</dt>
                  <dd className="font-medium text-gray-900">{total.toLocaleString()} FCFA</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Frais de livraison (estimés)</dt>
                  <dd className="font-medium text-gray-900">Calculé au paiement</dd>
                </div>
                <div className="py-4 flex items-center justify-between border-t border-gray-200">
                  <dt className="text-base font-bold text-gray-900">Total</dt>
                  <dd className="text-base font-bold text-blue-900">{total.toLocaleString()} FCFA</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8">
              <Link href="/checkout">
                <Button className="w-full bg-blue-900 hover:bg-blue-800 h-12 text-lg">
                    Commander
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
                <p>ou <Link href="/marketplace" className="font-medium text-blue-900 hover:text-blue-800">continuer vos achats</Link></p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
