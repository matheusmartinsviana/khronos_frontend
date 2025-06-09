

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@/context/UserContext"
import { getSalesByUser } from "@/api/sale"
import type { Venda } from "@/types"

interface SalesDashboardProps {
    onIniciarVenda: () => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const SalesDashboard: React.FC<SalesDashboardProps> = ({ onIniciarVenda, onShowNotification }) => {
    const { user } = useUser()
    const [vendas, setVendas] = useState<Venda[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalVendas: 0,
        totalValor: 0,
        vendasHoje: 0,
        valorHoje: 0,
    })

    useEffect(() => {
        const fetchVendas = async () => {
            if (!user?.user_id) return

            try {
                setLoading(true)
                const response = await getSalesByUser(user.user_id)
                const vendasData = Array.isArray(response.data) ? response.data : []

                // Mapear os dados do backend para o formato esperado pelo frontend
                const vendasMapeadas = vendasData.map((venda: any) => ({
                    sale_id: venda.sale_id,
                    seller_id: venda.seller_id,
                    customer_id: venda.customer_id,
                    products: venda.ProductSales || [],
                    payment_method: venda.payment_method || "não informado",
                    total: venda.amount || 0, // Mapear 'amount' para 'total'
                    amount: venda.amount || 0,
                    sale_type: venda.sale_type || "venda",
                    status: venda.status || "concluida",
                    date: venda.date,
                    observacoes: venda.observacoes,
                }))

                // Ordenar por data mais recente
                const vendasOrdenadas = vendasMapeadas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                setVendas(vendasOrdenadas.slice(0, 10)) // Últimas 10 vendas

                // Calcular estatísticas
                const hoje = new Date().toDateString()
                const vendasHoje = vendasMapeadas.filter((venda) => new Date(venda.date).toDateString() === hoje)

                setStats({
                    totalVendas: vendasMapeadas.length,
                    totalValor: vendasMapeadas.reduce((sum, venda) => sum + (venda.total || 0), 0),
                    vendasHoje: vendasHoje.length,
                    valorHoje: vendasHoje.reduce((sum, venda) => sum + (venda.total || 0), 0),
                })
            } catch (error) {
                console.error("Erro ao buscar vendas:", error)
                onShowNotification("error", "Erro ao carregar histórico de vendas")
                setVendas([])
            } finally {
                setLoading(false)
            }
        }

        fetchVendas()
    }, [user?.user_id, onShowNotification])

    const formatarPreco = (valor?: number | null) => {
        // Verificar se o valor é válido antes de formatar
        if (typeof valor !== "number" || isNaN(valor) || valor === null || valor === undefined) {
            return "R$ 0,00"
        }
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const formatarData = (data: string) => {
        try {
            return new Date(data).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })
        } catch (error) {
            return "Data inválida"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "concluida":
                return "bg-green-100 text-green-800"
            case "pendente":
                return "bg-yellow-100 text-yellow-800"
            case "cancelada":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            dinheiro: "Dinheiro",
            cartao: "Cartão",
            pix: "PIX",
            boleto: "Boleto",
            "não informado": "Não informado",
        }
        return methods[method?.toLowerCase()] || method || "Não informado"
    }

    return (
        <div className="w-full h-full px-4 py-6 lg:px-6">
            <div className="w-full max-w-none">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Dashboard de Vendas</h1>
                        <p className="text-gray-600 mt-1">
                            Bem-vindo, <span className="font-medium">{user?.name || "Vendedor"}</span>
                        </p>
                    </div>
                    <button
                        onClick={onIniciarVenda}
                        className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors flex items-center gap-2 text-lg font-medium shadow-lg"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Iniciar Nova Venda
                    </button>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total de Vendas</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalVendas}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                                <p className="text-2xl font-bold text-gray-900">{formatarPreco(stats.totalValor)}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.vendasHoje}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Valor Hoje</p>
                                <p className="text-2xl font-bold text-gray-900">{formatarPreco(stats.valorHoje)}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Últimas Vendas */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            Últimas Vendas
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                            <p className="text-gray-500">Carregando vendas...</p>
                        </div>
                    ) : vendas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <svg
                                className="w-12 h-12 mx-auto mb-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                            <p className="text-lg font-medium mb-2">Nenhuma venda encontrada</p>
                            <p className="text-sm">Inicie sua primeira venda clicando no botão acima.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Data
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Valor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pagamento
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendas.map((venda) => (
                                        <tr key={venda.sale_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatarData(venda.date)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Cliente #{venda.customer_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {formatarPreco(venda.total)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {getPaymentMethodLabel(venda.payment_method)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venda.status)}`}
                                                >
                                                    {venda.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SalesDashboard
