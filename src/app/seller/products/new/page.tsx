"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createProduct } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, FileText, Image as ImageIcon } from "lucide-react";

const productSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Le prix doit être un nombre positif",
  }),
  type: z.enum(["physical", "digital"]),
  stock: z.string().optional(),
  // Files are handled separately for upload, but we validate their presence
  coverImage: z.any().optional(),
  bookFile: z.any().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const supabase = createClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      description: "",
      price: "",
      type: "physical",
      stock: "0",
    },
  });

  const productType = form.watch("type");

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    setUploadProgress("Préparation...");

    try {
      let coverUrl = null;
      let filePath = null;

      // 1. Upload Cover Image (Public Bucket)
      const coverFile = (data.coverImage as FileList)?.[0];
      if (coverFile) {
        setUploadProgress("Envoi de la couverture...");
        const fileExt = coverFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("covers")
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: publicUrlData } = supabase.storage
          .from("covers")
          .getPublicUrl(fileName);

        coverUrl = publicUrlData.publicUrl;
      }

      // 2. Upload Book PDF (Private Bucket) if digital
      if (data.type === "digital") {
        const bookFile = (data.bookFile as FileList)?.[0];
        if (!bookFile) {
          form.setError("bookFile", { message: "Le fichier PDF est requis pour un produit numérique" });
          setIsLoading(false);
          return;
        }

        setUploadProgress("Envoi du fichier PDF...");
        const fileExt = bookFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("book_files") // Private bucket
          .upload(fileName, bookFile);

        if (uploadError) throw uploadError;
        filePath = fileName;
      }

      // 3. Save to Database via Server Action
      setUploadProgress("Enregistrement...");
      const result = await createProduct({
        ...data,
        price: Number(data.price),
        stock: data.stock ? Number(data.stock) : 0,
        coverUrl,
        filePath,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      router.push("/seller/products");
      router.refresh();
    } catch (error: any) {
      console.error("Error creating product:", error);
      alert("Erreur lors de la création du produit: " + error.message);
    } finally {
      setIsLoading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card title="Ajouter un nouveau livre">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Titre du livre</label>
                <Input {...form.register("title")} placeholder="Ex: L'Enfant Noir" />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Auteur</label>
                <Input {...form.register("author")} placeholder="Camara Laye" />
                {form.formState.errors.author && (
                  <p className="text-red-500 text-xs">{form.formState.errors.author.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...form.register("description")}
                className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
                placeholder="Résumé du livre..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ISBN (Optionnel)</label>
                <Input {...form.register("isbn")} placeholder="978-..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix (FCFA)</label>
                <Input {...form.register("price")} type="number" placeholder="5000" />
                {form.formState.errors.price && (
                  <p className="text-red-500 text-xs">{form.formState.errors.price.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de produit</label>
                <select
                  {...form.register("type")}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                >
                  <option value="physical">Livre Physique</option>
                  <option value="digital">E-book (Numérique)</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields */}
            {productType === "physical" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock disponible</label>
                <Input {...form.register("stock")} type="number" placeholder="10" />
              </div>
            ) : (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-purple-700" />
                  <span className="text-sm font-medium text-purple-900">Fichier PDF du livre</span>
                </div>
                <Input
                  type="file"
                  accept=".pdf"
                  {...form.register("bookFile")}
                  className="cursor-pointer bg-white"
                />
                <p className="text-xs text-gray-500 mt-1">Le fichier sera chiffré et stocké de manière sécurisée.</p>
                {form.formState.errors.bookFile && (
                  <p className="text-red-500 text-xs">{form.formState.errors.bookFile.message as string}</p>
                )}
              </div>
            )}

            {/* Cover Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Image de couverture
              </label>
              <Input
                type="file"
                accept="image/*"
                {...form.register("coverImage")}
                className="cursor-pointer"
              />
            </div>

            <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-800" disabled={isLoading}>
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
        </form>
      </Card>
    </div>
  );
}
