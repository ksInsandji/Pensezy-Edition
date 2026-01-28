"use client";

import { adminConfirmOrder } from "../actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function AdminOrdersList({ orders }: { orders: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleConfirm = async (id: string) => {
    if (!confirm("Valider ce paiement manuellement ?")) return;
    setLoadingId(id);
    await adminConfirmOrder(id);
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Toutes les Commandes</h1>
        <span className="text-sm text-gray-500">{orders.length} commandes</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Montant</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.buyer?.full_name || 'Anonyme'}</div>
                    <div className="text-xs text-gray-500">{order.buyer?.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {order.total_amount.toLocaleString()} FCFA
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status !== 'paid' && (
                        <Button
                            size="sm"
                            onClick={() => handleConfirm(order.id)}
                            disabled={loadingId === order.id}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loadingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Valider Paiement"}
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
