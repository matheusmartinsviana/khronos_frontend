

import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import { getSalesByUser } from "@/api/sale"
import { getCustomers } from "@/api/customer-api"
import { getProducts } from "@/api/product"
import type { Venda, Cliente, Produto } from "@/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    ShoppingCart,
    DollarSign,
    BarChart3,
    Activity,
    Clock,
    Target,
    Award,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Eye,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface DashboardStats {
    totalVendas: number
    totalReceita: number
    totalClientes: number
    totalProdutos: number
    vendasHoje: number
    receitaHoje: number
    vendasMes: number
    receitaMes: number
    crescimentoVendas: number
    crescimentoReceita: number
    ticketMedio: number
    produtoMaisVendido: string
}

interface VendaRecente extends Venda {
    clienteNome?: string
}

export default function Dashboard() {
    const navigate = useNavigate()
    const { user } = useUser()
    const [stats, setStats] = useState<DashboardStats>({
        totalVendas: 0,
        totalReceita: 0,
        totalClientes: 0,
        totalProdutos: 0,
        vendasHoje: 0,
        receitaHoje: 0,
        vendasMes: 0,
        receitaMes: 0,
        crescimentoVendas: 0,
        crescimentoReceita: 0,
        ticketMedio: 0,
        produtoMaisVendido: "N/A",
    })
    const [vendasRecentes, setVendasRecentes] = useState<VendaRecente[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.user_id) return

            try {
                setLoading(true)

                // Buscar dados em paralelo
                const [vendasResponse, clientesResponse, produtosResponse] = await Promise.all([
                    getSalesByUser(user.user_id),
                    getCustomers(),
                    getProducts(),
                ])

                const vendas: Venda[] = Array.isArray(vendasResponse.data) ? vendasResponse.data : []
                const clientes: Cliente[] = Array.isArray(clientesResponse.data) ? clientesResponse.data : []
                const produtos: Produto[] = Array.isArray(produtosResponse.data) ? produtosResponse.data : []

                // Calcular estatísticas
                const hoje = new Date()
                const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
                const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
                const fimMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0)

                // Filtrar vendas por período
                const vendasHoje = vendas.filter((v) => {
                    const dataVenda = new Date(v.date)
                    return dataVenda.toDateString() === hoje.toDateString()
                })

                const vendasMes = vendas.filter((v) => {
                    const dataVenda = new Date(v.date)
                    return dataVenda >= inicioMes
                })

                const vendasMesPassado = vendas.filter((v) => {
                    const dataVenda = new Date(v.date)
                    return dataVenda >= mesPassado && dataVenda <= fimMesPassado
                })

                // Calcular receitas
                const receitaTotal = vendas.reduce((sum, v) => sum + (v.amount || 0), 0)
                const receitaHoje = vendasHoje.reduce((sum, v) => sum + (v.amount || 0), 0)
                const receitaMes = vendasMes.reduce((sum, v) => sum + (v.amount || 0), 0)
                const receitaMesPassado = vendasMesPassado.reduce((sum, v) => sum + (v.amount || 0), 0)

                // Calcular crescimentos
                const crescimentoVendas =
                    vendasMesPassado.length > 0
                        ? ((vendasMes.length - vendasMesPassado.length) / vendasMesPassado.length) * 100
                        : 0
                const crescimentoReceita =
                    receitaMesPassado > 0 ? ((receitaMes - receitaMesPassado) / receitaMesPassado) * 100 : 0

                // Ticket médio
                const ticketMedio = vendas.length > 0 ? receitaTotal / vendas.length : 0

                // Produto mais vendido (simplificado)
                const produtoMaisVendido = produtos.length > 0 ? produtos[0].name : "N/A"

                // Vendas recentes com nome do cliente
                const vendasRecentesComCliente = vendas
                    .slice(0, 5)
                    .map((venda) => {
                        const cliente = clientes.find((c) => c.customer_id === venda.customer_id)
                        return {
                            ...venda,
                            clienteNome: cliente?.name || `Cliente #${venda.customer_id}`,
                        }
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                setStats({
                    totalVendas: vendas.length,
                    totalReceita: receitaTotal,
                    totalClientes: clientes.length,
                    totalProdutos: produtos.length,
                    vendasHoje: vendasHoje.length,
                    receitaHoje,
                    vendasMes: vendasMes.length,
                    receitaMes,
                    crescimentoVendas,
                    crescimentoReceita,
                    ticketMedio,
                    produtoMaisVendido,
                })

                setVendasRecentes(vendasRecentesComCliente)
            } catch (error) {
                console.error("Erro ao buscar dados do dashboard:", error)
            } finally {
                // Simular um pequeno delay para mostrar o skeleton
                setTimeout(() => {
                    setLoading(false)
                }, 800)
            }
        }

        fetchDashboardData()
    }, [user?.user_id])

    const formatarPreco = (valor: number) => {
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatarPorcentagem = (valor: number) => {
        const sinal = valor >= 0 ? "+" : ""
        return `${sinal}${valor.toFixed(1)}%`
    }

    const getGreeting = () => {
        const hora = new Date().getHours()
        if (hora < 12) return "Bom dia"
        if (hora < 18) return "Boa tarde"
        return "Boa noite"
    }

    // Componente de Skeleton para os cards
    const CardSkeleton = () => (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-pulse">
            <div className="p-6 pb-2">
                <div className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                </div>
            </div>
            <div className="p-6 pt-2">
                <div className="h-8 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-1 w-full bg-gray-200"></div>
        </div>
    )

    // Skeleton para vendas recentes
    const VendaRecenteSkeleton = () => (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                    <div className="h-5 w-32 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
            </div>
            <div className="text-right">
                <div className="h-5 w-20 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
        </div>
    )

    // Skeleton para o resumo rápido
    const ResumoRapidoSkeleton = () => (
        <div className="space-y-4 animate-pulse">
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="h-5 w-10 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="h-5 w-16 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div>
                        <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="h-5 w-12 bg-gray-300 rounded"></div>
            </div>
            <div className="pt-4 border-t">
                <div className="h-10 w-full bg-gray-300 rounded"></div>
            </div>
        </div>
    )

    // Skeleton para ações rápidas
    const AcaoRapidaSkeleton = () => (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                <div>
                    <div className="h-5 w-24 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6 w-full">
            <div className="max-w-7xl mx-auto space-y-6 w-full">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
                    {loading ? (
                        <>
                            <div className="animate-pulse">
                                <div className="h-8 w-64 bg-gray-300 rounded mb-2"></div>
                                <div className="h-5 w-48 bg-gray-200 rounded"></div>
                            </div>
                            <div className="flex gap-3">
                                <div className="h-10 w-32 bg-gray-300 rounded"></div>
                                <div className="h-10 w-32 bg-gray-200 rounded"></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {getGreeting()}, {user?.name || "Usuário"}! 👋
                                </h1>
                                <p className="text-gray-600 mt-1">Aqui está um resumo do seu negócio hoje</p>
                            </div>
                            <div className="flex gap-3">
                                <Button onClick={() => navigate("/vendas")} className="bg-red-700 hover:bg-red-800">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nova Venda
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/produtos")}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver Produtos
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Cards de Estatísticas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full">
                    {loading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : (
                        <>
                            {/* Vendas Hoje */}
                            <Card className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.vendasHoje}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.vendasHoje === 1 ? "venda realizada" : "vendas realizadas"}
                                    </p>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            </Card>

                            {/* Receita Hoje */}
                            <Card className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatarPreco(stats.receitaHoje)}</div>
                                    <p className="text-xs text-muted-foreground">faturamento do dia</p>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                            </Card>

                            {/* Total de Clientes */}
                            <Card className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalClientes}</div>
                                    <p className="text-xs text-muted-foreground">clientes cadastrados</p>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                            </Card>

                            {/* Total de Produtos */}
                            <Card className="relative overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalProdutos}</div>
                                    <p className="text-xs text-muted-foreground">produtos no catálogo</p>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Cards de Performance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                    {loading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : (
                        <>
                            {/* Vendas do Mês */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.vendasMes}</div>
                                    <div className="flex items-center text-xs">
                                        {stats.crescimentoVendas >= 0 ? (
                                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                                        )}
                                        <span className={stats.crescimentoVendas >= 0 ? "text-green-600" : "text-red-600"}>
                                            {formatarPorcentagem(stats.crescimentoVendas)}
                                        </span>
                                        <span className="text-muted-foreground ml-1">vs mês anterior</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Receita do Mês */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatarPreco(stats.receitaMes)}</div>
                                    <div className="flex items-center text-xs">
                                        {stats.crescimentoReceita >= 0 ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                                        )}
                                        <span className={stats.crescimentoReceita >= 0 ? "text-green-600" : "text-red-600"}>
                                            {formatarPorcentagem(stats.crescimentoReceita)}
                                        </span>
                                        <span className="text-muted-foreground ml-1">vs mês anterior</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Ticket Médio */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                                    <Target className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatarPreco(stats.ticketMedio)}</div>
                                    <p className="text-xs text-muted-foreground">valor médio por venda</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Seção de Conteúdo Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full">
                    {loading ? (
                        <>
                            {/* Skeleton para Vendas Recentes */}
                            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 pb-2 animate-pulse">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-32 bg-gray-300 rounded"></div>
                                    </div>
                                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <VendaRecenteSkeleton />
                                    <VendaRecenteSkeleton />
                                    <VendaRecenteSkeleton />
                                </div>
                            </div>

                            {/* Skeleton para Resumo Rápido */}
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 pb-2 animate-pulse">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                                        <div className="h-6 w-32 bg-gray-300 rounded"></div>
                                    </div>
                                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                                </div>
                                <div className="p-6">
                                    <ResumoRapidoSkeleton />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Vendas Recentes */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-red-600" />
                                        Vendas Recentes
                                    </CardTitle>
                                    <CardDescription>Últimas vendas realizadas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {vendasRecentes.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                            <p className="text-lg font-medium mb-2">Nenhuma venda realizada ainda</p>
                                            <p className="text-sm">Suas vendas aparecerão aqui</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {vendasRecentes.map((venda) => (
                                                <div
                                                    key={venda.sale_id}
                                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                            <ShoppingCart className="h-5 w-5 text-red-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{venda.clienteNome}</p>
                                                            <p className="text-sm text-gray-500">{formatarData(venda.date)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-gray-900">{formatarPreco(venda.amount || 0)}</p>
                                                        <p className="text-sm text-gray-500 capitalize">{venda.payment_method}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Resumo Rápido */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-red-600" />
                                        Resumo Rápido
                                    </CardTitle>
                                    <CardDescription>Estatísticas importantes</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Total de Vendas</p>
                                                <p className="text-xs text-gray-500">Todas as vendas</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-blue-600">{stats.totalVendas}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Receita Total</p>
                                                <p className="text-xs text-gray-500">Faturamento geral</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-green-600">{formatarPreco(stats.totalReceita)}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <Package className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Produto Destaque</p>
                                                <p className="text-xs text-gray-500">Mais vendido</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-purple-600 text-sm truncate max-w-[100px]">
                                            {stats.produtoMaisVendido}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <Button
                                            onClick={() => navigate("/vendas")}
                                            className="w-full bg-red-700 hover:bg-red-800"
                                            size="lg"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Iniciar Nova Venda
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Cards de Ações Rápidas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {loading ? (
                        <>
                            <AcaoRapidaSkeleton />
                            <AcaoRapidaSkeleton />
                            <AcaoRapidaSkeleton />
                            <AcaoRapidaSkeleton />
                        </>
                    ) : (
                        <>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/vendas")}>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                        <ShoppingCart className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Nova Venda</p>
                                        <p className="text-sm text-gray-500">Iniciar processo</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/clientes")}>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Clientes</p>
                                        <p className="text-sm text-gray-500">Gerenciar clientes</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/produtos")}>
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                                        <Package className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Produtos</p>
                                        <p className="text-sm text-gray-500">Catálogo</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate("/relatorios")}
                            >
                                <CardContent className="flex items-center p-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <BarChart3 className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Relatórios</p>
                                        <p className="text-sm text-gray-500">Análises</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
