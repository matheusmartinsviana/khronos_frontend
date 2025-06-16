"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getProducts, deleteProduct, getProductById, createProduct, updateProduct } from "@/api/product"
import { getCategories } from "@/api/category"
import type { Produto, Categoria } from "@/types"
import type { ProductFormData } from "@/schemas/productSchema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ProductForm from "@/components/shared/ProductForm"
import { ProductCardSkeleton } from "@/components/skeletons/product-card-skeleton"
import { ProductTableSkeleton } from "@/components/skeletons/product-table-skeleton"
import {
  TrashIcon,
  PenIcon,
  PackagePlus,
  Search,
  Loader2,
  Tag,
  Package,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Grid3X3,
  List,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const searchSchema = z.object({
  search: z.string(),
})

type SearchFormData = z.infer<typeof searchSchema>

interface FilterState {
  categories: number[]
  priceRange: [number, number]
  productTypes: string[]
  hasZoning: boolean | null
  sortBy: "name" | "price_asc" | "price_desc" | "newest"
}

type ViewMode = "grid" | "table"

export default function ProductsPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<number | null>(null)
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([])
  const [currentProduto, setCurrentProduto] = useState<Produto | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(9)
  const [totalPages, setTotalPages] = useState(1)

  // Filtros avançados
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: [0, 10000],
    productTypes: [],
    hasZoning: null,
    sortBy: "name",
  })

  // Valores para os filtros
  const [maxPrice, setMaxPrice] = useState(10000)
  const [uniqueProductTypes, setUniqueProductTypes] = useState<string[]>([])

  const searchForm = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  })

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const [prodResponse, catResponse] = await Promise.all([getProducts(), getCategories()])

      const produtosFormatados: Produto[] = Array.isArray(prodResponse.data)
        ? prodResponse.data.map((item: any) => ({
          product_id: item.product_id,
          name: item.name || "Nome não informado",
          description: item.description,
          price: item.price || 0,
          product_type: item.product_type,
          category_id: item.category_id,
          zoning: item.zoning,
          code: item.code,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }))
        : []

      const categoriasFormatadas: Categoria[] = Array.isArray(catResponse.data)
        ? catResponse.data.filter((cat) => cat && typeof cat.id === "number" && cat.name)
        : []

      // Encontrar o preço máximo para o slider
      const highestPrice = Math.max(...produtosFormatados.map((p) => p.price || 0), 1000)
      setMaxPrice(Math.ceil(highestPrice * 1.2)) // 20% a mais para margem

      // Extrair tipos de produtos únicos
      const types = [
        ...new Set(produtosFormatados.map((p) => p.product_type).filter((type) => type && type.trim() !== "")),
      ] as string[]
      setUniqueProductTypes(types)

      // Atualizar filtro de preço máximo se necessário
      setFilters((prev) => ({
        ...prev,
        priceRange: [prev.priceRange[0], Math.min(prev.priceRange[1], highestPrice)],
      }))

      setProdutos(produtosFormatados)
      setCategorias(categoriasFormatadas)

      // Aplicar filtros iniciais
      applyFilters(produtosFormatados, searchForm.getValues().search, filters)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setProdutos([])
      setCategorias([])
      setFilteredProdutos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProduto = async (produtoId: number) => {
    try {
      setEditLoading(true)
      const response = await getProductById(produtoId)
      const produto = response.data
      setCurrentProduto(produto)
    } catch (error) {
      console.error("Erro ao buscar produto:", error)
    } finally {
      setEditLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  // Efeito para atualizar a paginação quando os produtos filtrados mudam
  useEffect(() => {
    setTotalPages(Math.ceil(filteredProdutos.length / itemsPerPage))
    // Voltar para a primeira página quando os filtros mudam
    setCurrentPage(1)
  }, [filteredProdutos, itemsPerPage])

  // Ajustar itens por página baseado no modo de visualização
  useEffect(() => {
    if (viewMode === "table") {
      setItemsPerPage(10) // Tabelas geralmente mostram mais itens
    } else {
      setItemsPerPage(9) // Grid mantém o padrão
    }
  }, [viewMode])

  const applyFilters = (products: Produto[], searchTerm: string, currentFilters: FilterState) => {
    let filtered = [...products]

    // Aplicar termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (produto) =>
          produto.name?.toLowerCase().includes(term) ||
          produto.description?.toLowerCase().includes(term) ||
          produto.code?.toLowerCase().includes(term) ||
          produto.product_type?.toLowerCase().includes(term),
      )
    }

    // Filtrar por categorias
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(
        (produto) => produto.category_id && currentFilters.categories.includes(produto.category_id),
      )
    }

    // Filtrar por faixa de preço
    filtered = filtered.filter((produto) => {
      const price = produto.price || 0
      return price >= currentFilters.priceRange[0] && price <= currentFilters.priceRange[1]
    })

    // Filtrar por tipos de produto
    if (currentFilters.productTypes.length > 0) {
      filtered = filtered.filter(
        (produto) => produto.product_type && currentFilters.productTypes.includes(produto.product_type),
      )
    }

    // Filtrar por zoneamento
    if (currentFilters.hasZoning !== null) {
      filtered = filtered.filter((produto) => {
        const hasZoning = !!produto.zoning && produto.zoning.trim() !== ""
        return hasZoning === currentFilters.hasZoning
      })
    }

    // Aplicar ordenação
    switch (currentFilters.sortBy) {
      case "name":
        filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "price_asc":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price_desc":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        })
        break
    }

    setFilteredProdutos(filtered)
  }

  const onSearch = (data: SearchFormData) => {
    applyFilters(produtos, data.search, filters)
  }

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    applyFilters(produtos, searchForm.getValues().search, updatedFilters)
  }

  const resetFilters = () => {
    const defaultFilters: FilterState = {
      categories: [],
      priceRange: [0, maxPrice],
      productTypes: [],
      hasZoning: null,
      sortBy: "name",
    }
    setFilters(defaultFilters)
    applyFilters(produtos, searchForm.getValues().search, defaultFilters)
  }

  const onAdd = () => {
    setCreateDialogOpen(true)
  }

  const onEdit = async (produtoId: number) => {
    await fetchProduto(produtoId)
    setEditDialogOpen(true)
  }

  const handleOpenDeleteModal = (produtoId: number) => {
    setIdToDelete(produtoId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (idToDelete !== null) {
      try {
        await deleteProduct(idToDelete)
        await fetchProdutos()
      } catch (error) {
        console.error("Erro ao deletar produto:", error)
      }
    }
    setDeleteDialogOpen(false)
    setIdToDelete(null)
  }

  const onSubmitCreate = async (data: ProductFormData) => {
    setCreateLoading(true)

    try {
      await createProduct(data)
      setCreateDialogOpen(false)
      await fetchProdutos()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
    } finally {
      setCreateLoading(false)
    }
  }

  const onSubmitEdit = async (data: ProductFormData) => {
    if (!currentProduto?.product_id) return

    setEditLoading(true)

    try {
      await updateProduct(currentProduto.product_id, data)
      setEditDialogOpen(false)
      await fetchProdutos()
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
    } finally {
      setEditLoading(false)
    }
  }

  const formatarPreco = (valor?: number) => {
    if (typeof valor !== "number" || isNaN(valor)) {
      return "R$ 0,00"
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return "Sem categoria"
    const category = categorias.find((cat) => cat && cat.id === categoryId)
    return category ? category.name : "Categoria não encontrada"
  }

  // Funções de paginação
  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > totalPages) page = totalPages
    setCurrentPage(page)
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))

  // Obter produtos da página atual
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredProdutos.slice(startIndex, endIndex)
  }

  const currentPageItems = getCurrentPageItems()

  // Garantir que as categorias são válidas antes de renderizar
  const validCategories = Array.isArray(categorias)
    ? categorias.filter((cat) => cat && typeof cat.id === "number" && cat.name)
    : []

  // Renderizar skeleton baseado no modo de visualização
  const renderSkeleton = () => {
    if (viewMode === "grid") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      )
    } else {
      return <ProductTableSkeleton rows={itemsPerPage} />
    }
  }

  // Renderizar produtos em grid
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {currentPageItems.map((produto) => (
        <Card key={produto.product_id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <CardTitle className="text-lg">{produto.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <Tag className="h-3 w-3 mr-1" />
                  {produto.code || "Sem código"}
                </CardDescription>
              </div>
              <div className="text-lg font-bold text-red-700">{formatarPreco(produto.price)}</div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <div className="text-sm text-gray-600 line-clamp-2">{produto.description || "Sem descrição"}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                {produto.product_type && (
                  <span className="px-2 py-1 bg-gray-100 rounded-full">{produto.product_type}</span>
                )}
                {produto.category_id && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {getCategoryName(produto.category_id)}
                  </span>
                )}
                {produto.zoning && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Zona: {produto.zoning}</span>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(produto.product_id)}>
                  <PenIcon className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteModal(produto.product_id)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Renderizar produtos em tabela
  const renderTableView = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Produto</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="w-[120px]">Preço</TableHead>
            <TableHead className="w-[150px]">Categoria</TableHead>
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead className="w-[120px]">Zoneamento</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPageItems.map((produto) => (
            <TableRow key={produto.product_id}>
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{produto.name}</div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {produto.code || "Sem código"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={produto.description || "Sem descrição"}>
                  {produto.description || "Sem descrição"}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium text-red-700">{formatarPreco(produto.price)}</div>
              </TableCell>
              <TableCell>
                {produto.category_id && <Badge variant="secondary">{getCategoryName(produto.category_id)}</Badge>}
              </TableCell>
              <TableCell>{produto.product_type && <Badge variant="outline">{produto.product_type}</Badge>}</TableCell>
              <TableCell>
                {produto.zoning && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {produto.zoning}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(produto.product_id)}>
                    <PenIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleOpenDeleteModal(produto.product_id)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
            <p className="text-gray-600">Gerencie seu catálogo de produtos</p>
          </div>
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <PackagePlus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {/* Search e Filtros */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex gap-2 w-full sm:max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Pesquisar produtos..."
                  className="pl-10"
                  {...searchForm.register("search")}
                  onChange={(e) => {
                    searchForm.setValue("search", e.target.value)
                    onSearch({ search: e.target.value })
                  }}
                />
              </div>
            </form>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "bg-gray-100" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {(filters.categories.length > 0 ||
                  filters.productTypes.length > 0 ||
                  filters.hasZoning !== null ||
                  filters.sortBy !== "name") && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.categories.length +
                        filters.productTypes.length +
                        (filters.hasZoning !== null ? 1 : 0) +
                        (filters.sortBy !== "name" ? 1 : 0)}
                    </Badge>
                  )}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Itens por página" />
                </SelectTrigger>
                <SelectContent>
                  {viewMode === "grid" ? (
                    <>
                      <SelectItem value="6">6 por página</SelectItem>
                      <SelectItem value="9">9 por página</SelectItem>
                      <SelectItem value="12">12 por página</SelectItem>
                      <SelectItem value="24">24 por página</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="10">10 por página</SelectItem>
                      <SelectItem value="20">20 por página</SelectItem>
                      <SelectItem value="50">50 por página</SelectItem>
                      <SelectItem value="100">100 por página</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros avançados */}
          {showFilters && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Filtros Avançados</CardTitle>
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpar filtros
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Filtro de categorias */}
                  <div>
                    <h3 className="font-medium mb-2">Categorias</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {validCategories.map((categoria) => (
                        <div key={categoria.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${categoria.id}`}
                            checked={filters.categories.includes(categoria.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange({
                                  categories: [...filters.categories, categoria.id],
                                })
                              } else {
                                handleFilterChange({
                                  categories: filters.categories.filter((id) => id !== categoria.id),
                                })
                              }
                            }}
                          />
                          <label
                            htmlFor={`category-${categoria.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {categoria.name}
                          </label>
                        </div>
                      ))}
                      {validCategories.length === 0 && (
                        <p className="text-sm text-gray-500">Nenhuma categoria disponível</p>
                      )}
                    </div>
                  </div>

                  {/* Filtro de faixa de preço */}
                  <div>
                    <h3 className="font-medium mb-2">Faixa de Preço</h3>
                    <div className="px-2">
                      <Slider
                        defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
                        max={maxPrice}
                        step={1}
                        minStepsBetweenThumbs={1}
                        onValueChange={(value) => {
                          handleFilterChange({
                            priceRange: [value[0], value[1]],
                          })
                        }}
                        className="mb-6"
                      />
                      <div className="flex justify-between text-sm">
                        <span>{formatarPreco(filters.priceRange[0])}</span>
                        <span>{formatarPreco(filters.priceRange[1])}</span>
                      </div>
                    </div>
                  </div>

                  {/* Filtro de tipos de produto */}
                  <div>
                    <h3 className="font-medium mb-2">Tipos de Produto</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {uniqueProductTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={filters.productTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleFilterChange({
                                  productTypes: [...filters.productTypes, type],
                                })
                              } else {
                                handleFilterChange({
                                  productTypes: filters.productTypes.filter((t) => t !== type),
                                })
                              }
                            }}
                          />
                          <label
                            htmlFor={`type-${type}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                      {uniqueProductTypes.length === 0 && (
                        <p className="text-sm text-gray-500">Nenhum tipo de produto disponível</p>
                      )}
                    </div>
                  </div>

                  {/* Filtro de zoneamento */}
                  <div>
                    <h3 className="font-medium mb-2">Zoneamento</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has-zoning"
                          checked={filters.hasZoning === true}
                          onCheckedChange={(checked) => {
                            handleFilterChange({
                              hasZoning: checked ? true : null,
                            })
                          }}
                        />
                        <label
                          htmlFor="has-zoning"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Com zoneamento
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="no-zoning"
                          checked={filters.hasZoning === false}
                          onCheckedChange={(checked) => {
                            handleFilterChange({
                              hasZoning: checked ? false : null,
                            })
                          }}
                        />
                        <label
                          htmlFor="no-zoning"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Sem zoneamento
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Ordenação */}
                  <div>
                    <h3 className="font-medium mb-2">Ordenar por</h3>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value: "name" | "price_asc" | "price_desc" | "newest") => {
                        handleFilterChange({ sortBy: value })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nome (A-Z)</SelectItem>
                        <SelectItem value="price_asc">Preço (menor para maior)</SelectItem>
                        <SelectItem value="price_desc">Preço (maior para menor)</SelectItem>
                        <SelectItem value="newest">Mais recentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              {filteredProdutos.length} produto{filteredProdutos.length !== 1 ? "s" : ""} encontrado
              {filteredProdutos.length !== 1 ? "s" : ""}
              {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Visualização:</span>
              <Badge variant="outline" className="text-xs">
                {viewMode === "grid" ? "Grid" : "Tabela"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        {loading ? (
          renderSkeleton()
        ) : filteredProdutos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Package className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchForm.watch("search") ||
                Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== "name"))
                ? "Tente ajustar seus filtros ou pesquisa"
                : "Comece cadastrando seu primeiro produto"}
            </p>
            {!searchForm.watch("search") &&
              !Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== "name")) && (
                <Button onClick={onAdd}>
                  <PackagePlus className="mr-2 h-4 w-4" />
                  Cadastrar Produto
                </Button>
              )}
          </div>
        ) : (
          <>
            {viewMode === "grid" ? renderGridView() : renderTableView()}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={goToFirstPage} disabled={currentPage === 1}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToPreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1 mx-2">
                    {/* Renderizar números de página */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Lógica para mostrar páginas ao redor da página atual
                      let pageNum
                      if (totalPages <= 5) {
                        // Se tiver 5 ou menos páginas, mostrar todas
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        // Se estiver nas primeiras páginas
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        // Se estiver nas últimas páginas
                        pageNum = totalPages - 4 + i
                      } else {
                        // No meio, mostrar 2 antes e 2 depois da atual
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={goToLastPage} disabled={currentPage === totalPages}>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deseja realmente deletar este produto?</DialogTitle>
              <DialogDescription>
                Esta ação não poderá ser desfeita. Todos os dados do produto serão permanentemente removidos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog de Criação */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackagePlus className="h-5 w-5 text-red-600" />
                Cadastrar Novo Produto
              </DialogTitle>
              <DialogDescription>Preencha os dados do novo produto</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <ProductForm onSubmit={onSubmitCreate} isLoading={createLoading} categories={validCategories} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PenIcon className="h-5 w-5 text-red-600" />
                Editar Produto
              </DialogTitle>
              <DialogDescription>Atualize os dados do produto</DialogDescription>
            </DialogHeader>

            {editLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                <span className="ml-2 text-gray-600">Carregando dados do produto...</span>
              </div>
            ) : currentProduto ? (
              <div className="py-4">
                <ProductForm
                  initialData={{
                    name: currentProduto.name,
                    description: currentProduto.description || "",
                    price: currentProduto.price || 0,
                    code: currentProduto.code || "",
                    product_type: currentProduto.product_type || "",
                    category_id: currentProduto.category_id,
                    zoning: currentProduto.zoning || "",
                  }}
                  onSubmit={onSubmitEdit}
                  isLoading={editLoading}
                  categories={validCategories}
                />
              </div>
            ) : (
              <div className="text-center py-4 text-red-600">Erro ao carregar dados do produto</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
