"use client";

import { useEffect, useState } from "react";
import { getAllCarts, deleteCart, validateCart } from "@/app/actions/cart";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, ConfirmDialogVariant } from "@/components/ui/confirm-dialog";
import {
  ShoppingCart,
  Trash2,
  CheckCircle,
  Loader2,
  User,
  Package,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type CartData = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  user: { id: string; full_name: string | null; email: string | null } | null;
  cart_items: Array<{
    id: string;
    listing_id: string;
    quantity: number;
    listing: {
      id: string;
      price: number;
      type: string;
      book: { id: string; title: string; author: string; cover_url: string | null } | null;
    } | null;
  }>;
};

type DialogConfig = {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  variant: ConfirmDialogVariant;
  action: () => Promise<void>;
};

export default function AdminCartsPage() {
  const [carts, setCarts] = useState<CartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const { toast } = useToast();

  const loadCarts = async () => {
    setLoading(true);
    const { carts: data, error } = await getAllCarts();
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error,
      });
    } else {
      setCarts(data as CartData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCarts();
  }, []);

  const openDeleteDialog = (cartId: string, userName: string) => {
    setDialogConfig({
      open: true,
      title: "Supprimer le panier",
      description: `Voulez-vous supprimer le panier de ${userName} ? Cette action est irréversible.`,
      confirmText: "Supprimer",
      variant: "danger",
      action: async () => {
        setActionLoading(cartId);
        const { error } = await deleteCart(cartId);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: error,
          });
        } else {
          toast({
            title: "Panier supprimé",
            description: "Le panier a été supprimé avec succès.",
          });
          setCarts(carts.filter((c) => c.id !== cartId));
        }
        setActionLoading(null);
      },
    });
  };

  const openValidateDialog = (cartId: string, userName: string, total: number) => {
    setDialogConfig({
      open: true,
      title: "Valider le panier",
      description: `Voulez-vous valider le panier de ${userName} (${total.toLocaleString()} FCFA) et créer une commande payée ? Le client aura accès aux produits immédiatement.`,
      confirmText: "Valider",
      variant: "success",
      action: async () => {
        setActionLoading(cartId);
        const { error, orderId } = await validateCart(cartId);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: error,
          });
        } else {
          toast({
            title: "Panier validé",
            description: `Commande #${orderId?.slice(0, 8)} créée avec succès.`,
          });
          setCarts(carts.filter((c) => c.id !== cartId));
        }
        setActionLoading(null);
      },
    });
  };

  const closeDialog = () => {
    setDialogConfig(null);
  };

  const calculateCartTotal = (cart: CartData) => {
    return cart.cart_items.reduce((sum, item) => {
      return sum + (item.listing?.price || 0) * item.quantity;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestion des Paniers</h1>
          <p className="text-slate-600 mt-1">
            {carts.length} panier{carts.length > 1 ? "s" : ""} actif{carts.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={loadCarts} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </Button>
      </div>

      {carts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-700">Aucun panier actif</h2>
          <p className="text-slate-500 mt-2">
            Les paniers des utilisateurs apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {carts.map((cart) => (
            <div
              key={cart.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              {/* Header du panier */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {cart.user?.full_name || "Utilisateur inconnu"}
                    </p>
                    <p className="text-sm text-slate-500">{cart.user?.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {calculateCartTotal(cart).toLocaleString()} FCFA
                  </p>
                  <p className="text-xs text-slate-500">
                    {cart.cart_items.length} article{cart.cart_items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Liste des items */}
              <div className="p-4">
                <div className="space-y-3">
                  {cart.cart_items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                        {item.listing?.book?.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.listing.book.cover_url}
                            alt={item.listing.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {item.listing?.book?.title || "Produit inconnu"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {item.listing?.book?.author}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.listing?.type === "digital"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {item.listing?.type === "digital" ? "Numérique" : "Physique"}
                          </span>
                          <span className="text-sm text-slate-600">
                            x{item.quantity}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">
                          {((item.listing?.price || 0) * item.quantity).toLocaleString()} FCFA
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.listing?.price?.toLocaleString()} FCFA/unité
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => openDeleteDialog(cart.id, cart.user?.full_name || "cet utilisateur")}
                  disabled={actionLoading === cart.id}
                >
                  {actionLoading === cart.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => openValidateDialog(
                    cart.id,
                    cart.user?.full_name || "cet utilisateur",
                    calculateCartTotal(cart)
                  )}
                  disabled={actionLoading === cart.id || cart.cart_items.length === 0}
                >
                  {actionLoading === cart.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider (Payé)
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Confirm Dialog */}
      {dialogConfig && (
        <ConfirmDialog
          open={dialogConfig.open}
          onOpenChange={(open) => !open && closeDialog()}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          cancelText="Annuler"
          variant={dialogConfig.variant}
          onConfirm={dialogConfig.action}
          isLoading={actionLoading !== null}
        />
      )}
    </div>
  );
}
