"use client"

import type React from "react"
import { useEffect, useState, useCallback, memo, useMemo } from "react"
import type { Produto, ProdutoSelecionado, Categoria } from "@/types"
import { getProducts, getProductsByEnvironmentId } from "@/api/product"
import { getCategories } from "@/api/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Grid, List, ShoppingCart, Package } from "lucide-react"

interface Step2Props {
    environment_id: any
    produtosSelecionados: ProdutoSelecionado[]
    onAdicionarProduto: (produto: ProdutoSelecionado) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

// Memoized product card component with improved selection UI
const ProdutoCard = memo(
    ({
        produto,
        isSelected,
        onToggleSelect,
    }: {
        produto: Produto
        isSelected: boolean
        onToggleSelect: () => void
    }) => {
        const formatarPreco = (valor?: number) => {
            if (typeof valor !== "number" || isNaN(valor)) {
                return "R$ 0,00"
            }
            return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        }

        return (
            <Card
                className={`transition-all duration-200 h-full cursor-pointer relative ${isSelected
                    ? "border-red-700 bg-red-50 shadow-md ring-1 ring-red-200"
                    : "border-gray-200 hover:border-red-300 hover:shadow-md bg-white"
                    }`}
                onClick={onToggleSelect}
            >
                {/* Selection indicator */}
                {isSelected && (
                    <div className="absolute top-2 right-2 bg-red-700 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                    </div>
                )}

                <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 line-clamp-2 flex-1 pr-2">
                            {produto.name || "Nome não disponível"}
                        </h4>
                    </div>

                    <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                            <Package className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{produto.product_type || "Tipo não informado"}</span>
                        </div>

                        {produto.description && <p className="text-xs text-gray-500 line-clamp-2">{produto.description}</p>}
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="text-red-700 font-bold text-lg">{formatarPreco(produto.price)}</div>

                        <div
                            className={`w-full text-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${isSelected ? "bg-red-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700"
                                }`}
                        >
                            {isSelected ? (
                                <span className="flex items-center justify-center">
                                    <Check className="w-4 h-4 mr-1" />
                                    Selecionado
                                </span>
                            ) : (
                                "Clique para selecionar"
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    },
)

ProdutoCard.displayName = "ProdutoCard"

const Step2_SelecionarProdutos: React.FC<Step2Props> = ({
    environment_id,
    produtosSelecionados = [],
    onAdicionarProduto,
    onShowNotification,
}) => {
    const [produtos, setProdutos] = useState<Produto[]>([])
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [filtroCategoria, setFiltroCategoria] = useState<string>("all")
    const [filtroNome, setFiltroNome] = useState("")
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
    const itensPorPagina = viewMode === "grid" ? 9 : 10

    // Fetch products and categories only once on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const [prodRes, catRes] = await Promise.all([getProductsByEnvironmentId(environment_id), getCategories()])
                setProdutos(Array.isArray(prodRes.data) ? prodRes.data : [])
                setCategorias(Array.isArray(catRes.data) ? catRes.data : [])
            } catch (error) {
                console.error("Erro ao carregar dados:", error)
                onShowNotification("error", "Erro ao carregar produtos ou categorias.")
                setProdutos([])
                setCategorias([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [onShowNotification])

    // Reset to first page when filters change or view mode changes
    useEffect(() => {
        setPaginaAtual(1)
    }, [filtroNome, filtroCategoria, viewMode])

    // Memoize filtered products to prevent recalculation on every render
    const produtosFiltrados = useMemo(() => {
        return produtos.filter((produto) => {
            if (!produto) return false

            const matchCategoria = filtroCategoria === "all" || produto.category_id === Number(filtroCategoria)
            const matchNome =
                filtroNome === "" || (produto.name && produto.name.toLowerCase().includes(filtroNome.toLowerCase()))

            return matchCategoria && matchNome
        })
    }, [produtos, filtroCategoria, filtroNome])

    const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina)
    const produtosPaginados = produtosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina)

    const isProdutoJaSelecionado = useCallback(
        (produtoId: number) => {
            return Array.isArray(produtosSelecionados) && produtosSelecionados.some((p) => p.product_id === produtoId)
        },
        [produtosSelecionados],
    )

    const handleToggleProduto = useCallback(
        (produto: Produto) => {
            if (isProdutoJaSelecionado(produto.product_id)) {
                // Remover produto (desselecionar)
                const produtoSelecionado = produtosSelecionados.find((p) => p.product_id === produto.product_id)
                if (produtoSelecionado) {
                    onAdicionarProduto({
                        ...produtoSelecionado,
                        _action: "remove",
                    })
                    onShowNotification("info", `${produto.name} removido da lista.`)
                }
            } else {
                // Adicionar produto (selecionar)
                const produtoSelecionado: ProdutoSelecionado = {
                    ...produto,
                    quantidade: 1,
                    zoneamento: produto.zoning || "",
                }

                onAdicionarProduto(produtoSelecionado)
                onShowNotification("success", `${produto.name} adicionado à lista!`)
            }
        },
        [isProdutoJaSelecionado, onAdicionarProduto, onShowNotification, produtosSelecionados],
    )

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
                <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                    <p>Carregando produtos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 w-full">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Produtos</h2>

            {/* Filters and View Toggle */}
            <div className="flex flex-col gap-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
                    <Input
                        type="text"
                        placeholder="Pesquisar produto..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full sm:max-w-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />

                    <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {Array.isArray(categorias) &&
                                categorias.map((categoria) => (
                                    <SelectItem key={categoria.id} value={String(categoria.id)}>
                                        {categoria.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    {/* View Mode Toggle */}
                    <div className="flex flex-row items-center border border-gray-300 rounded w-full sm:w-auto">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 flex-1 sm:flex-none transition-colors duration-200 ${viewMode === "grid" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            title="Visualização em Grid"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 flex-1 sm:flex-none transition-colors duration-200 ${viewMode === "table" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            title="Visualização em Tabela"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {produtosFiltrados.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    {filtroNome || filtroCategoria !== "all"
                        ? "Nenhum produto encontrado para os filtros aplicados."
                        : "Nenhum produto disponível."}
                </div>
            ) : (
                <div
                    className={`${viewMode === "grid" ? "max-h-96 lg:max-h-[500px] overflow-y-auto pr-2" : "max-h-96 lg:max-h-[500px] overflow-auto"} w-full`}
                >
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="produtos-grid">
                            {produtosPaginados.map((produto) => (
                                <ProdutoCard
                                    key={produto.product_id}
                                    produto={produto}
                                    isSelected={isProdutoJaSelecionado(produto.product_id)}
                                    onToggleSelect={() => handleToggleProduto(produto)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Seleção
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nome
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tipo
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Descrição
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {produtosPaginados.map((produto) => {
                                        const isSelected = isProdutoJaSelecionado(produto.product_id)
                                        return (
                                            <tr
                                                key={produto.product_id}
                                                className={`cursor-pointer transition-colors duration-200 ${isSelected ? "bg-red-50 border-l-4 border-l-red-700" : "hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handleToggleProduto(produto)}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        {isSelected && <Check className="w-5 h-5 text-red-700" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {produto.name || "Nome não disponível"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{produto.product_type || "Tipo não informado"}</div>
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {produto.description || "Sem descrição"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <div className="text-sm font-bold text-red-700">{formatarPreco(produto.price)}</div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {totalPaginas > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setPaginaAtual((prev) => Math.max(prev - 1, 1))}
                        disabled={paginaAtual === 1}
                        size="sm"
                    >
                        Anterior
                    </Button>
                    <span className="px-4 py-2 text-gray-700 font-medium text-sm">
                        Página {paginaAtual} de {totalPaginas}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPaginaAtual((prev) => (prev < totalPaginas ? prev + 1 : prev))}
                        disabled={paginaAtual === totalPaginas}
                        size="sm"
                    >
                        Próxima
                    </Button>
                </div>
            )}

            {/* Selected Products Summary */}
            {Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0 && (
                <div className="mt-4 p-3 rounded border border-green-300 bg-green-100 text-green-800 text-sm flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                    <span className="truncate">
                        <strong>{produtosSelecionados.length}</strong> produto{produtosSelecionados.length !== 1 ? "s" : ""}{" "}
                        selecionado{produtosSelecionados.length !== 1 ? "s" : ""}
                    </span>
                </div>
            )}
        </div>
    )
}

export default memo(Step2_SelecionarProdutos)
