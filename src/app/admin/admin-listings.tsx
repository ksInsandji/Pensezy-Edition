"use client";

import { updateListingStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

export function AdminListingList({ listings }: { listings: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatus = async (id: string, status: 'active' | 'rejected') => {
    setLoadingId(id);
    await updateListingStatus(id, status);
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Listings à modérer ({listings.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Livre</th>
              <th className="px-6 py-3">Vendeur</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {listings.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{item.book.title}</td>
                <td className="px-6 py-4">{item.seller.full_name || item.seller.email}</td>
                <td className="px-6 py-4 capitalize">{item.type}</td>
                <td className="px-6 py-4 text-right space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleStatus(item.id, 'active')}
                        disabled={loadingId === item.id}
                    >
                        {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleStatus(item.id, 'rejected')}
                        disabled={loadingId === item.id}
                    >
                         {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                    </Button>
                </td>
              </tr>
            ))}
             {!listings.length && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Tout est à jour !
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
