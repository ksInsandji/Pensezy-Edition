"use client";

import { Button } from "@/components/ui/button";
import { useCartStore, CartItem } from "@/store/cart-store";
import { ShoppingCart, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type AddToCartProps = {
  item: Omit<CartItem, "quantity">;
};

export function AddToCartButton({ item }: AddToCartProps) {
  const cartStore = useCartStore();
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Hydratation manuelle du store pour éviter les erreurs SSR
  useEffect(() => {
    useCartStore.persist.rehydrate();
    setMounted(true);
  }, []);

  if (!mounted) return <Button disabled>Chargement...</Button>;

  const isInCart = cartStore.items.some((i) => i.listingId === item.listingId);

  const handleAdd = () => {
    cartStore.addItem({ ...item, quantity: 1 });
    toast({
      title: "Ajouté au panier",
      description: `${item.title} a été ajouté.`,
    });
  };

  if (isInCart && item.type === "digital") {
    return (
      <Button disabled variant="secondary" className="w-full md:w-auto">
        <Check className="w-4 h-4 mr-2" />
        Déjà dans le panier
      </Button>
    );
  }

  return (
    <Button onClick={handleAdd} className="w-full md:w-auto bg-blue-900 hover:bg-blue-800">
      <ShoppingCart className="w-4 h-4 mr-2" />
      Ajouter au panier
    </Button>
  );
}
