"use client"

import type React from "react"
import type { ProdutoSelecionado } from "@/types"

interface Step3Props {
    produtos: ProdutoSelecionado[]
    onRemoverProduto: (produtoId: number) => void
    onAlterarQuantidade: (produtoId: number, quantidade: number) => void
    onAlterarZoneamento: (produtoId: number, zoneamento: string) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const formatarPreco = (valor?: number) => {
    if (typeof valor !== "number" || isNaN(valor)) {
        return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

const Step3_RevisaoProdutos: React.FC<Step3Props> = ({
    produtos,
    onRemoverProduto,
    onAlterarQuantidade,
    onAlterarZoneamento,
    onShowNotification,
}) => {
    const total = produtos.reduce((sum, produto) => {
        const preco = typeof produto.price === "number" ? produto.price : 0
        const quantidade = typeof produto.quantidade === "number" ? produto.quantidade : 0
        return sum + preco * quantidade
    }, 0)

    const handleRemover = (produto: ProdutoSelecionado) => {
        onRemoverProduto(produto.product_id)
        onShowNotification("info", `${produto.name} removido da lista`)
    }

    const handleQuantidadeChange = (produtoId: number, novaQuantidade: number) => {
        if (novaQuantidade < 1) return
        onAlterarQuantidade(produtoId, novaQuantidade)
    }

    const handleZoneamentoChange = (produtoId: number, novoZoneamento: string) => {
        onAlterarZoneamento(produtoId, novoZoneamento)
    }

    if (produtos.length === 0) {
        return (
            <div className="p-4">
                <h2 className="text-gray-800 mb-4 text-lg font-semibold">Revisão de Produtos</h2>
                <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                    <p className="text-lg font-medium mb-2">Nenhum produto selecionado ainda</p>
                    <p className="text-sm">Volte à etapa anterior para selecionar produtos.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h2 className="text-gray-800 mb-4 text-lg font-semibold">Revisão de Produtos</h2>

            <div className="space-y-4">
                {produtos.map((produto) => (
                    <div
                        key={produto.product_id}
                        className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                        <div className="flex justify-between items-start flex-wrap gap-3 mb-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-gray-800 text-base font-semibold mb-2 line-clamp-2">{produto.name}</h4>
                                <div className="space-y-1">
                                    <p className="text-gray-600 text-sm">
                                        <span className="font-medium">Tipo:</span> {produto.product_type || "Não informado"}
                                    </p>
                                    {produto.description && (
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Descrição:</span> {produto.description}
                                        </p>
                                    )}
                                    <p className="text-red-700 text-sm font-medium">
                                        <span className="font-medium">Preço unitário:</span> {formatarPreco(produto.price)}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemover(produto)}
                                className="px-3 py-2 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 flex items-center gap-1"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor={`quantidade-${produto.product_id}`} className="block text-sm font-medium text-gray-800">
                                    Quantidade:
                                </label>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button
                                            onClick={() => handleQuantidadeChange(produto.product_id, produto.quantidade - 1)}
                                            disabled={produto.quantidade <= 1}
                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 rounded-l-md"
                                            aria-label={`Diminuir quantidade de ${produto.name}`}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                            </svg>
                                        </button>
                                        <span
                                            id={`quantidade-${produto.product_id}`}
                                            className="px-4 py-2 text-center font-semibold text-gray-800 bg-gray-50 min-w-[60px]"
                                        >
                                            {produto.quantidade}
                                        </span>
                                        <button
                                            onClick={() => handleQuantidadeChange(produto.product_id, produto.quantidade + 1)}
                                            className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors duration-200 rounded-r-md"
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
                                        <p className="font-bold text-red-700 text-lg">
                                            {formatarPreco(produto.price * produto.quantidade)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor={`zoneamento-${produto.product_id}`} className="block text-sm font-medium text-gray-800">
                                    Zoneamento:
                                </label>
                                <textarea
                                    id={`zoneamento-${produto.product_id}`}
                                    value={produto.zoneamento || ""}
                                    onChange={(e) => handleZoneamentoChange(produto.product_id, e.target.value)}
                                    placeholder="Observações de zoneamento..."
                                    className="w-full resize-y min-h-[80px] p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-300">
                <div className="flex justify-between items-center flex-wrap gap-2">
                    <div className="text-gray-600">
                        <p className="text-sm">
                            <span className="font-medium">{produtos.length}</span> produto{produtos.length !== 1 ? "s" : ""} •{" "}
                            <span className="font-medium">{produtos.reduce((sum, p) => sum + p.quantidade, 0)}</span> item
                            {produtos.reduce((sum, p) => sum + p.quantidade, 0) !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Total Geral:</p>
                        <h3 className="text-red-700 text-2xl font-bold">{formatarPreco(total)}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Step3_RevisaoProdutos
