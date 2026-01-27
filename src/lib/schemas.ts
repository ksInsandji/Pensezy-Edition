import * as z from "zod";

export const productSchema = z.object({
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

export type ProductFormValues = z.infer<typeof productSchema>;
