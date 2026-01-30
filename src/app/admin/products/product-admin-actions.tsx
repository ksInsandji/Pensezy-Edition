"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Package,
} from "lucide-react";
import { updateListingStatus, adminUpdateProduct, adminDeleteProduct } from "../actions";

interface ProductAdminActionsProps {
  listingId: string;
  currentStatus: string;
  currentPrice?: number;
  currentStock?: number;
  productType?: string;
}

export function ProductAdminActions({
  listingId,
  currentStatus,
  currentPrice = 0,
  currentStock = 0,
  productType = "digital",
}: ProductAdminActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [price, setPrice] = useState(currentPrice.toString());
  const [stock, setStock] = useState(currentStock.toString());
  const router = useRouter();
  const { toast } = useToast();

  const handleStatusChange = async (newStatus: "active" | "rejected") => {
    setIsLoading(true);
    try {
      const result = await updateListingStatus(listingId, newStatus);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: newStatus === "active" ? "Produit approuve" : "Produit rejete",
          description:
            newStatus === "active"
              ? "Le produit est maintenant visible sur le marketplace."
              : "Le produit a ete rejete.",
        });
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const updateData: { price?: number; stock?: number } = {};

      const newPrice = parseFloat(price);
      if (!isNaN(newPrice) && newPrice !== currentPrice) {
        updateData.price = newPrice;
      }

      const newStock = parseInt(stock);
      if (!isNaN(newStock) && newStock !== currentStock) {
        updateData.stock = newStock;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "Aucune modification",
          description: "Les valeurs sont identiques.",
        });
        setEditDialogOpen(false);
        setIsLoading(false);
        return;
      }

      const result = await adminUpdateProduct(listingId, updateData);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Produit mis a jour",
          description: "Les modifications ont ete enregistrees.",
        });
        setEditDialogOpen(false);
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await adminDeleteProduct(listingId);

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error,
        });
      } else {
        toast({
          title: "Produit supprime",
          description: "Le produit a ete supprime du marketplace.",
        });
        setDeleteDialogOpen(false);
        router.refresh();
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* Status actions */}
          {currentStatus !== "active" && (
            <DropdownMenuItem onClick={() => handleStatusChange("active")}>
              <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              {currentStatus === "pending" ? "Approuver" : "Activer"}
            </DropdownMenuItem>
          )}
          {currentStatus !== "rejected" && (
            <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
              <XCircle className="w-4 h-4 mr-2 text-red-600" />
              {currentStatus === "pending" ? "Rejeter" : "Desactiver"}
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Edit action */}
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Modifier prix/stock
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete action */}
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Modifiez le prix et le stock de ce produit.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Prix (FCFA)
              </label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="100"
              />
            </div>
            {productType === "physical" && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Stock
                </label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Etes-vous sur de vouloir supprimer ce produit ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
