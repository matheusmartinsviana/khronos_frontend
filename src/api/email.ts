import { api } from "./index"

export interface EmailData {
  type: "both" | "customer" | "seller"
  customerEmail: string
  customerName: string
  sellerEmail: string
  sellerName: string
  saleData: { sale_id: number }
  customerData: { name: string; email: string }
  saleItems: Array<{
    name: string
    quantity?: number
    price?: number
    type?: "produto" | "servico"
    zoneamento?: string
  }>
  reportHTML: string
}

export const sendEmail = (data: EmailData) => api.post("/email/send-email", data)
