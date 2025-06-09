"use client"

import type React from "react"
import { useEffect, useState } from "react"
import type { Produto, ProdutoSelecionado, Categoria } from "@/types"
import { getProducts } from "@/api/product"
import { getCategories } from "@/api/category"

interface Step2Props {
    produtosSelecionados: ProdutoSelecionado[]
    onAdicionarProduto: (produto: ProdutoSelecionado) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const Step2_SelecionarProdutos: React.FC<Step2Props> = ({
    produtosSelecionados = [], // Default value
    onAdicionarProduto,
    onShowNotification,
}) => {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [filtroCategoria, setFiltroCategoria] = useState<number | "">("")
    const [filtroNome, setFiltroNome] = useState("")
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [loading, setLoading] = useState(true)
    const itensPorPagina = 9

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [prodRes, catRes] = await Promise.all([getProducts(), getCategories()])
                setProdutos(Array.isArray(prodRes.data) ? prodRes.data : [])
                setCategorias(Array.isArray(catRes.data) ? catRes.data : [])
            } catch (error) {
                console.error("Erro ao carregar dados:", error)
                onShowNotification("error", "Erro ao carregar produtos ou categorias.")
                // Set empty arrays as fallback
                setProdutos([])
                setCategorias([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [onShowNotification])

    useEffect(() => {
        setPaginaAtual(1)
    }, [filtroNome, filtroCategoria])

    const produtosFiltrados = produtos.filter((produto) => {
        if (!produto) return false

        const matchCategoria = filtroCategoria === "" || produto.category_id === filtroCategoria
        const matchNome =
            filtroNome === "" || (produto.name && produto.name.toLowerCase().includes(filtroNome.toLowerCase()))
        return matchCategoria && matchNome
    })

    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina)
    const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina)

    const isProdutoJaSelecionado = (produtoId: number) => {
        return Array.isArray(produtosSelecionados) && produtosSelecionados.some((p) => p.product_id === produtoId)
    }

    const handleSelecionarProduto = (produto: Produto) => {
        if (isProdutoJaSelecionado(produto.product_id)) {
            onShowNotification("error", "Este produto já foi selecionado!")
            return
        }

        const produtoSelecionado: ProdutoSelecionado = {
            ...produto,
            quantidade: 1,
            zoneamento: produto.zoning || "",
        }

        onAdicionarProduto(produtoSelecionado)
        onShowNotification("success", `${produto.name} adicionado à lista!`)
    }

    const handlePaginaAnterior = () => {
        setPaginaAtual((prev) => Math.max(prev - 1, 1))
    }

    const handleProximaPagina = () => {
        setPaginaAtual((prev) => (prev < totalPaginas ? prev + 1 : prev))
    }

    const formatarPreco = (valor?: number) => {
        if (typeof valor !== "number" || isNaN(valor)) {
            return "R$ 0,00"
        }
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    if (loading) {
        return (
            <div className="p-4 lg:p-6 w-full">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Produtos</h2>
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                    Carregando produtos...
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 w-full">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Produtos</h2>

            <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar produto..."
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                    className="p-2 lg:p-3 border border-gray-300 rounded text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value === "" ? "" : Number(e.target.value))}
                    className="p-2 lg:p-3 border border-gray-300 rounded text-sm flex-1 sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="">Todas as categorias</option>
                    {Array.isArray(categorias) &&
                        categorias.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                                {categoria.name}
                            </option>
                        ))}
                </select>
            </div>

            {produtosFiltrados.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <p>
                        {filtroNome || filtroCategoria !== ""
                            ? "Nenhum produto encontrado para os filtros aplicados."
                            : "Nenhum produto disponível."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        {produtosPaginados.map((produto) => {
                            const isSelected = isProdutoJaSelecionado(produto.product_id)
                            return (
                                <div
                                    key={produto.product_id}
                                    className={`border rounded-lg p-3 lg:p-4 transition-all duration-200 ${isSelected
                                            ? "border-green-500 bg-green-50 cursor-not-allowed shadow-sm"
                                            : "border-gray-300 bg-white cursor-pointer hover:shadow-md hover:border-red-300"
                                        }`}
                                    onClick={() => !isSelected && handleSelecionarProduto(produto)}
                                >
                                    <div className="flex flex-col h-full">
                                        <h4 className="text-sm lg:text-base font-medium text-gray-800 mb-2 line-clamp-2">
                                            {produto.name || "Nome não disponível"}
                                        </h4>
                                        <p className="text-xs lg:text-sm text-gray-600 mb-1">
                                            {produto.product_type || "Tipo não informado"}
                                        </p>
                                        {produto.description && (
                                            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{produto.description}</p>
                                        )}
                                        <div className="mt-auto">
                                            <div className="text-red-700 font-bold text-base lg:text-lg mb-2">
                                                {formatarPreco(produto.price)}
                                            </div>
                                            <div
                                                className={`text-xs font-semibold text-center rounded-full py-2 px-3 ${isSelected
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-700"
                                                    }`}
                                            >
                                                {isSelected ? (
                                                    <>
                                                        <svg className="w-3 h-3 lg:w-4 lg:h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        Selecionado
                                                    </>
                                                ) : (
                                                    "Clique para selecionar"
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {totalPaginas > 1 && (
                        <div className="flex justify-center items-center mt-6 gap-2">
                            <button
                                onClick={handlePaginaAnterior}
                                disabled={paginaAtual === 1}
                                className="px-3 lg:px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                            >
                                Anterior
                            </button>
                            <span className="px-3 lg:px-4 py-2 text-gray-700 font-medium text-sm">
                                Página {paginaAtual} de {totalPaginas}
                            </span>
                            <button
                                onClick={handleProximaPagina}
                                disabled={paginaAtual === totalPaginas}
                                className="px-3 lg:px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            )}

            {Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0 && (
                <div className="mt-6 p-3 lg:p-4 bg-green-100 border border-green-300 rounded-lg text-center">
                    <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <strong className="text-green-800 text-sm lg:text-base">
                            {produtosSelecionados.length} produto{produtosSelecionados.length !== 1 ? "s" : ""} selecionado
                            {produtosSelecionados.length !== 1 ? "s" : ""}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Step2_SelecionarProdutos
