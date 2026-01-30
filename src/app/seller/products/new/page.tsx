"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { createProduct } from "../../actions";
import { productSchema, ProductFormValues, ProductType, BOOK_CATEGORIES } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Upload,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Smartphone,
  Package,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const supabase = createClient();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      category: "",
      categories: [],
      productType: "hybrid",
      digitalPrice: null,
      physicalPrice: null,
      stock: 0,
      allowDownload: false,
      discountPercent: 0,
      coverUrl: null,
      filePath: null,
    },
  });

  const toggleCategory = (categoryValue: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryValue)) {
        return prev.filter(c => c !== categoryValue);
      }
      return [...prev, categoryValue];
    });
  };

  const productType = form.watch("productType");
  const showDigitalFields = productType === "digital" || productType === "hybrid";
  const showPhysicalFields = productType === "physical" || productType === "hybrid";

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    setError("");
    setUploadProgress("Préparation...");

    try {
      let coverUrl: string | null = null;
      let filePath: string | null = null;

      // 1. Upload Cover Image (Public Bucket)
      const coverInput = document.getElementById("coverImage") as HTMLInputElement;
      const coverFile = coverInput?.files?.[0];

      if (coverFile) {
        setUploadProgress("Envoi de la couverture...");
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile);

        if (uploadError) throw new Error("Erreur upload couverture: " + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from("covers").getPublicUrl(fileName);
        coverUrl = publicUrlData.publicUrl;
      }

      // 2. Upload Book PDF (Private Bucket) if digital
      if (showDigitalFields) {
        const bookInput = document.getElementById("bookFile") as HTMLInputElement;
        const bookFile = bookInput?.files?.[0];

        if (!bookFile) {
          setError("Le fichier PDF est requis pour un produit numérique");
          setIsLoading(false);
          return;
        }

        setUploadProgress("Envoi du fichier PDF...");
        const fileExt = bookFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("book_files")
          .upload(fileName, bookFile);

        if (uploadError) throw new Error("Erreur upload PDF: " + uploadError.message);
        filePath = fileName;
      }

      // 3. Enregistrer en base via Server Action
      setUploadProgress("Enregistrement...");
      const result = await createProduct({
        ...data,
        categories: selectedCategories,
        coverUrl,
        filePath,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la création");
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container-wrapper max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux produits
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Ajouter un nouveau livre</h1>
          <p className="text-muted-foreground mt-2">
            Pensezy Edition vous permet de vendre vos livres en version numérique, physique, ou les deux !
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-foreground">Plateforme Hybride</p>
            <p className="text-sm text-muted-foreground">
              Maximisez vos ventes en proposant votre livre sous plusieurs formats.
              Les acheteurs peuvent choisir entre lecture streaming, téléchargement, ou livraison physique.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Informations du livre */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Informations du livre
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Titre du livre *</label>
                <Input
                  {...form.register("title")}
                  placeholder="Ex: L'Enfant Noir"
                  className={form.formState.errors.title ? "border-destructive" : ""}
                />
                {form.formState.errors.title && (
                  <p className="text-destructive text-xs">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Auteur *</label>
                <Input
                  {...form.register("author")}
                  placeholder="Camara Laye"
                  className={form.formState.errors.author ? "border-destructive" : ""}
                />
                {form.formState.errors.author && (
                  <p className="text-destructive text-xs">{form.formState.errors.author.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                {...form.register("description")}
                className="w-full min-h-[120px] p-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="Résumé du livre, points forts, ce qui le rend unique..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">ISBN (Optionnel)</label>
                <Input {...form.register("isbn")} placeholder="978-..." />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Categories (selectionner une ou plusieurs)
                </label>
                <div className="flex flex-wrap gap-2">
                  {BOOK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => toggleCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        selectedCategories.includes(cat.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCategories.length} categorie(s) selectionnee(s)
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Section 2: Type de produit */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Format de vente
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option Hybride */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  productType === "hybrid"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  value="hybrid"
                  {...form.register("productType")}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">Hybride</span>
                  <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    Recommandé
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Proposez les deux versions pour maximiser vos ventes
                </p>
              </label>

              {/* Option Numérique */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  productType === "digital"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  value="digital"
                  {...form.register("productType")}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Numérique</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  E-book accessible en streaming
                </p>
              </label>

              {/* Option Physique */}
              <label
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                  productType === "physical"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  value="physical"
                  {...form.register("productType")}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">Physique</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Livre imprimé livré à domicile
                </p>
              </label>
            </div>
          </Card>

          {/* Section 3: Version Numérique */}
          {showDigitalFields && (
            <Card className="p-6 border-primary/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Version Numérique
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Prix numérique (FCFA) *</label>
                  <Input
                    type="number"
                    {...form.register("digitalPrice", { valueAsNumber: true })}
                    placeholder="3000"
                    min="0"
                  />
                  {form.formState.errors.digitalPrice && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.digitalPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    Téléchargement autorisé
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </label>
                  <div className="flex items-center gap-3 h-10">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        {...form.register("allowDownload")}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Permettre le téléchargement du PDF
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Si désactivé, le livre sera uniquement lisible en streaming
                  </p>
                </div>
              </div>

              {/* Upload PDF */}
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Fichier PDF du livre *</span>
                </div>
                <Input
                  id="bookFile"
                  type="file"
                  accept=".pdf"
                  className="cursor-pointer bg-background"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Le fichier sera chiffré et protégé par un filigrane personnalisé pour chaque acheteur.
                </p>
              </div>
            </Card>
          )}

          {/* Section 4: Version Physique */}
          {showPhysicalFields && (
            <Card className="p-6 border-accent/20">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Version Physique
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Prix physique (FCFA) *</label>
                  <Input
                    type="number"
                    {...form.register("physicalPrice", { valueAsNumber: true })}
                    placeholder="5000"
                    min="0"
                  />
                  {form.formState.errors.physicalPrice && (
                    <p className="text-destructive text-xs">
                      {form.formState.errors.physicalPrice.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Stock disponible *</label>
                  <Input
                    type="number"
                    {...form.register("stock", { valueAsNumber: true })}
                    placeholder="10"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Nombre d&apos;exemplaires disponibles à la vente
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Section 5: Image de couverture */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Image de couverture
            </h2>

            <div className="space-y-2">
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Format recommandé : JPG ou PNG, ratio 3:4, minimum 600x800 pixels
              </p>
            </div>
          </Card>

          {/* Section 6: Promotion (optionnel) */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              Promotion (optionnel)
            </h2>

            <div className="space-y-2 max-w-xs">
              <label className="text-sm font-medium text-foreground">Réduction (%)</label>
              <Input
                type="number"
                {...form.register("discountPercent", { valueAsNumber: true })}
                placeholder="0"
                min="0"
                max="100"
              />
              <p className="text-xs text-muted-foreground">
                Appliquer une réduction temporaire sur ce produit
              </p>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/seller/products">
              <Button type="button" variant="outline" disabled={isLoading}>
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 min-w-[200px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress || "Chargement..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Mettre en vente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
