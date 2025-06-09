import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Preço deve ser positivo"),
  code: z.string().min(1, "O código do produto é obrigatório"),
  product_type: z.string().optional().or(z.literal("")),
  category_id: z.coerce.number().optional(),
  zoning: z.string().optional().or(z.literal("")),
})

export type ProductFormData = z.infer<typeof productSchema>
