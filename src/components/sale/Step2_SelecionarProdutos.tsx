"use client"

import type React from "react"
import { useEffect, useState, useCallback, memo, useMemo } from "react"
import type { Produto, ProdutoSelecionado, Categoria } from "@/types"
import { getProducts } from "@/api/product"
import { getCategories } from "@/api/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2 } from 'lucide-react'

interface Step2Props {
    produtosSelecionados: ProdutoSelecionado[]
    onAdicionarProduto: (produto: ProdutoSelecionado) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

// Memoized product card component to prevent unnecessary re-renders
const ProdutoCard = memo(
    ({
        produto,
        isSelected,
        onSelect,
    }: {
        produto: Produto
        isSelected: boolean
        onSelect: () => void
    }) => {
        const formatarPreco = (valor?: number) => {
            if (typeof valor !== "number" || isNaN(valor)) {
                return "R$ 0,00"
            }
            return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        }

        return (
            <Card
                className={`transition-all duration-200 h-full cursor-pointer ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-red-300 hover:shadow-md"
                    }`}
                onClick={!isSelected ? onSelect : undefined}
            >
                <CardContent className="p-4 flex flex-col h-full">
                    <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{produto.name || "Nome não disponível"}</h4>
                    <p className="text-sm text-gray-600 mb-1">{produto.product_type || "Tipo não informado"}</p>
                    {produto.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{produto.description}</p>}
                    <div className="mt-auto">
                        <div className="text-red-700 font-bold text-lg mb-2">{formatarPreco(produto.price)}</div>
                        <Badge
                            variant={isSelected ? "outline" : "secondary"}
                            className={`w-full justify-center py-1.5 ${isSelected ? "bg-green-100 text-green-800 hover:bg-green-100" : "hover:bg-red-50 hover:text-red-700"
                                }`}
                        >
                            {isSelected ? (
                                <span className="flex items-center">
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                    Selecionado
                                </span>
                            ) : (
                                "Clique para selecionar"
                            )}
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )
    },
)

ProdutoCard.displayName = "ProdutoCard"

const Step2_SelecionarProdutos: React.FC<Step2Props> = ({
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
    const itensPorPagina = 9

    // Fetch products and categories only once on component mount
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
                setProdutos([])
                setCategorias([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [onShowNotification])

    // Reset to first page when filters change
    useEffect(() => {
        setPaginaAtual(1)
    }, [filtroNome, filtroCategoria])

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

    const handleSelecionarProduto = useCallback(
        (produto: Produto) => {
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
        },
        [isProdutoJaSelecionado, onAdicionarProduto, onShowNotification],
    )

    if (loading) {
        return (
            <div className="p-6 w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecionar Produtos</h2>
                <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-red-700" />
                    <p>Carregando produtos...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecionar Produtos</h2>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Pesquisar produto..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="sm:w-64">
                    <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todas as categorias" />
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
                </div>
            </div>

            {produtosFiltrados.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                    <p>
                        {filtroNome || filtroCategoria !== "all"
                            ? "Nenhum produto encontrado para os filtros aplicados."
                            : "Nenhum produto disponível."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                        {produtosPaginados.map((produto) => (
                            <ProdutoCard
                                key={produto.product_id}
                                produto={produto}
                                isSelected={isProdutoJaSelecionado(produto.product_id)}
                                onSelect={() => handleSelecionarProduto(produto)}
                            />
                        ))}
                    </div>

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
                </>
            )}

            {Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        <strong className="text-green-800">
                            {produtosSelecionados.length} produto{produtosSelecionados.length !== 1 ? "s" : ""} selecionado
                            {produtosSelecionados.length !== 1 ? "s" : ""}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    )
}

export default memo(Step2_SelecionarProdutos)
