"use client"

import type React from "react"
import { useEffect, useState, useCallback, memo, useMemo } from "react"
import { getServices, getServicesByEnvironmentId } from "@/api/service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { ServicoSelecionado } from "@/types"
import { Check, Wrench, Grid, List } from "lucide-react"

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
    environment_id?: any
}

interface Step3Props {
    environment_id: any
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
                            {servico.name || "Nome não disponível"}
                        </h4>
                    </div>

                    <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm text-gray-600">
                            <Wrench className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{servico.product_type || "Serviço"}</span>
                        </div>

                        {servico.code && <p className="text-xs text-gray-500">Código: {servico.code}</p>}
                        {servico.segment && <p className="text-sm text-blue-600 font-medium">{servico.segment}</p>}
                        {servico.description && <p className="text-xs text-gray-500 line-clamp-2">{servico.description}</p>}
                        {servico.observation && <p className="text-xs text-orange-600">⚠️ {servico.observation}</p>}
                    </div>

                    <div className="mt-auto space-y-3">
                        <div className="text-red-700 font-bold text-lg">{formatarPreco(servico.price)}</div>

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

ServicoCard.displayName = "ServicoCard"

const Step3_SelecionarServicos: React.FC<Step3Props> = ({
    environment_id,
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
                const response = await getServicesByEnvironmentId(environment_id)
                console.log("Serviços recebidos:", response.data)

                // Garantir que todos os serviços tenham IDs válidos
                const servicosData = Array.isArray(response.data)
                    ? response.data.map((servico) => ({
                        ...servico,
                        // Garantir que product_id seja um número válido
                        product_id: servico.product_id || servico.service_id || Math.floor(Math.random() * 100000),
                        // Adicionar service_id se não existir
                        service_id: servico.service_id || servico.product_id,
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
                servicosSelecionados.some((s) => s.product_id === servicoId || s.service_id === servicoId)
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
            setServicosProcessados((prev) => ({ ...prev, [processingKey]: true }))

            try {
                if (isSelected) {
                    // Remover serviço (desselecionar)
                    const servicoSelecionado = servicosSelecionados.find(
                        (s) => s.product_id === servico.product_id || s.service_id === servico.product_id,
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
                    setServicosProcessados((prev) => {
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
            <div className="p-4 lg:p-6 w-full">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Serviços</h2>
                <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                    <p>Carregando serviços...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 lg:p-6 w-full">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Serviços</h2>

            {/* Filters and View Toggle */}
            <div className="flex flex-col gap-3 sm:flex-row mb-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <Input
                        type="text"
                        placeholder="Pesquisar serviço..."
                        value={filtroNome}
                        onChange={(e) => setFiltroNome(e.target.value)}
                        className="w-full sm:max-w-xs focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />

                    <Select value={filtroSegmento} onValueChange={setFiltroSegmento}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Segmento" />
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

                    <Select value={filtroPreco} onValueChange={setFiltroPreco}>
                        <SelectTrigger className="w-full sm:w-48">
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

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 transition-colors duration-200 flex-1 sm:flex-none ${viewMode === "grid" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        title="Visualização em Grid"
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`p-2 transition-colors duration-200 flex-1 sm:flex-none ${viewMode === "table" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                        title="Visualização em Tabela"
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {servicosFiltrados.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                    {filtroNome || filtroSegmento !== "all" || filtroPreco !== "all"
                        ? "Nenhum serviço encontrado para os filtros aplicados."
                        : "Nenhum serviço disponível."}
                </div>
            ) : (
                <div
                    className={`${viewMode === "grid"
                        ? "max-h-96 lg:max-h-[500px] overflow-y-auto pr-2"
                        : "max-h-96 lg:max-h-[500px] overflow-auto"
                        } w-full`}
                >
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                            Código
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                                            Segmento
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Preço
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {servicosPaginados.map((servico) => {
                                        const isSelected = isServicoJaSelecionado(servico.product_id)
                                        return (
                                            <tr
                                                key={servico.product_id}
                                                className={`cursor-pointer transition-colors duration-200 ${isSelected ? "bg-red-50 border-l-4 border-l-red-700" : "hover:bg-gray-50"
                                                    }`}
                                                onClick={() => handleToggleServico(servico)}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center justify-center">
                                                        {isSelected && <Check className="w-5 h-5 text-red-700" />}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {servico.name || "Nome não disponível"}
                                                        {servico.observation && <span className="ml-2 text-xs text-orange-600">⚠️</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">{servico.code || "-"}</div>
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <div className="text-sm text-gray-600 max-w-xs truncate">
                                                        {servico.segment ? (
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                                {servico.segment}
                                                            </span>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <div className="text-sm font-bold text-red-700">{formatarPreco(servico.price)}</div>
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

            {/* Selected Services Summary */}
            {Array.isArray(servicosSelecionados) && servicosSelecionados.length > 0 && (
                <div className="mt-4 p-3 rounded border border-green-300 bg-green-100 text-green-800 text-sm flex items-center">
                    <Wrench className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                    <span className="truncate">
                        <strong>{servicosSelecionados.length}</strong> serviço{servicosSelecionados.length !== 1 ? "s" : ""}{" "}
                        selecionado{servicosSelecionados.length !== 1 ? "s" : ""}
                    </span>
                </div>
            )}
        </div>
    )
}

export default memo(Step3_SelecionarServicos)
