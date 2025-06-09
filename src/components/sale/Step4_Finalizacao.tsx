"use client"

import type React from "react"
import { useState } from "react"
import type { Cliente, ProdutoSelecionado, Venda } from "@/types"
import { createSale } from "@/api/sale"
import { verifyUserSalesperson } from "@/api/user"
import { useUser } from "@/context/UserContext"

interface Step4Props {
  cliente: Cliente
  produtos: ProdutoSelecionado[]
  onFinalizarVenda: (venda: Venda) => void
  onShowNotification?: (type: "success" | "error" | "info", message: string) => void
}

const formatarPreco = (valor?: number) => {
  if (typeof valor !== "number" || isNaN(valor)) {
    return "R$ 0,00"
  }
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const Step4_Finalizacao: React.FC<Step4Props> = ({ cliente, produtos, onFinalizarVenda, onShowNotification }) => {
  const { user } = useUser()
  const [metodoPagamento, setMetodoPagamento] = useState<"dinheiro" | "cartao" | "pix" | "boleto">("dinheiro")
  const [loadingVenda, setLoadingVenda] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [observacoes, setObservacoes] = useState("")

  const total = produtos.reduce((sum, p) => {
    const preco = typeof p.price === "number" && !isNaN(p.price) ? p.price : 0
    const qtd = typeof p.quantidade === "number" && !isNaN(p.quantidade) ? p.quantidade : 0
    return sum + preco * qtd
  }, 0)

  const totalItens = produtos.reduce((sum, p) => sum + (p.quantidade || 0), 0)

  const handleFinalizarVenda = async () => {
    if (!user) {
      const errorMsg = "Usuário não autenticado. Faça login novamente."
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    if (produtos.length === 0) {
      const errorMsg = "Selecione pelo menos um produto."
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    if (!cliente.customer_id) {
      const errorMsg = "Cliente inválido. Selecione um cliente válido."
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    if (total <= 0) {
      const errorMsg = "O valor total da venda deve ser maior que zero."
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    // Validar se todos os produtos têm preço válido
    const produtosSemPreco = produtos.filter((p) => !p.price || isNaN(p.price) || p.price <= 0)
    if (produtosSemPreco.length > 0) {
      const errorMsg = `Os seguintes produtos não possuem preço válido: ${produtosSemPreco.map((p) => p.name).join(", ")}`
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    setLoadingVenda(true)
    setMensagem(null)

    try {
      // Verifica e obtém o vendedor a partir do ID do usuário logado
      const response = await verifyUserSalesperson(user.user_id)
      const vendedor = response.data

      if (!vendedor || !vendedor.seller_id) {
        throw new Error("Usuário não é um vendedor válido.")
      }

      // Monta o payload que o backend espera com todos os campos obrigatórios
      const vendaPayload = {
        seller_id: vendedor.seller_id,
        customer_id: cliente.customer_id,
        products: produtos.map((p) => {
          const preco = typeof p.price === "number" && !isNaN(p.price) ? p.price : 0
          const quantidade = typeof p.quantidade === "number" && !isNaN(p.quantidade) ? p.quantidade : 1
          const subtotal = preco * quantidade

          return {
            product_id: p.product_id,
            quantidade: quantidade,
            price: Number(preco.toFixed(2)), // Preço unitário
            product_price: Number(preco.toFixed(2)), // Campo obrigatório product_price
            total_sales: Number(subtotal.toFixed(2)), // Campo obrigatório total_sales (subtotal do produto)
            zoneamento: p.zoneamento || "",
          }
        }),
        payment_method: metodoPagamento,
        total: Number(total.toFixed(2)),
        amount: Number(total.toFixed(2)), // Campo obrigatório amount
        sale_type: "venda", // Campo obrigatório sale_type
        status: "concluida",
        date: new Date().toISOString(),
        observacoes: observacoes.trim() || undefined,
      }

      console.log("Payload da venda:", vendaPayload)

      // Validação adicional antes de enviar
      const produtosInvalidos = vendaPayload.products.filter(
        (p) =>
          !p.product_price ||
          isNaN(p.product_price) ||
          p.product_price <= 0 ||
          !p.total_sales ||
          isNaN(p.total_sales) ||
          p.total_sales <= 0,
      )

      if (produtosInvalidos.length > 0) {
        throw new Error("Alguns produtos possuem preços ou totais inválidos. Verifique os dados e tente novamente.")
      }

      const saleResponse = await createSale(vendaPayload)
      const vendaCriada = saleResponse.data as Venda

      const successMsg = "Venda finalizada com sucesso!"
      setMensagem(successMsg)
      onShowNotification?.("success", successMsg)
      onFinalizarVenda(vendaCriada)
    } catch (error) {
      console.error("Erro ao criar venda:", error)
      let errorMsg = "Erro ao finalizar a venda. Tente novamente."

      if (error instanceof Error) {
        if (error.message.includes("total_sales") && error.message.includes("not-null")) {
          errorMsg =
            "Erro: Total de vendas do produto não pode ser nulo. Verifique se todos os produtos possuem preços e quantidades válidos."
        } else if (error.message.includes("product_price") && error.message.includes("not-null")) {
          errorMsg = "Erro: Preço do produto não pode ser nulo. Verifique se todos os produtos possuem preços válidos."
        } else if (error.message.includes("amount cannot be null")) {
          errorMsg = "Erro: Valor da venda não pode ser nulo."
        } else if (error.message.includes("sale_type cannot be null")) {
          errorMsg = "Erro: Tipo de venda não pode ser nulo."
        } else {
          errorMsg = error.message
        }
      }

      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
    } finally {
      setLoadingVenda(false)
    }
  }

  const metodoPagamentoOptions = [
    { value: "dinheiro", label: "💵 Dinheiro", icon: "💵" },
    { value: "cartao", label: "💳 Cartão", icon: "💳" },
    { value: "pix", label: "📱 PIX", icon: "📱" },
    { value: "boleto", label: "📄 Boleto", icon: "📄" },
  ]

  // Verificar se há produtos com preços inválidos
  const produtosComPrecoInvalido = produtos.filter((p) => !p.price || isNaN(p.price) || p.price <= 0)
  const temProdutosInvalidos = produtosComPrecoInvalido.length > 0

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Finalização da Venda
          </h2>
          <p className="text-red-100 mt-2">Revise os dados e confirme a venda</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Alerta de produtos com preço inválido */}
          {temProdutosInvalidos && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="font-medium">Atenção: Produtos com preços inválidos</p>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                Os seguintes produtos não possuem preços válidos:{" "}
                {produtosComPrecoInvalido.map((p) => p.name).join(", ")}
              </p>
            </div>
          )}

          {/* Informações do Cliente */}
          <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-gray-800">{cliente.name}</p>
                <p className="text-gray-600 text-sm">{cliente.email || "Email não informado"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Contato:</span> {cliente.contato || "Não informado"}
                </p>
                {cliente.observacoes && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Obs:</span> {cliente.observacoes}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Lista de Produtos */}
          <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              Produtos ({produtos.length})
            </h3>
            <div className="space-y-3">
              {produtos.map((p) => {
                const precoInvalido = !p.price || isNaN(p.price) || p.price <= 0
                const subtotal = (p.price || 0) * (p.quantidade || 0)
                return (
                  <div
                    key={p.product_id}
                    className={`flex justify-between items-center p-3 rounded border ${precoInvalido ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                      }`}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <p className="text-sm text-gray-600">
                        {precoInvalido ? (
                          <span className="text-red-600 font-medium">Preço inválido</span>
                        ) : (
                          <>
                            {formatarPreco(p.price)} × {p.quantidade}
                            {p.zoneamento && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {p.zoneamento}
                              </span>
                            )}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Subtotal: {precoInvalido ? "R$ 0,00" : formatarPreco(subtotal)}
                      </p>
                    </div>
                    <div className="text-right">
                      {precoInvalido ? (
                        <p className="font-semibold text-red-600">R$ 0,00</p>
                      ) : (
                        <p className="font-semibold text-gray-800">{formatarPreco(subtotal)}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-300 flex justify-between items-center">
              <span className="text-gray-600">
                <span className="font-medium">{totalItens}</span> item{totalItens !== 1 ? "s" : ""} no total
              </span>
              <span className="text-lg font-bold text-gray-800">Subtotal: {formatarPreco(total)}</span>
            </div>
          </section>

          {/* Método de Pagamento */}
          <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Método de Pagamento
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {metodoPagamentoOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${metodoPagamento === option.value
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-300 bg-white hover:border-gray-400"
                    }`}
                >
                  <input
                    type="radio"
                    name="metodoPagamento"
                    value={option.value}
                    checked={metodoPagamento === option.value}
                    onChange={(e) => setMetodoPagamento(e.target.value as typeof metodoPagamento)}
                    className="sr-only"
                  />
                  <span className="text-center">
                    <div className="text-2xl mb-1">{option.icon}</div>
                    <div className="text-sm font-medium">{option.label.replace(/^.+ /, "")}</div>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Observações */}
          <section className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Observações (Opcional)
            </h3>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações sobre a venda..."
              className="w-full p-3 border border-gray-300 rounded-md text-sm resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={3}
            />
          </section>

          {/* Total */}
          <section className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border border-gray-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total da Venda</p>
                <p className="text-gray-600 text-xs">
                  {produtos.length} produto{produtos.length !== 1 ? "s" : ""} • {totalItens} item
                  {totalItens !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-red-700">{formatarPreco(total)}</p>
              </div>
            </div>
          </section>

          {/* Mensagem de Status */}
          {mensagem && (
            <div
              className={`p-4 rounded-lg border ${mensagem.includes("Erro") || mensagem.includes("inválido")
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
                }`}
            >
              <div className="flex items-center gap-2">
                {mensagem.includes("Erro") || mensagem.includes("inválido") ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                <p className="font-medium">{mensagem}</p>
              </div>
            </div>
          )}

          {/* Botão de Finalizar */}
          <button
            onClick={handleFinalizarVenda}
            disabled={loadingVenda || produtos.length === 0 || total <= 0 || temProdutosInvalidos}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ${loadingVenda || produtos.length === 0 || total <= 0 || temProdutosInvalidos
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-red-700 text-white hover:bg-red-800 hover:shadow-lg transform hover:scale-[1.02]"
              }`}
          >
            {loadingVenda ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Finalizando Venda...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Finalizar Venda - {formatarPreco(total)}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Step4_Finalizacao
