"use client"

import type React from "react"
import { useEffect, useState, useCallback, memo, useMemo } from "react"
import { getServices } from "@/api/service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Loader2, Wrench, Grid, List } from 'lucide-react'
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ServicoSelecionado } from "@/types"

// Tipos específicos para serviços
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
    service_id?: number // Adicionado para compatibilidade
}

interface Step3Props {
    servicosSelecionados: ServicoSelecionado[]
    onAdicionarServico: (servico: ServicoSelecionado) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

// Memoized service card component to prevent unnecessary re-renders
const ServicoCard = memo(
    ({
        servico,
        isSelected,
        onToggleSelect,
    }: {
        servico: Servico
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
                className={`transition-all duration-200 h-full cursor-pointer ${isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-red-300 hover:shadow-md"
                    }`}
                onClick={onToggleSelect}
            >
                <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-800 line-clamp-2 flex-1">{servico.name || "Nome não disponível"}</h4>
                        <Wrench className="w-4 h-4 text-red-600 ml-2 flex-shrink-0" />
                    </div>

                    <div className="space-y-1 mb-3">
                        {servico.code && <p className="text-xs text-gray-500">Código: {servico.code}</p>}
                        {servico.segment && <p className="text-sm text-blue-600 font-medium">{servico.segment}</p>}
                        {servico.description && <p className="text-xs text-gray-500 line-clamp-2">{servico.description}</p>}
                        {servico.observation && <p className="text-xs text-orange-600">⚠️ {servico.observation}</p>}
                    </div>

                    <div className="mt-auto">
                        <div className="text-red-700 font-bold text-lg mb-2">{formatarPreco(servico.price)}</div>
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

ServicoCard.displayName = "ServicoCard"

const Step3_SelecionarServicos: React.FC<Step3Props> = ({
    servicosSelecionados = [],
    onAdicionarServico,
    onShowNotification,
}) => {
    const [servicos, setServicos] = useState<Servico[]>([])
    const [segmentos, setSegmentos] = useState<string[]>([])
    const [filtroSegmento, setFiltroSegmento] = useState<string>("all")
    const [filtroNome, setFiltroNome] = useState("")
    const [filtroPreco, setFiltroPreco] = useState<string>("all")
    const [paginaAtual, setPaginaAtual] = useState(1)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
    const itensPorPagina = viewMode === "grid" ? 9 : 10
    const [servicosProcessados, setServicosProcessados] = useState<Record<number, boolean>>({})

    // Fetch services only once on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const response = await getServices()
                console.log("Serviços recebidos:", response.data)

                // Garantir que todos os serviços tenham IDs válidos
                const servicosData = Array.isArray(response.data)
                    ? response.data.map(servico => ({
                        ...servico,
                        // Garantir que product_id seja um número válido
                        product_id: servico.product_id || servico.service_id || Math.floor(Math.random() * 100000),
                        // Adicionar service_id se não existir
                        service_id: servico.service_id || servico.product_id
                    }))
                    : []

                setServicos(servicosData)

                // Extrair segmentos únicos
                const segmentosUnicos = [
                    ...new Set(
                        servicosData.map((servico) => servico.segment).filter((segment) => segment && segment.trim() !== ""),
                    ),
                ] as string[]
                setSegmentos(segmentosUnicos)
            } catch (error) {
                console.error("Erro ao carregar serviços:", error)
                onShowNotification("error", "Erro ao carregar serviços.")
                setServicos([])
                setSegmentos([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [onShowNotification])

    // Reset to first page when filters change or view mode changes
    useEffect(() => {
        setPaginaAtual(1)
    }, [filtroNome, filtroSegmento, filtroPreco, viewMode])

    // Memoize filtered services to prevent recalculation on every render
    const servicosFiltrados = useMemo(() => {
        return servicos.filter((servico) => {
            if (!servico) return false

            const matchSegmento = filtroSegmento === "all" || servico.segment === filtroSegmento
            const matchNome =
                filtroNome === "" || (servico.name && servico.name.toLowerCase().includes(filtroNome.toLowerCase()))

            let matchPreco = true
            if (filtroPreco !== "all") {
                const preco = servico.price || 0
                switch (filtroPreco) {
                    case "0-50":
                        matchPreco = preco <= 50
                        break
                    case "50-100":
                        matchPreco = preco > 50 && preco <= 100
                        break
                    case "100-200":
                        matchPreco = preco > 100 && preco <= 200
                        break
                    case "200+":
                        matchPreco = preco > 200
                        break
                }
            }

            return matchSegmento && matchNome && matchPreco
        })
    }, [servicos, filtroSegmento, filtroNome, filtroPreco])

    const totalPaginas = Math.ceil(servicosFiltrados.length / itensPorPagina)
    const servicosPaginados = servicosFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina)

    // Verificar se um serviço já está selecionado
    const isServicoJaSelecionado = useCallback(
        (servicoId: number) => {
            return (
                Array.isArray(servicosSelecionados) &&
                servicosSelecionados.some(
                    (s) => s.product_id === servicoId || s.service_id === servicoId
                )
            )
        },
        [servicosSelecionados],
    )

    // Manipular a seleção/desseleção de serviços
    const handleToggleServico = useCallback(
        (servico: Servico) => {
            // Verificar se o serviço já está selecionado
            const isSelected = isServicoJaSelecionado(servico.product_id)

            // Evitar processamento duplicado
            const processingKey = servico.product_id || servico.service_id
            if (servicosProcessados[processingKey]) {
                console.log("Serviço ainda está sendo processado:", processingKey)
                return
            }

            // Marcar como em processamento
            setServicosProcessados(prev => ({ ...prev, [processingKey]: true }))

            try {
                if (isSelected) {
                    // Remover serviço (desselecionar)
                    const servicoSelecionado = servicosSelecionados.find(
                        (s) => s.product_id === servico.product_id || s.service_id === servico.product_id
                    )

                    if (servicoSelecionado) {
                        console.log("Removendo serviço:", servico.name, servico.product_id)
                        onAdicionarServico({
                            ...servicoSelecionado,
                            _action: "remove",
                        })
                        onShowNotification("info", `${servico.name} removido da lista.`)
                    }
                } else {
                    // Adicionar serviço (selecionar)
                    console.log("Adicionando serviço:", servico.name, servico.product_id)
                    const servicoSelecionado: ServicoSelecionado = {
                        ...servico,
                        quantidade: 1,
                        zoneamento: servico.zoning || "",
                        service_id: servico.service_id || servico.product_id,
                        isService: true, // Marcar explicitamente como serviço
                    }

                    onAdicionarServico(servicoSelecionado)
                    onShowNotification("success", `${servico.name} adicionado à lista!`)
                }
            } catch (error) {
                console.error("Erro ao processar serviço:", error)
                onShowNotification("error", "Erro ao processar serviço.")
            } finally {
                // Remover a marcação de processamento após um breve delay
                setTimeout(() => {
                    setServicosProcessados(prev => {
                        const newState = { ...prev }
                        delete newState[processingKey]
                        return newState
                    })
                }, 500)
            }
        },
        [isServicoJaSelecionado, onAdicionarServico, onShowNotification, servicosSelecionados, servicosProcessados],
    )

    const formatarPreco = (valor?: number) => {
        if (typeof valor !== "number" || isNaN(valor)) {
            return "R$ 0,00"
        }
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    if (loading) {
        return (
            <div className="p-6 w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Wrench className="w-6 h-6 text-red-600 mr-2" />
                    Selecionar Serviços
                </h2>
                <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                    <Loader2 className="h-10 w-10 animate-spin mb-4 text-red-700" />
                    <p>Carregando serviços...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 w-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <Wrench className="w-6 h-6 text-red-600 mr-2" />
                    Selecionar Serviços
                </h2>
                <div className="flex items-center space-x-2">
                    <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-red-700 hover:bg-red-800" : ""}
                    >
                        <Grid className="h-4 w-4 mr-1" />
                        Grid
                    </Button>
                    <Button
                        variant={viewMode === "table" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className={viewMode === "table" ? "bg-red-700 hover:bg-red-800" : ""}
                    >
                        <List className="h-4 w-4 mr-1" />
                        Tabela
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Pesquisar serviço..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="lg:w-48">
                    <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
                        <SelectTrigger>
                            <SelectValue placeholder="Todos os segmentos" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os segmentos</SelectItem>
                            {segmentos.map((segmento) => (
                                <SelectItem key={segmento} value={segmento}>
                                    {segmento}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="lg:w-48">
                    <Select value={filtroPreco} onValueChange={setFiltroPreco}>
                        <SelectTrigger>
                            <SelectValue placeholder="Faixa de preço" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os preços</SelectItem>
                            <SelectItem value="0-50">Até R$ 50</SelectItem>
                            <SelectItem value="50-100">R$ 50 - R$ 100</SelectItem>
                            <SelectItem value="100-200">R$ 100 - R$ 200</SelectItem>
                            <SelectItem value="200+">Acima de R$ 200</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {servicosFiltrados.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>
                        {filtroNome || filtroSegmento !== "all" || filtroPreco !== "all"
                            ? "Nenhum serviço encontrado para os filtros aplicados."
                            : "Nenhum serviço disponível."}
                    </p>
                </div>
            ) : (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                            {servicosPaginados.map((servico) => (
                                <ServicoCard
                                    key={servico.product_id}
                                    servico={servico}
                                    isSelected={isServicoJaSelecionado(servico.product_id)}
                                    onToggleSelect={() => handleToggleServico(servico)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Nome</TableHead>
                                        <TableHead className="hidden md:table-cell">Código</TableHead>
                                        <TableHead className="hidden md:table-cell">Segmento</TableHead>
                                        <TableHead className="text-right">Preço</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {servicosPaginados.map((servico) => {
                                        const isSelected = isServicoJaSelecionado(servico.product_id)
                                        return (
                                            <TableRow key={servico.product_id} className={isSelected ? "bg-green-50" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => handleToggleServico(servico)}
                                                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center">
                                                        <span>{servico.name || "Nome não disponível"}</span>
                                                        {servico.observation && <span className="ml-2 text-xs text-orange-600">⚠️</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">{servico.code || "-"}</TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {servico.segment ? (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                            {servico.segment}
                                                        </span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-red-700">
                                                    {formatarPreco(servico.price)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

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

            {Array.isArray(servicosSelecionados) && servicosSelecionados.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600 mr-2" />
                        <strong className="text-green-800">
                            {servicosSelecionados.length} serviço{servicosSelecionados.length !== 1 ? "s" : ""} selecionado
                            {servicosSelecionados.length !== 1 ? "s" : ""}
                        </strong>
                    </div>
                </div>
            )}
        </div>
    )
}

export default memo(Step3_SelecionarServicos)
