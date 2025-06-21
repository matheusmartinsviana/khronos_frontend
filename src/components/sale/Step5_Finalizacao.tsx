"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Cliente, ProdutoSelecionado, ServicoSelecionado, Venda } from "@/types"
import { createSale } from "@/api/sale"
import { verifyUserSalesperson } from "@/api/user"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Check, AlertCircle, Loader2, ExternalLink, Package, Wrench, CreditCard } from "lucide-react"
import { downloadPDF, convertVendaForPDF } from "@/lib/generate-pdf"
import { useUser } from "@/context/UserContext"
import { api } from "@/api"

interface Step5Props {
  cliente: Cliente
  produtos: ProdutoSelecionado[]
  servicos: ServicoSelecionado[]
  onFinalizarVenda: (venda: Venda) => void
  onShowNotification?: (type: "success" | "error" | "info", message: string) => void
}

const formatarPreco = (valor?: number) => {
  if (typeof valor !== "number" || isNaN(valor)) {
    return "R$ 0,00"
  }
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const Step5_Finalizacao: React.FC<Step5Props> = ({
  cliente,
  produtos,
  servicos,
  onFinalizarVenda,
  onShowNotification,
}) => {
  const { user } = useUser()
  const [metodoPagamento, setMetodoPagamento] = useState<"dinheiro" | "cartao" | "pix" | "boleto">("dinheiro")
  const [numeroParcelas, setNumeroParcelas] = useState<number>(1)
  const [loadingVenda, setLoadingVenda] = useState(false)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [observacoes, setObservacoes] = useState("")
  const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
  const [gerando, setGerando] = useState(false)
  const [tentativasEnvio, setTentativasEnvio] = useState(0)
  const [vendaPayload, setVendaPayload] = useState<any>(null)

  // Combinar produtos e serviços para cálculos
  const todosItens = [...(produtos || []), ...(servicos || [])]

  const totalProdutos = (produtos || []).reduce((sum, p) => {
    const preco = typeof p.price === "number" && !isNaN(p.price) ? p.price : 0
    const qtd = typeof p.quantidade === "number" && !isNaN(p.quantidade) ? p.quantidade : 0
    return sum + preco * qtd
  }, 0)

  const totalServicos = (servicos || []).reduce((sum, s) => {
    const preco = typeof s.price === "number" && !isNaN(s.price) ? s.price : 0
    const qtd = typeof s.quantidade === "number" && !isNaN(s.quantidade) ? s.quantidade : 0
    return sum + preco * qtd
  }, 0)

  const total = totalProdutos + totalServicos
  const totalItens = todosItens.reduce((sum, item) => sum + (item.quantidade || 0), 0)

  // Opções de parcelas disponíveis
  const opcoesParcelasCartao = [
    { value: 1, label: "À vista" },
    { value: 2, label: "2x" },
    { value: 3, label: "3x" },
    { value: 4, label: "4x" },
    { value: 5, label: "5x" },
    { value: 6, label: "6x" },
    { value: 7, label: "7x" },
    { value: 8, label: "8x" },
    { value: 9, label: "9x" },
    { value: 10, label: "10x" },
    { value: 11, label: "11x" },
    { value: 12, label: "12x" },
  ]

  const opcoesParcelas = [
    { value: 1, label: "À vista" },
    { value: 2, label: "2x" },
    { value: 3, label: "3x" },
    { value: 4, label: "4x" },
    { value: 5, label: "5x" },
    { value: 6, label: "6x" },
    { value: 7, label: "7x" },
    { value: 8, label: "8x" },
    { value: 9, label: "9x" },
    { value: 10, label: "10x" },
    { value: 11, label: "11x" },
    { value: 12, label: "12x" },
    { value: 15, label: "15x" },
    { value: 18, label: "18x" },
    { value: 24, label: "24x" },
  ]

  // Resetar parcelas quando mudar método de pagamento
  useEffect(() => {
    if (metodoPagamento === "dinheiro" || metodoPagamento === "pix") {
      setNumeroParcelas(1)
    }
  }, [metodoPagamento])

  // Calcular valor da parcela
  const valorParcela = numeroParcelas > 1 ? total / numeroParcelas : total

  // Efeito para tentar reenviar a venda se houver falha
  useEffect(() => {
    if (vendaPayload && tentativasEnvio > 0 && tentativasEnvio < 3 && !vendaFinalizada) {
      const enviarVenda = async () => {
        try {
          setLoadingVenda(true)
          setMensagem(`Tentativa ${tentativasEnvio} de 3: Enviando dados para o servidor...`)

          await new Promise((resolve) => setTimeout(resolve, 1500))

          const saleResponse = await createSale(vendaPayload)
          const vendaCriada = saleResponse.data as Venda

          setVendaFinalizada(vendaCriada)
          const successMsg = "Venda finalizada com sucesso!"
          setMensagem(successMsg)
          onShowNotification?.("success", successMsg)
          onFinalizarVenda(vendaCriada)

          setVendaPayload(null)
          setTentativasEnvio(0)
        } catch (error) {
          console.error(`Erro na tentativa ${tentativasEnvio}:`, error)

          if (tentativasEnvio >= 2) {
            const errorMsg = "Falha ao enviar dados após várias tentativas. Verifique sua conexão e tente novamente."
            setMensagem(errorMsg)
            onShowNotification?.("error", errorMsg)
          } else {
            setTentativasEnvio((prev) => prev + 1)
          }
        } finally {
          setLoadingVenda(false)
        }
      }

      enviarVenda()
    }
  }, [tentativasEnvio, vendaPayload, vendaFinalizada, onFinalizarVenda, onShowNotification])

  const prepararPayload = async () => {
    try {
      const response = await verifyUserSalesperson(user?.user_id || 0)
      const vendedor = response.data

      if (!vendedor || !vendedor.seller_id) {
        throw new Error("Usuário não é um vendedor válido.")
      }

      // Preparar o método de pagamento com parcelas se aplicável
      let paymentMethodString = metodoPagamento
      if ((metodoPagamento === "cartao" || metodoPagamento === "boleto") && numeroParcelas > 1) {
        paymentMethodString = `${metodoPagamento} (${numeroParcelas}x)`
      }

      const payload = {
        seller_id: vendedor.seller_id,
        customer_id: cliente.customer_id,
        produtos,
        servicos,
        payment_method: paymentMethodString,
        installments: numeroParcelas,
        installment_value: Number(valorParcela.toFixed(2)),
        total: Number(total.toFixed(2)),
        amount: Number(total.toFixed(2)),
        sale_type: "venda",
        status: "concluida",
        date: new Date().toISOString(),
        observation: observacoes.trim() || undefined,
      };

      return payload
    } catch (error) {
      console.error("Erro ao preparar payload:", error)
      throw error
    }
  }

  const handleFinalizarVenda = async () => {
    if (!user) {
      const errorMsg = "Usuário não autenticado. Faça login novamente."
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    if (todosItens.length === 0) {
      const errorMsg = "Selecione pelo menos um produto ou serviço."
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

    const itensSemPreco = todosItens.filter((item) => !item.price || isNaN(item.price) || item.price <= 0)
    if (itensSemPreco.length > 0) {
      const errorMsg = `Os seguintes itens não possuem preço válido: ${itensSemPreco.map((item) => item.name).join(", ")}`
      setMensagem(errorMsg)
      onShowNotification?.("error", errorMsg)
      return
    }

    setLoadingVenda(true)
    setMensagem("Preparando dados para envio...")

    try {
      const payload = await prepararPayload()
      setVendaPayload(payload)
      setMensagem("Enviando dados para o servidor...")

      const headers = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "Cache-Control": "no-cache",
      }

      const saleResponse = await api.post("/sales", payload, { headers })
      const vendaCriada = saleResponse.data as Venda
      setVendaFinalizada(vendaCriada)

      const successMsg = "Venda finalizada com sucesso!"
      setMensagem(successMsg)
      onShowNotification?.("success", successMsg)
      onFinalizarVenda(vendaCriada)

      setVendaPayload(null)
      setTentativasEnvio(0)
    } catch (error) {
      console.error("Erro ao criar venda:", error)
      let errorMsg = "Erro ao finalizar a venda. Tentando novamente..."

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
          errorMsg = `Erro: ${error.message}. Tentando novamente...`
        }
      }

      setMensagem(errorMsg)
      onShowNotification?.("info", errorMsg)
      setTentativasEnvio(1)
    } finally {
      setLoadingVenda(false)
    }
  }

  const handleGerarPDF = () => {
    if (!vendaFinalizada) return

    setGerando(true)

    try {
      const vendaParaPDF = convertVendaForPDF(vendaFinalizada, cliente, todosItens, user!)
      downloadPDF(vendaParaPDF)
      onShowNotification?.("success", "Relatório HTML gerado e baixado com sucesso!")
    } catch (error) {
      console.error("Erro ao gerar relatório:", error)
      onShowNotification?.("error", "Erro ao gerar o relatório. Tente novamente.")
    } finally {
      setGerando(false)
    }
  }

  const metodoPagamentoOptions = [
    { value: "dinheiro", label: "Dinheiro", icon: "💵", description: "Pagamento à vista" },
    { value: "cartao", label: "Cartão", icon: "💳", description: "Crédito ou débito" },
    { value: "pix", label: "PIX", icon: "📱", description: "Transferência instantânea" },
    { value: "boleto", label: "Boleto", icon: "📄", description: "Boleto bancário" },
  ]

  const itensComPrecoInvalido = todosItens.filter((item) => !item.price || isNaN(item.price) || item.price <= 0)
  const temItensInvalidos = itensComPrecoInvalido.length > 0

  const mostrarParcelas = metodoPagamento === "cartao" || metodoPagamento === "boleto"

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 lg:p-6">
            <h2 className="text-xl lg:text-2xl font-bold flex items-center gap-2">
              <Check className="w-5 h-5 lg:w-6 lg:h-6" />
              Finalização da Venda
            </h2>
            <p className="text-red-100 mt-2 text-sm lg:text-base">Revise os dados e confirme a venda</p>
          </div>

          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 w-full">
            {/* Alerta de itens com preço inválido */}
            {temItensInvalidos && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">Atenção: Itens com preços inválidos</p>
                </div>
                <p className="text-yellow-700 text-sm mt-1 ml-7">
                  Os seguintes itens não possuem preços válidos:{" "}
                  {itensComPrecoInvalido.map((item) => item.name).join(", ")}
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

            {/* Lista de Produtos e Serviços */}
            <section className="bg-gray-50 rounded-lg p-3 lg:p-4 border border-gray-200 w-full">
              <h3 className="font-semibold text-base lg:text-lg mb-3 flex items-center gap-2 text-gray-800">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  <Wrench className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                Produtos e Serviços ({todosItens.length})
              </h3>
              <div className="w-full overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preço Unit.
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qtd
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Zoneamento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todosItens.map((item) => {
                      const precoInvalido = !item.price || isNaN(item.price) || item.price <= 0
                      const subtotal = (item.price || 0) * (item.quantidade || 0)
                      const isProduto = produtos.some((p) => p.product_id === item.product_id)
                      const isServico = servicos.some((s) => s.product_id === item.product_id)

                      return (
                        <tr key={item.product_id} className={precoInvalido ? "bg-red-50" : ""}>
                          <td className="px-2 lg:px-4 py-2 lg:py-3">
                            <div className="flex items-center gap-2">
                              {isProduto && <Package className="w-4 h-4 text-blue-600" />}
                              {isServico && <Wrench className="w-4 h-4 text-green-600" />}
                              <div>
                                <div className="text-xs lg:text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.product_type}</div>
                              </div>
                            </div>
                            <div className="sm:hidden text-xs text-gray-500 mt-1">
                              {item.zoneamento && `Zona: ${item.zoneamento}`}
                            </div>
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isProduto ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                                }`}
                            >
                              {isProduto ? "Produto" : "Serviço"}
                            </span>
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3">
                            <div
                              className={`text-xs lg:text-sm ${precoInvalido ? "text-red-600 font-medium" : "text-gray-900"}`}
                            >
                              {precoInvalido ? "Preço inválido" : formatarPreco(item.price)}
                            </div>
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-900">
                            {item.quantidade}
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3">
                            <div className="text-xs lg:text-sm font-medium text-gray-900">
                              {precoInvalido ? "R$ 0,00" : formatarPreco(subtotal)}
                            </div>
                          </td>
                          <td className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm text-gray-500 hidden sm:table-cell">
                            {item.zoneamento || "-"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-2 lg:px-4 py-2 lg:py-3 text-xs lg:text-sm font-medium text-gray-500 text-right"
                      >
                        Total ({totalItens} {totalItens === 1 ? "item" : "itens"})
                      </td>
                      <td colSpan={2} className="px-2 lg:px-4 py-2 lg:py-3 text-sm lg:text-base font-bold text-red-700">
                        {formatarPreco(total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* Método de Pagamento - Versão Corrigida */}
            <section className="bg-gray-50 rounded-lg p-4 border border-gray-200 w-full relative">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800">
                <CreditCard className="w-5 h-5 text-red-600" />
                Método de Pagamento
              </h3>

              {/* Seleção do método de pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {metodoPagamentoOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${metodoPagamento === option.value
                      ? "border-red-500 bg-red-50 text-red-700 shadow-md"
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
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium text-center">{option.label}</div>
                    <div className="text-xs text-gray-500 text-center mt-1">{option.description}</div>
                  </label>
                ))}
              </div>

              {/* Seleção de parcelas para cartão e boleto - Versão Corrigida */}
              {mostrarParcelas && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-800">Número de Parcelas</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Selecione as parcelas:</label>
                      <div className="relative z-20">
                        <Select
                          key={`${metodoPagamento}-${numeroParcelas}`} // Key única para forçar re-render
                          value={numeroParcelas.toString()}
                          onValueChange={(value) => setNumeroParcelas(Number.parseInt(value))}
                        >
                          <SelectTrigger className="w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent
                            className="bg-white border border-gray-300 shadow-lg z-50 max-h-60 overflow-y-auto"
                            position="popper"
                            sideOffset={4}
                          >
                            {(metodoPagamento === "cartao" ? opcoesParcelasCartao : opcoesParcelas).map((opcao) => (
                              <SelectItem
                                key={opcao.value}
                                value={opcao.value.toString()}
                                className="hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
                              >
                                {opcao.label}
                                {opcao.value > 1 && ` - ${formatarPreco(total / opcao.value)} cada`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-800">
                          <div className="font-medium">Resumo do Pagamento:</div>
                          <div className="mt-1">
                            {numeroParcelas === 1 ? (
                              <span>
                                À vista: <strong>{formatarPreco(total)}</strong>
                              </span>
                            ) : (
                              <>
                                <div>
                                  {numeroParcelas}x de <strong>{formatarPreco(valorParcela)}</strong>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">Total: {formatarPreco(total)}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

            {/* Resumo Total */}
            <section className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border border-gray-300">
              <div className="space-y-2">
                {produtos.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-blue-600" />
                      Produtos ({produtos.length})
                    </span>
                    <span className="font-semibold text-blue-700">{formatarPreco(totalProdutos)}</span>
                  </div>
                )}

                {servicos.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Wrench className="w-4 h-4 mr-2 text-green-600" />
                      Serviços ({servicos.length})
                    </span>
                    <span className="font-semibold text-green-700">{formatarPreco(totalServicos)}</span>
                  </div>
                )}

                <hr className="border-gray-400" />

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <p className="text-gray-600 text-sm">Total da Venda</p>
                    <p className="text-gray-600 text-xs">
                      {todosItens.length} item{todosItens.length !== 1 ? "s" : ""} • {totalItens} unidade
                      {totalItens !== 1 ? "s" : ""}
                    </p>
                    {mostrarParcelas && numeroParcelas > 1 && (
                      <p className="text-blue-600 text-sm font-medium mt-1">
                        {numeroParcelas}x de {formatarPreco(valorParcela)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-700">{formatarPreco(total)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mensagem de Status */}
            {mensagem && (
              <div
                className={`p-4 rounded-lg border ${mensagem.includes("Erro") || mensagem.includes("inválido") || mensagem.includes("Falha")
                  ? "bg-red-50 border-red-200 text-red-800"
                  : mensagem.includes("Tentativa") || mensagem.includes("Preparando") || mensagem.includes("Enviando")
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : "bg-green-50 border-green-200 text-green-800"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {mensagem.includes("Erro") ||
                    mensagem.includes("inválido") ||
                    mensagem.includes("Falha") ||
                    mensagem.includes("Failed") ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : mensagem.includes("Tentativa") ||
                    mensagem.includes("Preparando") ||
                    mensagem.includes("Enviando") ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  <p className="font-medium">{mensagem}</p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col gap-3 pt-4 w-full">
              <Button
                onClick={handleFinalizarVenda}
                disabled={
                  loadingVenda || todosItens.length === 0 || total <= 0 || temItensInvalidos || vendaFinalizada !== null
                }
                className="w-full py-4 lg:py-6 bg-red-700 hover:bg-red-800 text-white text-sm lg:text-base"
                size="lg"
              >
                {loadingVenda ? (
                  <>
                    <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 animate-spin" />
                    {tentativasEnvio > 0 ? `Tentativa ${tentativasEnvio} de 3...` : "Finalizando Venda..."}
                  </>
                ) : (
                  <div data-testid="finalizar-venda-button" className="flex items-center justify-center">
                    <Check className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                    Finalizar Venda - {formatarPreco(total)}
                    {mostrarParcelas && numeroParcelas > 1 && (
                      <span className="ml-2 text-red-200">
                        ({numeroParcelas}x de {formatarPreco(valorParcela)})
                      </span>
                    )}
                  </div>
                )}
              </Button>

              {vendaFinalizada && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <Button
                    onClick={handleGerarPDF}
                    disabled={gerando}
                    className="w-full py-4 lg:py-6 bg-blue-600 hover:bg-blue-700 text-white text-sm lg:text-base"
                    size="lg"
                  >
                    {gerando ? (
                      <>
                        <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                        Baixar Relatório
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step5_Finalizacao
