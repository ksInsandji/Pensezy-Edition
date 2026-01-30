import * as z from "zod";

// Types de produit pour la plateforme hybride
export const productTypeSchema = z.enum(["physical", "digital", "hybrid"]);
export type ProductType = z.infer<typeof productTypeSchema>;

// Liste des categories disponibles
export const BOOK_CATEGORIES = [
  { value: "roman", label: "Roman" },
  { value: "education", label: "Education" },
  { value: "poesie", label: "Poesie" },
  { value: "histoire", label: "Histoire" },
  { value: "sciences", label: "Sciences" },
  { value: "economie", label: "Economie" },
  { value: "developpement_personnel", label: "Developpement Personnel" },
  { value: "jeunesse", label: "Jeunesse" },
  { value: "religion", label: "Religion" },
  { value: "informatique", label: "Informatique" },
  { value: "art", label: "Art" },
  { value: "cuisine", label: "Cuisine" },
  { value: "voyage", label: "Voyage" },
  { value: "sante", label: "Sante" },
  { value: "autre", label: "Autre" },
] as const;

// Schema complet pour la creation de produit
export const productSchema = z.object({
  // Informations du livre
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(), // Categorie principale (deprecated, garder pour compatibilite)
  categories: z.array(z.string()).optional(), // Multi-categories

  // Type de produit (physique, numérique ou hybride)
  productType: productTypeSchema,

  // Prix version numérique (number ou null)
  digitalPrice: z.number().min(0, "Le prix doit être positif").nullable(),

  // Prix version physique (number ou null)
  physicalPrice: z.number().min(0, "Le prix doit être positif").nullable(),

  // Stock pour version physique
  stock: z.number().min(0),

  // Paramètres de diffusion numérique
  allowDownload: z.boolean(),

  // Réduction (pourcentage)
  discountPercent: z.number().min(0).max(100),

  // URLs des fichiers (remplis après upload)
  coverUrl: z.string().nullable().optional(),
  filePath: z.string().nullable().optional(), // Chemin du PDF
});

export type ProductFormValues = z.infer<typeof productSchema>;

// Ancien schéma pour compatibilité (peut être supprimé plus tard)
export const legacyProductSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  author: z.string().min(1, "L'auteur est requis"),
  isbn: z.string().optional(),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Le prix doit être un nombre positif")
  ),
  type: z.enum(["physical", "digital"]),
  stock: z.preprocess(
    (val) => (val ? Number(val) : 0),
    z.number().optional()
  ),
  coverUrl: z.string().nullable().optional(),
  filePath: z.string().nullable().optional(),
});

export type LegacyProductFormValues = z.infer<typeof legacyProductSchema>;
