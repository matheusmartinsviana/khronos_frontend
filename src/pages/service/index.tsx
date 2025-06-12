import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import {
    TrashIcon,
    PenIcon,
    Wrench,
    Search,
    Loader2,
    Tag,
    Settings,
    Filter,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    X,
    Save,
    FileText,
    Layers,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getServices, getServiceById, createService, updateService, deleteService } from "@/api/service"

// Tipos
interface Servico {
    product_id: number
    name: string
    code: string | null
    price: number
    description: string | null
    zoning: string | null
    product_type: string
    observation: string | null
    segment: string | null
    createdAt: string
    updatedAt: string
}

// Schema para validação do formulário
const servicoSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    code: z.string().nullable().optional(),
    price: z.number().min(0, "Preço não pode ser negativo"),
    description: z.string().nullable().optional(),
    zoning: z.string().nullable().optional(),
    product_type: z.string().default("SERVIÇOS"),
    observation: z.string().nullable().optional(),
    segment: z.string().nullable().optional(),
})

type ServicoFormData = z.infer<typeof servicoSchema>

const searchSchema = z.object({
    search: z.string(),
})

type SearchFormData = z.infer<typeof searchSchema>

interface FilterState {
    segments: string[]
    priceRange: [number, number]
    hasObservation: boolean | null
    sortBy: "name" | "price_asc" | "price_desc" | "newest"
}

// Mock API functions (replace with actual API calls)

