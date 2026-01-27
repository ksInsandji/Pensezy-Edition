"use client";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteProduct } from "../actions";
import { useState } from "react";

export function ProductActions({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if(!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    setLoading(true);
    const res = await deleteProduct(id);
    if(res.error) alert(res.error);
    setLoading(false);
  };

  return (
    <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        <span className="sr-only">Supprimer</span>
    </Button>
  )
}
