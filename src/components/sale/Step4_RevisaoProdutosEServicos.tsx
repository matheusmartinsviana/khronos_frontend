import type React from "react"
import type { ProdutoSelecionado, ServicoSelecionado } from "@/types"
import { Package, Wrench } from 'lucide-react'

interface Step4Props {
    produtos: ProdutoSelecionado[]
    servicos: ServicoSelecionado[]
    onRemoverProduto: (produtoId: number) => void
    onRemoverServico: (servicoId: number) => void
    onAlterarQuantidade: (itemId: number, quantidade: number, tipo: 'produto' | 'servico') => void
    onAlterarZoneamento: (itemId: number, zoneamento: string, tipo: 'produto' | 'servico') => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const formatarPreco = (valor?: number) => {
    if (typeof valor !== "number" || isNaN(valor)) {
        return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const Step4_RevisaoProdutos: React.FC<Step4Props> = ({
    produtos = [],
    servicos = [],
    onRemoverProduto,
    onRemoverServico,
    onAlterarQuantidade,
    onAlterarZoneamento,
    onShowNotification,
}) => {
    const totalProdutos = Array.isArray(produtos)
        ? produtos.reduce((sum, produto) => {
            const preco = typeof produto.price === "number" ? produto.price : 0
            const quantidade = typeof produto.quantidade === "number" ? produto.quantidade : 0
            return sum + preco * quantidade
        }, 0)
        : 0

    const totalServicos = Array.isArray(servicos)
        ? servicos.reduce((sum, servico) => {
            const preco = typeof servico.price === "number" ? servico.price : 0
            const quantidade = typeof servico.quantidade === "number" ? servico.quantidade : 0
            return sum + preco * quantidade
        }, 0)
        : 0

    const totalGeral = totalProdutos + totalServicos

    const handleRemoverProduto = (produto: ProdutoSelecionado) => {
        onRemoverProduto(produto.product_id)
        onShowNotification("info", `${produto.name} removido da lista`)
    }

    const handleRemoverServico = (servico: ServicoSelecionado) => {
        onRemoverServico(servico.product_id)
        onShowNotification("info", `${servico.name} removido da lista`)
    }

    const handleQuantidadeChange = (itemId: number, novaQuantidade: number, tipo: 'produto' | 'servico') => {
        if (novaQuantidade < 1) return
        onAlterarQuantidade(itemId, novaQuantidade, tipo)
    }

    const handleZoneamentoChange = (itemId: number, novoZoneamento: string, tipo: 'produto' | 'servico') => {
        onAlterarZoneamento(itemId, novoZoneamento, tipo)
    }

    const temItens = (Array.isArray(produtos) && produtos.length > 0) || (Array.isArray(servicos) && servicos.length > 0)

    if (!temItens) {
        return (
            <div className="p-4 lg:p-6 w-full">
                <h2 className="text-gray-800 mb-4 text-lg lg:text-xl font-semibold">Revisão de Produtos e Serviços</h2>
                <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="flex justify-center space-x-4 mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                        <Wrench className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium mb-2">Nenhum produto ou serviço selecionado ainda</p>
                    <p className="text-sm">Volte às etapas anteriores para selecionar produtos e serviços.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 w-full">
            <h2 className="text-gray-800 mb-4 text-lg lg:text-xl font-semibold">Revisão de Produtos e Serviços</h2>

            <div className="space-y-6 w-full">
                {/* Seção de Produtos */}
                {Array.isArray(produtos) && produtos.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Produtos ({produtos.length})
                        </h3>
                        <div className="space-y-4">
                            {produtos.map((produto) => (
                                <div
                                    key={produto.product_id}
                                    className="border border-gray-300 rounded-lg p-3 lg:p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 w-full"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-3 mb-4">
                                        <div className="flex-1 min-w-0 w-full lg:w-auto">
                                            <h4 className="text-gray-800 text-base font-semibold mb-2 line-clamp-2">
                                                {produto.name || "Nome não disponível"}
                                            </h4>
                                            <div className="space-y-1">
                                                <p className="text-gray-600 text-sm">
                                                    <span className="font-medium">Tipo:</span> {produto.product_type || "Não informado"}
                                                </p>
                                                {produto.segment && (
                                                    <p className="text-blue-600 text-sm font-medium">
                                                        <span className="font-medium">Segmento:</span> {produto.segment}
                                                    </p>
                                                )}
                                                {produto.description && (
                                                    <p className="text-gray-600 text-sm line-clamp-2">
                                                        <span className="font-medium">Descrição:</span> {produto.description}
                                                    </p>
                                                )}
                                                <p className="text-red-700 text-sm font-medium">
                                                    <span className="font-medium">Preço unitário:</span> {formatarPreco(produto.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoverProduto(produto)}
                                            className="px-3 py-2 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center gap-1 w-full lg:w-auto justify-center"
                                            aria-label={`Remover ${produto.name}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            Remover
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                                        <div className="space-y-2">
                                            <label htmlFor={`quantidade-produto-${produto.product_id}`} className="block text-sm font-medium text-gray-800">
                                                Quantidade:
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => handleQuantidadeChange(produto.product_id, (produto.quantidade || 1) - 1, 'produto')}
                                                        disabled={(produto.quantidade || 1) <= 1}
                                                        className="px-2 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-md"
                                                        aria-label={`Diminuir quantidade de ${produto.name}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span
                                                        id={`quantidade-produto-${produto.product_id}`}
                                                        className="px-3 lg:px-4 py-2 text-center font-semibold text-gray-800 bg-gray-50 min-w-[60px]"
                                                    >
                                                        {produto.quantidade || 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantidadeChange(produto.product_id, (produto.quantidade || 1) + 1, 'produto')}
                                                        className="px-2 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200 rounded-r-md"
                                                        aria-label={`Aumentar quantidade de ${produto.name}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Subtotal:</p>
                                                    <p className="font-bold text-red-700 text-base lg:text-lg">
                                                        {formatarPreco((produto.price || 0) * (produto.quantidade || 1))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`zoneamento-produto-${produto.product_id}`} className="block text-sm font-medium text-gray-800">
                                                Zoneamento:
                                            </label>
                                            <textarea
                                                id={`zoneamento-produto-${produto.product_id}`}
                                                value={produto.zoneamento || ""}
                                                onChange={(e) => handleZoneamentoChange(produto.product_id, e.target.value, 'produto')}
                                                placeholder="Observações de zoneamento..."
                                                className="w-full resize-y min-h-[80px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Seção de Serviços */}
                {Array.isArray(servicos) && servicos.length > 0 && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                            <Wrench className="w-5 h-5 mr-2" />
                            Serviços ({servicos.length})
                        </h3>
                        <div className="space-y-4">
                            {servicos.map((servico) => (
                                <div
                                    key={servico.product_id}
                                    className="border border-gray-300 rounded-lg p-3 lg:p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200 w-full"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between items-start gap-3 mb-4">
                                        <div className="flex-1 min-w-0 w-full lg:w-auto">
                                            <h4 className="text-gray-800 text-base font-semibold mb-2 line-clamp-2">
                                                {servico.name || "Nome não disponível"}
                                            </h4>
                                            <div className="space-y-1">
                                                <p className="text-gray-600 text-sm">
                                                    <span className="font-medium">Tipo:</span> {servico.product_type || "Não informado"}
                                                </p>
                                                {servico.segment && (
                                                    <p className="text-blue-600 text-sm font-medium">
                                                        <span className="font-medium">Segmento:</span> {servico.segment}
                                                    </p>
                                                )}
                                                {servico.description && (
                                                    <p className="text-gray-600 text-sm line-clamp-2">
                                                        <span className="font-medium">Descrição:</span> {servico.description}
                                                    </p>
                                                )}
                                                <p className="text-red-700 text-sm font-medium">
                                                    <span className="font-medium">Preço unitário:</span> {formatarPreco(servico.price)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoverServico(servico)}
                                            className="px-3 py-2 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center gap-1 w-full lg:w-auto justify-center"
                                            aria-label={`Remover ${servico.name}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                            Remover
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                                        <div className="space-y-2">
                                            <label htmlFor={`quantidade-servico-${servico.product_id}`} className="block text-sm font-medium text-gray-800">
                                                Quantidade:
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-gray-300 rounded-md">
                                                    <button
                                                        onClick={() => handleQuantidadeChange(servico.product_id, (servico.quantidade || 1) - 1, 'servico')}
                                                        disabled={(servico.quantidade || 1) <= 1}
                                                        className="px-2 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-md"
                                                        aria-label={`Diminuir quantidade de ${servico.name}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <span
                                                        id={`quantidade-servico-${servico.product_id}`}
                                                        className="px-3 lg:px-4 py-2 text-center font-semibold text-gray-800 bg-gray-50 min-w-[60px]"
                                                    >
                                                        {servico.quantidade || 1}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantidadeChange(servico.product_id, (servico.quantidade || 1) + 1, 'servico')}
                                                        className="px-2 lg:px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200 rounded-r-md"
                                                        aria-label={`Aumentar quantidade de ${servico.name}`}
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Subtotal:</p>
                                                    <p className="font-bold text-red-700 text-base lg:text-lg">
                                                        {formatarPreco((servico.price || 0) * (servico.quantidade || 1))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor={`zoneamento-servico-${servico.product_id}`} className="block text-sm font-medium text-gray-800">
                                                Zoneamento:
                                            </label>
                                            <textarea
                                                id={`zoneamento-servico-${servico.product_id}`}
                                                value={servico.zoneamento || ""}
                                                onChange={(e) => handleZoneamentoChange(servico.product_id, e.target.value, 'servico')}
                                                placeholder="Observações de zoneamento..."
                                                className="w-full resize-y min-h-[80px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Resumo Total */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-300 w-full">
                <div className="space-y-3">
                    {Array.isArray(produtos) && produtos.length > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 flex items-center">
                                <Package className="w-4 h-4 mr-2" />
                                Produtos ({produtos.length} item{produtos.length !== 1 ? 's' : ''})
                            </span>
                            <span className="font-semibold text-blue-700">{formatarPreco(totalProdutos)}</span>
                        </div>
                    )}

                    {Array.isArray(servicos) && servicos.length > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 flex items-center">
                                <Wrench className="w-4 h-4 mr-2" />
                                Serviços ({servicos.length} item{servicos.length !== 1 ? 's' : ''})
                            </span>
                            <span className="font-semibold text-green-700">{formatarPreco(totalServicos)}</span>
                        </div>
                    )}

                    <hr className="border-gray-300" />

                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-800">Total Geral:</span>
                        <span className="text-xl lg:text-2xl font-bold text-red-700">{formatarPreco(totalGeral)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step4_RevisaoProdutos
