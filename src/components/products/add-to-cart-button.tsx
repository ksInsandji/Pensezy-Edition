"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";

interface AddToCartButtonProps {
  listingId: string;
  bookId: string;
  title: string;
  author: string;
  price: number;
  type: "physical" | "digital";
  coverUrl: string | null;
  maxStock?: number;
}

export function AddToCartButton({ listingId, bookId, title, author, price, type, coverUrl, maxStock }: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  // Note: We'll assume a basic toast implementation or just generic alert for now if toast hooks are tricky to locate

  const handleAddToCart = () => {
    addItem({
      listingId,
      bookId,
      title,
      author,
      price,
      type,
      coverUrl,
      quantity: 1,
      maxStock: type === 'physical' ? maxStock : undefined
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Simple feedback since Toast setup might vary
    // alert("Produit ajouté au panier !");
  };

  return (
    <Button
      size="lg"
      className={`w-full md:w-auto min-w-[200px] transition-all duration-300 ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-900 hover:bg-blue-800'}`}
      onClick={handleAddToCart}
      disabled={type === 'physical' && maxStock === 0}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-5 w-5" />
          Ajouté !
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-5 w-5" />
          {type === 'physical' && maxStock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
        </>
      )}
    </Button>
  );
}
