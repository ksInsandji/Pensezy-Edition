"use client";

import { updateListingStatus } from "../actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, X, Loader2, Ban, Eye } from "lucide-react";
import Link from "next/link";

export function AllProductsList({ listings }: { listings: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatus = async (id: string, status: 'active' | 'rejected') => {
    setLoadingId(id);
    await updateListingStatus(id, status);
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <span className="text-sm text-gray-500">{listings.length} produits au total</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Produit</th>
                <th className="px-6 py-3">Vendeur</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Prix</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {listings.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{item.book.title}</div>
                    <div className="text-xs text-gray-500">{item.book.author}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.seller?.full_name || item.seller?.email || 'Inconnu'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' :
                        item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {item.price.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/marketplace/${item.id}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Voir">
                            <Eye className="w-4 h-4 text-gray-500" />
                        </Button>
                    </Link>

                    {item.status !== 'active' && (
                        <Button
                            size="icon"
                            variant="outline"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleStatus(item.id, 'active')}
                            disabled={loadingId === item.id}
                            title="Activer"
                        >
                            {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                    )}

                    {item.status !== 'rejected' && (
                        <Button
                            size="icon"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleStatus(item.id, 'rejected')}
                            disabled={loadingId === item.id}
                            title="Désactiver/Rejeter"
                        >
                             {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
