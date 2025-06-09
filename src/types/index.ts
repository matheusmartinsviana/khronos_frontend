export interface Cliente {
  id: string | number
  customer_id?: string | number
  name: string
  email?: string
  contato?: string
  observacoes?: string
  endereco?: string
  cep?: string
  createdAt?: string
  updatedAt?: string
  contatos?: any[]
  tipo?: "fisica" | "juridica"
}

export interface Contato {
  id: string
  tipo: "celular" | "comercial" | "fixo" | "internacional"
  numero?: string
  email?: string
}

export interface Produto {
  product_id: number
  name: string
  description?: string
  price: number
  product_type?: string
  category_id?: number
  zoning?: string
  createdAt?: string
  updatedAt?: string
  code?: string | null
  observation?: string | null
  segment?: string | null
  image?: string | null
  image_public_id?: string | null
}

export interface ProdutoSelecionado extends Produto {
  quantidade: number
  zoneamento?: string
}

export interface Categoria {
  id: number
  name: string
  description?: string
}

export interface Venda {
  id?: number
  seller_id: number
  customer_id: string | number
  products: Array<{
    product_id: number
    quantidade: number
    price: number
    product_price: number
    total_sales: number
    zoneamento?: string
  }>
  payment_method: string
  total: number
  amount: number
  sale_type: string
  status: string
  date: string
  observacoes?: string
}

export interface User {
  user_id: number
  name: string
  email: string
  role?: string
}

export interface SalesState {
  currentStep: number
  clienteSelecionado: Cliente | null
  produtosSelecionados: ProdutoSelecionado[]
  metodoPagamento: string
  venda: Venda | null
}

export interface NotificationState {
  show: boolean
  type: "success" | "error" | "info"
  message: string
}