"use client";

import { useState } from "react";
import { withdrawFunds } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function WithdrawSection({ balance }: { balance: number }) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const val = Number(amount);
    if (!val || val <= 0) return alert("Montant invalide");
    if (val > balance) return alert("Solde insuffisant");

    setLoading(true);
    const res = await withdrawFunds(val);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert("Demande de retrait effectuée !");
      setAmount("");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Demander un retrait</h2>
      <div className="flex gap-4 items-end">
        <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">Montant (FCFA)</label>
            <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 10000"
            />
        </div>
        <Button onClick={handleWithdraw} disabled={loading || Number(amount) > balance} className="bg-blue-900">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Retirer"}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">Le virement sera effectué sur votre compte Mobile Money par défaut.</p>
    </div>
  );
}
