"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";
import { addItemToCart } from "@/app/actions/cart";
import { createClient } from "@/lib/supabase/client";

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

export function AddToCartButton({
  listingId,
  bookId,
  title,
  author,
  price,
  type,
  coverUrl,
  maxStock
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  // Verifier si l'utilisateur est connecte
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkUser();
  }, []);

  // Verifier si l'article est deja dans le panier
  useEffect(() => {
    const existingItem = items.find(item => item.listingId === listingId);
    setIsInCart(!!existingItem);
  }, [items, listingId]);

  const handleAddToCart = async () => {
    // Si c'est un produit digital et deja dans le panier, ne rien faire
    if (type === "digital" && isInCart) {
      toast({
        title: "Deja dans le panier",
        description: "Ce livre numerique est deja dans votre panier.",
      });
      return;
    }

    setIsAdding(true);

    try {
      // Ajouter au store local
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

      // Si l'utilisateur est connecte, synchroniser avec la base de donnees
      if (userId) {
        const result = await addItemToCart(listingId, 1);
        if (result.error) {
          console.error("Erreur sync DB:", result.error);
        }
      }

      toast({
        title: "Ajoute au panier",
        description: `${title} a ete ajoute a votre panier.`,
      });

      setIsInCart(true);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter au panier.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Pour les produits digitaux: afficher "Dans le panier" si deja present
  if (type === "digital" && isInCart) {
    return (
      <Button
        size="lg"
        className="w-full md:w-auto min-w-[200px] bg-green-600 hover:bg-green-700 cursor-default"
        disabled
      >
        <Check className="mr-2 h-5 w-5" />
        Dans le panier
      </Button>
    );
  }

  // Pour les produits physiques: permettre d'augmenter la quantite
  if (type === "physical" && isInCart) {
    return (
      <Button
        size="lg"
        className="w-full md:w-auto min-w-[200px] bg-green-600 hover:bg-green-700"
        onClick={handleAddToCart}
        disabled={isAdding || (maxStock !== undefined && maxStock === 0)}
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Ajout...
          </>
        ) : (
          <>
            <Check className="mr-2 h-5 w-5" />
            Ajouter encore (+1)
          </>
        )}
      </Button>
    );
  }

  // Bouton par defaut
  return (
    <Button
      size="lg"
      className="w-full md:w-auto min-w-[200px] transition-all duration-300 bg-blue-900 hover:bg-blue-800"
      onClick={handleAddToCart}
      disabled={isAdding || (type === 'physical' && maxStock === 0)}
    >
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Ajout...
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
