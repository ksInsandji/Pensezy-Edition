"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getProductForEdit, updateProduct } from "../../../actions";
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
  ArrowLeft,
  Info,
  Save,
} from "lucide-react";

interface EditFormValues {
  title: string;
  author: string;
  isbn: string;
  description: string;
  category: string;
  digitalPrice: number | null;
  physicalPrice: number | null;
  stock: number;
  allowDownload: boolean;
  discountPercent: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [productData, setProductData] = useState<{
    productType: "digital" | "physical" | "hybrid";
    hasDigital: boolean;
    hasPhysical: boolean;
    coverUrl: string | null;
    filePath: string | null;
  } | null>(null);

  const supabase = createClient();

  const form = useForm<EditFormValues>({
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      category: "",
      digitalPrice: null,
      physicalPrice: null,
      stock: 0,
      allowDownload: false,
      discountPercent: 0,
    },
  });

  // Charger les données du produit
  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const result = await getProductForEdit(bookId);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.data) {
        const data = result.data;
        setProductData({
          productType: data.productType,
          hasDigital: data.hasDigital,
          hasPhysical: data.hasPhysical,
          coverUrl: data.coverUrl,
          filePath: data.filePath,
        });

        form.reset({
          title: data.title || "",
          author: data.author || "",
          isbn: data.isbn || "",
          description: data.description || "",
          category: data.category || "",
          digitalPrice: data.digitalPrice,
          physicalPrice: data.physicalPrice,
          stock: data.stock || 0,
          allowDownload: data.allowDownload || false,
          discountPercent: 0,
        });
      }

      setIsLoading(false);
    }

    loadProduct();
  }, [bookId, form]);

  const onSubmit = async (data: EditFormValues) => {
    setIsSaving(true);
    setError("");
    setUploadProgress("Préparation...");

    try {
      let newCoverUrl: string | null | undefined = undefined;

      // Upload nouvelle couverture si fournie
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
        newCoverUrl = publicUrlData.publicUrl;
      }

      // Enregistrer les modifications
      setUploadProgress("Enregistrement...");
      const result = await updateProduct(bookId, {
        title: data.title,
        author: data.author,
        description: data.description,
        isbn: data.isbn,
        category: data.category,
        digitalPrice: data.digitalPrice,
        physicalPrice: data.physicalPrice,
        stock: data.stock,
        allowDownload: data.allowDownload,
        discountPercent: data.discountPercent,
        coverUrl: newCoverUrl,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      router.push("/seller/products");
      router.refresh();
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
      setUploadProgress("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-wrapper max-w-4xl">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Chargement du produit...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !productData) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container-wrapper max-w-4xl">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Erreur</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/seller/products">
              <Button variant="outline">Retour aux produits</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showDigitalFields = productData?.hasDigital;
  const showPhysicalFields = productData?.hasPhysical;

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
          <h1 className="text-3xl font-bold text-foreground">Modifier le produit</h1>
          <p className="text-muted-foreground mt-2">
            Modifiez les informations de votre livre.
          </p>
        </div>

        {/* Type badge */}
        <div className="mb-6">
          {productData?.productType === "hybrid" ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Produit Hybride (Numérique + Physique)
            </span>
          ) : productData?.hasDigital ? (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary">
              <Smartphone className="w-4 h-4 mr-1.5" />
              Produit Numérique
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-accent/10 text-accent">
              <Package className="w-4 h-4 mr-1.5" />
              Produit Physique
            </span>
          )}
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
                  {...form.register("title", { required: true })}
                  placeholder="Ex: L'Enfant Noir"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Auteur *</label>
                <Input
                  {...form.register("author", { required: true })}
                  placeholder="Camara Laye"
                />
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <select
                  {...form.register("category")}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="roman">Roman</option>
                  <option value="education">Éducation</option>
                  <option value="poesie">Poésie</option>
                  <option value="histoire">Histoire</option>
                  <option value="sciences">Sciences</option>
                  <option value="economie">Économie</option>
                  <option value="developpement_personnel">Développement Personnel</option>
                  <option value="jeunesse">Jeunesse</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Section 2: Version Numérique */}
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

              {/* Info fichier existant */}
              {productData?.filePath && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-foreground">
                    Fichier PDF déjà uploadé
                  </span>
                </div>
              )}
            </Card>
          )}

          {/* Section 3: Version Physique */}
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

          {/* Section 4: Image de couverture */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-primary" />
              Image de couverture
            </h2>

            {/* Couverture actuelle */}
            {productData?.coverUrl && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Couverture actuelle :</p>
                <div className="w-32 h-40 rounded-lg overflow-hidden border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={productData.coverUrl}
                    alt="Couverture actuelle"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {productData?.coverUrl ? "Nouvelle couverture (optionnel)" : "Image de couverture"}
              </label>
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/seller/products">
              <Button type="button" variant="outline" disabled={isSaving}>
                Annuler
              </Button>
            </Link>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 min-w-[200px]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress || "Enregistrement..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