export default function ServicosPage() {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)
    const [filteredServicos, setFilteredServicos] = useState<Servico[]>([])
    const [currentServico, setCurrentServico] = useState<Servico | null>(null)
    const [editLoading, setEditLoading] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    // Paginação
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(9)
    const [totalPages, setTotalPages] = useState(1)

    // Filtros avançados
    const [filters, setFilters] = useState<FilterState>({
        segments: [],
        priceRange: [0, 10000],
        hasObservation: null,
        sortBy: "name",
    })

    // Valores para os filtros
    const [maxPrice, setMaxPrice] = useState(10000)
    const [uniqueSegments, setUniqueSegments] = useState<string[]>([])

    const searchForm = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: "",
        },
    })

    const createForm = useForm<ServicoFormData>({
        resolver: zodResolver(servicoSchema),
        defaultValues: {
            name: "",
            code: "",
            price: 0,
            description: "",
            zoning: "",
            product_type: "SERVIÇOS",
            observation: "",
            segment: "",
        },
    })

    const editForm = useForm<ServicoFormData>({
        resolver: zodResolver(servicoSchema),
        defaultValues: {
            name: "",
            code: "",
            price: 0,
            description: "",
            zoning: "",
            product_type: "SERVIÇOS",
            observation: "",
            segment: "",
        },
    })

    const fetchServicos = async () => {
        try {
            setLoading(true)
            const response = await getServices()

            const servicosFormatados: Servico[] = Array.isArray(response.data)
                ? response.data.map((item: any) => ({
                    product_id: item.product_id,
                    name: item.name || "Nome não informado",
                    description: item.description,
                    price: item.price || 0,
                    product_type: item.product_type,
                    zoning: item.zoning,
                    code: item.code,
                    observation: item.observation,
                    segment: item.segment,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }))
                : []

            // Encontrar o preço máximo para o slider
            const highestPrice = Math.max(...servicosFormatados.map((p) => p.price || 0), 1000)
            setMaxPrice(Math.ceil(highestPrice * 1.2)) // 20% a mais para margem

            // Extrair segmentos únicos
            const segments = [
                ...new Set(servicosFormatados.map((p) => p.segment).filter((segment) => segment && segment.trim() !== "")),
            ] as string[]
            setUniqueSegments(segments)

            // Atualizar filtro de preço máximo se necessário
            setFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], Math.min(prev.priceRange[1], highestPrice)],
            }))

            setServicos(servicosFormatados)

            // Aplicar filtros iniciais
            applyFilters(servicosFormatados, searchForm.getValues().search, filters)
        } catch (error) {
            console.error("Erro ao buscar serviços:", error)
            setServicos([])
            setFilteredServicos([])
        } finally {
            setLoading(false)
        }
    }

    const fetchServico = async (servicoId: number) => {
        try {
            setEditLoading(true)
            const response = await getServiceById(servicoId.toString())
            const servico = response.data
            setCurrentServico(servico)

            // Preencher o formulário com os dados do serviço
            editForm.reset({
                name: servico.name || "",
                code: servico.code || "",
                price: servico.price || 0,
                description: servico.description || "",
                zoning: servico.zoning || "",
                product_type: servico.product_type || "SERVIÇOS",
                observation: servico.observation || "",
                segment: servico.segment || "",
            })
        } catch (error) {
            console.error("Erro ao buscar serviço:", error)
        } finally {
            setEditLoading(false)
        }
    }

    useEffect(() => {
        fetchServicos()
    }, [])

    // Efeito para atualizar a paginação quando os serviços filtrados mudam
    useEffect(() => {
        setTotalPages(Math.ceil(filteredServicos.length / itemsPerPage))
        // Voltar para a primeira página quando os filtros mudam
        setCurrentPage(1)
    }, [filteredServicos, itemsPerPage])

    const applyFilters = (services: Servico[], searchTerm: string, currentFilters: FilterState) => {
        let filtered = [...services]

        // Aplicar termo de busca
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (servico) =>
                    servico.name?.toLowerCase().includes(term) ||
                    servico.description?.toLowerCase().includes(term) ||
                    servico.code?.toLowerCase().includes(term) ||
                    servico.segment?.toLowerCase().includes(term),
            )
        }

        // Filtrar por segmentos
        if (currentFilters.segments.length > 0) {
            filtered = filtered.filter((servico) => servico.segment && currentFilters.segments.includes(servico.segment))
        }

        // Filtrar por faixa de preço
        filtered = filtered.filter((servico) => {
            const price = servico.price || 0
            return price >= currentFilters.priceRange[0] && price <= currentFilters.priceRange[1]
        })

        // Filtrar por observação
        if (currentFilters.hasObservation !== null) {
            filtered = filtered.filter((servico) => {
                const hasObservation = !!servico.observation && servico.observation.trim() !== ""
                return hasObservation === currentFilters.hasObservation
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

        setFilteredServicos(filtered)
    }

    const onSearch = (data: SearchFormData) => {
        applyFilters(servicos, data.search, filters)
    }

    const handleFilterChange = (newFilters: Partial<FilterState>) => {
        const updatedFilters = { ...filters, ...newFilters }
        setFilters(updatedFilters)
        applyFilters(servicos, searchForm.getValues().search, updatedFilters)
    }

    const resetFilters = () => {
        const defaultFilters: FilterState = {
            segments: [],
            priceRange: [0, maxPrice],
            hasObservation: null,
            sortBy: "name",
        }
        setFilters(defaultFilters)
        applyFilters(servicos, searchForm.getValues().search, defaultFilters)
    }

    const onAdd = () => {
        createForm.reset({
            name: "",
            code: "",
            price: 0,
            description: "",
            zoning: "",
            product_type: "SERVIÇOS",
            observation: "",
            segment: "",
        })
        setCreateDialogOpen(true)
    }

    const onEdit = async (servicoId: number) => {
        await fetchServico(servicoId)
        setEditDialogOpen(true)
    }

    const handleOpenDeleteModal = (servicoId: number) => {
        setIdToDelete(servicoId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (idToDelete !== null) {
            try {
                await deleteService(idToDelete.toString())
                await fetchServicos()
            } catch (error) {
                console.error("Erro ao deletar serviço:", error)
            }
        }
        setDeleteDialogOpen(false)
        setIdToDelete(null)
    }

    const onSubmitCreate = async (data: ServicoFormData) => {
        setCreateLoading(true)

        try {
            await createService(data)
            setCreateDialogOpen(false)
            await fetchServicos()
        } catch (error) {
            console.error("Erro ao salvar serviço:", error)
        } finally {
            setCreateLoading(false)
        }
    }

    const onSubmitEdit = async (data: ServicoFormData) => {
        if (!currentServico?.product_id) return

        setEditLoading(true)

        try {
            await updateService(currentServico.product_id.toString(), data)
            setEditDialogOpen(false)
            await fetchServicos()
        } catch (error) {
            console.error("Erro ao atualizar serviço:", error)
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

    // Obter serviços da página atual
    const getCurrentPageItems = () => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredServicos.slice(startIndex, endIndex)
    }

    const currentPageItems = getCurrentPageItems()

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
                        <p className="text-gray-600">Gerencie seu catálogo de serviços</p>
                    </div>
                    <Button onClick={onAdd} className="w-full sm:w-auto">
                        <Wrench className="mr-2 h-4 w-4" />
                        Novo Serviço
                    </Button>
                </div>

                {/* Search e Filtros */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex gap-2 w-full sm:max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Pesquisar serviços..."
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
                                {(filters.segments.length > 0 || filters.hasObservation !== null || filters.sortBy !== "name") && (
                                    <Badge variant="secondary" className="ml-2">
                                        {filters.segments.length +
                                            (filters.hasObservation !== null ? 1 : 0) +
                                            (filters.sortBy !== "name" ? 1 : 0)}
                                    </Badge>
                                )}
                            </Button>

                            <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Itens por página" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="6">6 por página</SelectItem>
                                    <SelectItem value="9">9 por página</SelectItem>
                                    <SelectItem value="12">12 por página</SelectItem>
                                    <SelectItem value="24">24 por página</SelectItem>
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
                                    {/* Filtro de segmentos */}
                                    <div>
                                        <h3 className="font-medium mb-2">Segmentos</h3>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                            {uniqueSegments.map((segment) => (
                                                <div key={segment} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`segment-${segment}`}
                                                        checked={filters.segments.includes(segment)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                handleFilterChange({
                                                                    segments: [...filters.segments, segment],
                                                                })
                                                            } else {
                                                                handleFilterChange({
                                                                    segments: filters.segments.filter((s) => s !== segment),
                                                                })
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`segment-${segment}`}
                                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {segment}
                                                    </label>
                                                </div>
                                            ))}
                                            {uniqueSegments.length === 0 && (
                                                <p className="text-sm text-gray-500">Nenhum segmento disponível</p>
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

                                    {/* Filtro de observação */}
                                    <div>
                                        <h3 className="font-medium mb-2">Observações</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="has-observation"
                                                    checked={filters.hasObservation === true}
                                                    onCheckedChange={(checked) => {
                                                        handleFilterChange({
                                                            hasObservation: checked ? true : null,
                                                        })
                                                    }}
                                                />
                                                <label
                                                    htmlFor="has-observation"
                                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Com observações
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="no-observation"
                                                    checked={filters.hasObservation === false}
                                                    onCheckedChange={(checked) => {
                                                        handleFilterChange({
                                                            hasObservation: checked ? false : null,
                                                        })
                                                    }}
                                                />
                                                <label
                                                    htmlFor="no-observation"
                                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                >
                                                    Sem observações
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

                    <div className="text-sm text-gray-600">
                        {filteredServicos.length} serviço{filteredServicos.length !== 1 ? "s" : ""} encontrado
                        {filteredServicos.length !== 1 ? "s" : ""}
                        {totalPages > 1 && ` • Página ${currentPage} de ${totalPages}`}
                    </div>
                </div>

                {/* Lista de Serviços */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                        <span className="ml-2 text-gray-600">Carregando serviços...</span>
                    </div>
                ) : filteredServicos.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Settings className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                        <p className="text-gray-600 mb-4">
                            {searchForm.watch("search") ||
                                Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== "name"))
                                ? "Tente ajustar seus filtros ou pesquisa"
                                : "Comece cadastrando seu primeiro serviço"}
                        </p>
                        {!searchForm.watch("search") &&
                            !Object.values(filters).some((v) => (Array.isArray(v) ? v.length > 0 : v !== null && v !== "name")) && (
                                <Button onClick={onAdd}>
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Cadastrar Serviço
                                </Button>
                            )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentPageItems.map((servico) => (
                                <Card key={servico.product_id} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">{servico.name}</CardTitle>
                                                <CardDescription className="flex items-center">
                                                    <Tag className="h-3 w-3 mr-1" />
                                                    {servico.code || "Sem código"}
                                                </CardDescription>
                                            </div>
                                            <div className="text-lg font-bold text-red-700">{formatarPreco(servico.price)}</div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-2">
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600 line-clamp-2">{servico.description || "Sem descrição"}</div>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {servico.segment && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{servico.segment}</span>
                                                )}
                                                {servico.observation && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Com observações</span>
                                                )}
                                            </div>
                                            <div className="flex justify-end gap-2 pt-2">
                                                <Button variant="outline" size="sm" onClick={() => onEdit(servico.product_id)}>
                                                    <PenIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleOpenDeleteModal(servico.product_id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

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
                            <DialogTitle>Deseja realmente deletar este serviço?</DialogTitle>
                            <DialogDescription>
                                Esta ação não poderá ser desfeita. Todos os dados do serviço serão permanentemente removidos.
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
                                <Wrench className="h-5 w-5 text-red-600" />
                                Cadastrar Novo Serviço
                            </DialogTitle>
                            <DialogDescription>Preencha os dados do novo serviço</DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <Form {...createForm}>
                                <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-6">
                                    {/* Nome e Código */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={createForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        Nome <span className="text-red-600">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Nome do serviço" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={createForm.control}
                                            name="code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Código</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Código do serviço" {...field} value={field.value || ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Preço e Segmento */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={createForm.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Preço</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={createForm.control}
                                            name="segment"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Segmento</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Segmento do serviço" {...field} value={field.value || ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Descrição */}
                                    <FormField
                                        control={createForm.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Descrição</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Descrição detalhada do serviço"
                                                        className="resize-none"
                                                        rows={3}
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Observação */}
                                    <FormField
                                        control={createForm.control}
                                        name="observation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-red-600" />
                                                    Observações
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Observações adicionais sobre o serviço"
                                                        className="resize-none"
                                                        rows={3}
                                                        {...field}
                                                        value={field.value || ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Zoneamento */}
                                    <FormField
                                        control={createForm.control}
                                        name="zoning"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Layers className="h-4 w-4 text-red-600" />
                                                    Zoneamento
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Zoneamento (se aplicável)" {...field} value={field.value || ""} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Botões */}
                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setCreateDialogOpen(false)}
                                            disabled={createLoading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={createLoading}>
                                            {createLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Salvar Serviço
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Edição */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <PenIcon className="h-5 w-5 text-red-600" />
                                Editar Serviço
                            </DialogTitle>
                            <DialogDescription>Atualize os dados do serviço</DialogDescription>
                        </DialogHeader>

                        {editLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                                <span className="ml-2 text-gray-600">Carregando dados do serviço...</span>
                            </div>
                        ) : currentServico ? (
                            <div className="py-4">
                                <Form {...editForm}>
                                    <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-6">
                                        {/* Nome e Código */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={editForm.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>
                                                            Nome <span className="text-red-600">*</span>
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nome do serviço" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={editForm.control}
                                                name="code"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Código</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Código do serviço" {...field} value={field.value || ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Preço e Segmento */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={editForm.control}
                                                name="price"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Preço</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                {...field}
                                                                onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={editForm.control}
                                                name="segment"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Segmento</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Segmento do serviço" {...field} value={field.value || ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Descrição */}
                                        <FormField
                                            control={editForm.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Descrição</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Descrição detalhada do serviço"
                                                            className="resize-none"
                                                            rows={3}
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Observação */}
                                        <FormField
                                            control={editForm.control}
                                            name="observation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                        Observações
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Observações adicionais sobre o serviço"
                                                            className="resize-none"
                                                            rows={3}
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Zoneamento */}
                                        <FormField
                                            control={editForm.control}
                                            name="zoning"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Layers className="h-4 w-4 text-red-600" />
                                                        Zoneamento
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Zoneamento (se aplicável)" {...field} value={field.value || ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Botões */}
                                        <DialogFooter className="pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setEditDialogOpen(false)}
                                                disabled={editLoading}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={editLoading}>
                                                {editLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Atualizar Serviço
                                                    </>
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-red-600">Erro ao carregar dados do serviço</div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
