"use client";

import { completeWithdrawal } from "./actions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function AdminWithdrawalList({ withdrawals }: { withdrawals: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleComplete = async (id: string) => {
    if (!confirm("Confirmer le paiement manuel ?")) return;
    setLoadingId(id);
    await completeWithdrawal(id);
    setLoadingId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">Demandes de Retrait ({withdrawals.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Vendeur</th>
              <th className="px-6 py-3">Montant</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {withdrawals.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{new Date(tx.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">{tx.profile?.full_name || 'Inconnu'}</td>
                <td className="px-6 py-4 font-bold text-red-600">{Math.abs(tx.amount).toLocaleString()} FCFA</td>
                <td className="px-6 py-4 text-right">
                    <Button
                        size="sm"
                        onClick={() => handleComplete(tx.id)}
                        disabled={loadingId === tx.id}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loadingId === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Marquer Payé"}
                    </Button>
                </td>
              </tr>
            ))}
             {!withdrawals.length && (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Aucune demande en attente.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
