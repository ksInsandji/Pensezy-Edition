import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit faire 6 caractères min." }),
})

export const registerSchema = loginSchema.extend({
  fullName: z.string().min(2, { message: "Nom complet requis" }),
  role: z.enum(["user", "seller"]),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>