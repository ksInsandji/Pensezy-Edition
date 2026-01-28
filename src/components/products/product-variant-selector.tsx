"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/components/ui/use-toast";
import {
  Smartphone,
  Package,
  Download,
  ShoppingCart,
  Check,
  Minus,
  Plus,
} from "lucide-react";

interface DigitalVariant {
  id: string;
  price: number;
  allowDownload: boolean;
}

interface PhysicalVariant {
  id: string;
  price: number;
  stock: number;
}

interface ProductVariantSelectorProps {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  coverUrl: string | null;
  digitalVariant: DigitalVariant | null;
  physicalVariant: PhysicalVariant | null;
  isOwner: boolean;
  defaultSelected?: "digital" | "physical";
}

export function ProductVariantSelector({
  bookId,
  bookTitle,
  bookAuthor,
  coverUrl,
  digitalVariant,
  physicalVariant,
  isOwner,
  defaultSelected,
}: ProductVariantSelectorProps) {
  const [selectedType, setSelectedType] = useState<"digital" | "physical">(
    defaultSelected || (digitalVariant ? "digital" : "physical")
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const { toast } = useToast();
  const addItem = useCartStore((state) => state.addItem);

  const selectedVariant =
    selectedType === "digital" ? digitalVariant : physicalVariant;
  const canAddToCart =
    !isOwner &&
    selectedVariant &&
    (selectedType === "digital" ||
      (selectedType === "physical" && physicalVariant && physicalVariant.stock > 0));

  const maxQuantity =
    selectedType === "physical" && physicalVariant
      ? physicalVariant.stock
      : 1;

  const handleAddToCart = () => {
    if (!selectedVariant || isOwner) return;

    const finalQuantity = selectedType === "digital" ? 1 : quantity;

    addItem({
      listingId: selectedVariant.id,
      bookId,
      title: bookTitle,
      author: bookAuthor,
      price: selectedVariant.price,
      type: selectedType,
      coverUrl,
      quantity: finalQuantity,
    });

    setIsAdded(true);
    toast({
      title: "Ajouté au panier",
      description: `${bookTitle} (${selectedType === "digital" ? "Numérique" : "Physique"})`,
    });

    setTimeout(() => setIsAdded(false), 2000);
  };

  const hasDigital = !!digitalVariant;
  const hasPhysical = !!physicalVariant;
  const hasBothVariants = hasDigital && hasPhysical;

  return (
    <div className="space-y-4">
      {/* Sélection du format si les deux sont disponibles */}
      {hasBothVariants && (
        <div className="grid grid-cols-2 gap-3">
          {/* Option Numérique */}
          <button
            type="button"
            onClick={() => setSelectedType("digital")}
            className={`border-2 rounded-xl p-4 text-left transition-all ${
              selectedType === "digital"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Smartphone
                className={`w-5 h-5 ${
                  selectedType === "digital" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="font-semibold text-foreground">Numérique</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {digitalVariant.price.toLocaleString()} FCFA
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Download className="w-3 h-3" />
              {digitalVariant.allowDownload ? "Téléchargeable" : "Streaming uniquement"}
            </p>
          </button>

          {/* Option Physique */}
          <button
            type="button"
            onClick={() => setSelectedType("physical")}
            disabled={physicalVariant.stock === 0}
            className={`border-2 rounded-xl p-4 text-left transition-all ${
              selectedType === "physical"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            } ${physicalVariant.stock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Package
                className={`w-5 h-5 ${
                  selectedType === "physical" ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="font-semibold text-foreground">Physique</span>
            </div>
            <p className="text-lg font-bold text-foreground">
              {physicalVariant.price.toLocaleString()} FCFA
            </p>
            <p
              className={`text-xs flex items-center gap-1 mt-1 ${
                physicalVariant.stock > 0 ? "text-green-600" : "text-destructive"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  physicalVariant.stock > 0 ? "bg-green-600" : "bg-destructive"
                }`}
              />
              {physicalVariant.stock > 0
                ? `${physicalVariant.stock} en stock`
                : "Rupture de stock"}
            </p>
          </button>
        </div>
      )}

      {/* Quantité pour physique */}
      {selectedType === "physical" && physicalVariant && physicalVariant.stock > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Quantité :</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Prix total */}
      {selectedVariant && (
        <div className="flex items-center justify-between py-3 border-t border-border">
          <span className="text-muted-foreground">Total :</span>
          <span className="text-2xl font-bold text-foreground">
            {(selectedVariant.price * (selectedType === "digital" ? 1 : quantity)).toLocaleString()}{" "}
            FCFA
          </span>
        </div>
      )}

      {/* Bouton Ajouter au panier */}
      <Button
        onClick={handleAddToCart}
        disabled={!canAddToCart || isAdded}
        className={`w-full h-12 text-base ${
          isAdded
            ? "bg-green-600 hover:bg-green-600"
            : "bg-primary hover:bg-primary/90"
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Ajouté au panier
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Ajouter au panier
          </>
        )}
      </Button>

      {isOwner && (
        <p className="text-center text-sm text-muted-foreground">
          Vous ne pouvez pas acheter vos propres produits
        </p>
      )}
    </div>
  );
}
