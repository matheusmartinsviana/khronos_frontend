import { z } from "zod"

export const clienteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contact: z.string().optional().or(z.literal("")),
  observation: z.string().optional().or(z.literal("")),
  adress: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
})

export type ClienteFormData = z.infer<typeof clienteSchema>
