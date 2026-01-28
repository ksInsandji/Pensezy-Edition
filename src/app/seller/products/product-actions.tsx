"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Edit, MoreVertical } from "lucide-react";
import { deleteProduct } from "../actions";
import { useRouter } from "next/navigation";

interface ProductActionsProps {
  id: string;
  bookId?: string;
  hasDigital?: boolean;
  hasPhysical?: boolean;
  digitalListingId?: string | null;
  physicalListingId?: string | null;
}

export function ProductActions({
  id,
  bookId,
  hasDigital,
  hasPhysical,
  digitalListingId,
  physicalListingId,
}: ProductActionsProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Supprimer ce produit ? Cette action est irréversible.")) return;
    setLoading(true);

    // Supprimer toutes les variantes
    const listingsToDelete = [
      digitalListingId,
      physicalListingId,
      // Si pas de variantes spécifiques, utiliser l'ID principal
      ...(!digitalListingId && !physicalListingId ? [id] : []),
    ].filter(Boolean) as string[];

    for (const listingId of listingsToDelete) {
      const res = await deleteProduct(listingId);
      if (res.error) {
        alert(res.error);
        setLoading(false);
        return;
      }
    }

    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1">
      <Link href={`/seller/products/${bookId || id}/edit`}>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit className="w-4 h-4" />
          <span className="sr-only">Modifier</span>
        </Button>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
        <span className="sr-only">Supprimer</span>
      </Button>
    </div>
  );
}
