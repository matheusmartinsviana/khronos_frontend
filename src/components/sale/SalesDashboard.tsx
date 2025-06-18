"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
    FileText,
    Eye,
    Package,
    Calendar,
    CreditCard,
    Loader2,
    BarChart3,
    DollarSign,
    Sun,
    TrendingUp,
    User,
    Wrench,
} from "lucide-react"
import { getSalesByUser } from "@/api/sale"
import { useUser } from "@/context/UserContext"
import { convertVendaForPDF, downloadPDF } from "@/lib/generate-pdf"
import type { Venda, ProdutoSelecionado } from "@/types"

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

    const [gerandoRelatorio, setGerandoRelatorio] = useState<string | null>(null)
    const [vendaExpandida, setVendaExpandida] = useState<string | null>(null)

    useEffect(() => {
        const fetchVendas = async () => {
            if (!user?.user_id) return

            try {
                setLoading(true)
                const response = await getSalesByUser(user.user_id)
                console.log("Vendas recebidas do backend:", response.data)
                const vendasData = response.data
                /*
                    "sale_id": 68,
        "amount": 1237.21,
        "sale_type": "venda",
        "date": "2025-06-16T10:55:13.203Z",
        "payment_method": "dinheiro",
        "ProductSales": [
            {cc
                "product_sale_id": 186,
                "product_price": 1200,
                "total_sales": 1200,
                "quantity": 1,
                "zoning": null,
                "Product": {
                    "product_id": 2,
                    "name": "ACIONADOR DE ACESSO EMERGENCIA - VERDE",
                    "price": 99.9,
                    "description": "sdadasdsa",
                    "image": null
                },
                "Service": {
                    "service_id": 2,
                    "name": "Mão de obra x",
                    "price": 1200,
                    "description": "instalção de camera??"
                }
            },
            {
                "product_sale_id": 185,
                "product_price": 37.21,
                "total_sales": 37,
                "quantity": 1,
                "zoning": null,
                "Product": {
                    "product_id": 42,
                    "name": "BATERIA 9V",
                    "price": 37.21,
                    "description": null,
                    "image": null
                },
                "Service": null
            }
        ],
                */

                if (vendasData.length === 0) {
                    setVendas([])
                    setStats({
                        totalVendas: 0,
                        totalValor: 0,
                        vendasHoje: 0,
                        valorHoje: 0,
                    })
                    return
                }

                const vendasMapeadas: Venda[] = vendasData.map((venda: any) => {
                    // Mapear produtos e serviços separadamente
                    const produtos = Array.isArray(venda.ProductSales)
                        ? venda.ProductSales.filter((ps: any) => ps.Product).map((ps: any) => ({
                            product_sale_id: ps.product_sale_id,
                            product_id: ps.Product.product_id,
                            name: ps.Product.name,
                            price: ps.product_price || ps.Product.price || 0,
                            quantity: ps.quantity || 1,
                            total_sales: ps.total_sales || (ps.product_price * (ps.quantity || 1)) || 0,
                            isService: false,
                            zoning: ps.zoning
                        }))
                        : [];

                    const servicos = Array.isArray(venda.ServiceSales)
                        ? venda.ServiceSales.filter((ss: any) => ss.Service).map((ss: any) => ({
                            service_sale_id: ss.service_sale_id,
                            service_id: ss.Service.service_id,
                            name: ss.Service.name,
                            price: ss.service_price || ss.Service.price || 0,
                            quantity: ss.quantity || 1,
                            total_sales: ss.total_sales || (ss.service_price * (ss.quantity || 1)) || 0,
                            isService: true,
                            zoning: ss.zoning
                        }))
                        : [];

                    return {
                        sale_id: venda.sale_id,
                        seller_id: venda.Salesperson?.seller_id || venda.seller_id,
                        customer_id: venda.Customer?.customer_id || venda.customer_id,
                        customer_name: venda.Customer?.name || "Cliente",
                        customer_email: venda.Customer?.email || "",
                        products: produtos,
                        services: servicos,
                        payment_method: venda.payment_method || "não informado",
                        total: venda.amount || 0,
                        amount: venda.amount || 0,
                        sale_type: venda.sale_type || "venda",
                        status: venda.status || "concluida",
                        date: venda.date || new Date().toISOString(),
                        observacoes: venda.observation || venda.observacoes || "",
                        seller_email: venda.Salesperson?.User?.email || user.email,
                    };
                });

                const vendasOrdenadas = vendasMapeadas.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                setVendas(vendasOrdenadas.slice(0, 10)) // Últimas 10 vendas

                // Calcular estatística
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
                onShowNotification("error", "Erro ao carregar vendas.")
                setVendas([])
                setStats({
                    totalVendas: 0,
                    totalValor: 0,
                    vendasHoje: 0,
                    valorHoje: 0,
                })
            } finally {
                setLoading(false)
            }
        }

        fetchVendas()
    }, [user?.user_id, onShowNotification, user?.email])

    const formatarPreco = (valor?: number | null): string => {
        if (typeof valor !== "number" || isNaN(valor) || valor === null || valor === undefined) {
            return "R$ 0,00"
        }
        return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const formatarData = (data: string): string => {
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

    const formatarDataMobile = (data: string): string => {
        try {
            return new Date(data).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            })
        } catch (error) {
            return "Data inválida"
        }
    }

    const getStatusColor = (status: string): string => {
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

    const getPaymentMethodLabel = (method: string): string => {
        const methods: Record<string, string> = {
            dinheiro: "Dinheiro",
            cartao: "Cartão",
            pix: "PIX",
            boleto: "Boleto",
            "não informado": "Não informado",
        }
        return methods[method?.toLowerCase()] || method || "Não informado"
    }

    const getPaymentMethodShort = (method: string): string => {
        const methods: Record<string, string> = {
            dinheiro: "Din.",
            cartao: "Cart.",
            pix: "PIX",
            boleto: "Bol.",
            "não informado": "N/I",
        }
        return methods[method?.toLowerCase()] || method?.substring(0, 4) || "N/I"
    }

    const handleGerarRelatorio = async (venda: Venda) => {
        if (!user) {
            onShowNotification("error", "Usuário não autenticado")
            return
        }

        setGerandoRelatorio(venda.sale_id)

        try {
            // Preparar os dados para o PDF
            const cliente = {
                customer_id: venda.customer_id,
                name: venda.customer_name || "Cliente",
                email: venda.customer_email || "",
            }

            // Garantir que os produtos tenham o formato correto
            const produtosFormatados = venda.products.map((produto) => ({
                ...produto,
                quantidade: produto.quantidade || produto.total_sales || 1,
                zoneamento: produto.zoneamento || "",
            }))

            // Adicionar serviços, se existirem
            const servicosFormatados = venda.services.map((servico) => ({
                ...servico,
                quantidade: servico.quantidade || servico.total_sales || 1,
                zoneamento: servico.zoneamento || "",
            }))

            const vendaParaPDF = convertVendaForPDF(venda, cliente, [...produtosFormatados, ...servicosFormatados], user)
            downloadPDF(vendaParaPDF)
            onShowNotification("success", "Relatório gerado e baixado com sucesso!")
        } catch (error) {
            console.error("Erro ao gerar relatório:", error)
            onShowNotification("error", "Erro ao gerar o relatório. Tente novamente.")
        } finally {
            setGerandoRelatorio(null)
        }
    }

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Dashboard de Vendas</h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                            Bem-vindo, <span className="font-medium">{user?.name || "Vendedor"}</span>
                        </p>
                    </div>
                    <button
                        onClick={onIniciarVenda}
                        className="w-full sm:w-auto bg-red-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg font-medium shadow-lg"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="sm:hidden">Nova Venda</span>
                        <span className="hidden sm:inline">Iniciar Nova Venda</span>
                    </button>
                </div>

                {/* Cards de Estatísticas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border-l-4 border-blue-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total de Vendas</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.totalVendas}</p>
                            </div>
                            <div className="hidden sm:block p-2 lg:p-3 bg-blue-100 rounded-full mt-2 sm:mt-0">
                                <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border-l-4 border-green-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Valor Total</p>
                                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                                    {formatarPreco(stats.totalValor)}
                                </p>
                            </div>
                            <div className="hidden sm:block p-2 lg:p-3 bg-green-100 rounded-full mt-2 sm:mt-0">
                                <DollarSign className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border-l-4 border-yellow-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Vendas Hoje</p>
                                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{stats.vendasHoje}</p>
                            </div>
                            <div className="hidden sm:block p-2 lg:p-3 bg-yellow-100 rounded-full mt-2 sm:mt-0">
                                <Sun className="w-4 h-4 lg:w-6 lg:h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border-l-4 border-purple-500">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1">
                                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Valor Hoje</p>
                                <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900">
                                    {formatarPreco(stats.valorHoje)}
                                </p>
                            </div>
                            <div className="hidden sm:block p-2 lg:p-3 bg-purple-100 rounded-full mt-2 sm:mt-0">
                                <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Últimas Vendas */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                            Últimas Vendas
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-6 sm:p-8 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                            <p className="text-sm sm:text-base text-gray-500">Carregando vendas...</p>
                        </div>
                    ) : vendas.length === 0 ? (
                        <div className="p-6 sm:p-8 text-center text-gray-500">
                            <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-base sm:text-lg font-medium mb-2">Nenhuma venda encontrada</p>
                            <p className="text-xs sm:text-sm">Inicie sua primeira venda clicando no botão acima.</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Data & Cliente
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Produtos/Serviços
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Valor & Pagamento
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vendas.map((venda) => {
                                            // Conta produtos e serviços, se quiser continuar usando
                                            const produtosCount = venda.products ? venda.products.length : 0;
                                            const servicosCount = venda.services ? venda.services.length : 0;

                                            return (
                                                <tr key={venda.sale_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        {/* Cliente e data */}
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                                    <User className="w-5 h-5 text-red-600" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {venda.customer_name || `Cliente #${venda.customer_id}`}
                                                                </div>
                                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <Calendar className="w-3 h-3" />
                                                                    {formatarData(venda.date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        {/* Quantidade de produtos e serviços */}
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-sm text-gray-900 flex items-center gap-2">
                                                                {venda.products.length > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Package className="w-3 h-3 text-blue-600" />
                                                                        {venda.products.length} produto{venda.products.length !== 1 ? "s" : ""}
                                                                    </span>
                                                                )}
                                                                {venda.services.length > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Wrench className="w-3 h-3 text-green-600" />
                                                                        {venda.services.length} serviço{venda.services.length !== 1 ? "s" : ""}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Lista produtos */}
                                                            {venda.products.length > 0 && (
                                                                <div className="text-sm text-gray-500 max-w-[200px]">
                                                                    <div><strong>Produtos:</strong></div>
                                                                    <ul>
                                                                        {venda.products.slice(0, 3).map((produto, idx) => (
                                                                            <li key={idx} className="truncate">
                                                                                {produto.name}
                                                                                {idx < venda.products.length - 1 ? "," : ""}
                                                                            </li>
                                                                        ))}
                                                                        {venda.products.length > 3 && (
                                                                            <li className="text-gray-400">+{venda.products.length - 3} mais...</li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {/* Lista serviços */}
                                                            {venda.services.length > 0 && (
                                                                <div className="text-sm text-gray-500 max-w-[200px] mt-1">
                                                                    <div><strong>Serviços:</strong></div>
                                                                    <ul>
                                                                        {venda.services.slice(0, 3).map((servico, idx) => (
                                                                            <li key={idx} className="truncate">
                                                                                {servico.name}
                                                                                {idx < venda.services.length - 1 ? "," : ""}
                                                                            </li>
                                                                        ))}
                                                                        {venda.services.length > 3 && (
                                                                            <li className="text-gray-400">+{venda.services.length - 3} mais...</li>
                                                                        )}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="text-sm font-medium text-gray-900">{formatarPreco(venda.total)}</div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <CreditCard className="w-3 h-3" />
                                                            {getPaymentMethodLabel(venda.payment_method)}
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <span
                                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(venda.status)}`}
                                                        >
                                                            {venda.status || "Concluída"}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setVendaExpandida(vendaExpandida === venda.sale_id ? null : venda.sale_id)}
                                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                                                title="Ver detalhes"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleGerarRelatorio(venda)}
                                                                disabled={gerandoRelatorio === venda.sale_id}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                                                                title="Gerar relatório"
                                                            >
                                                                {gerandoRelatorio === venda.sale_id ? (
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                ) : (
                                                                    <FileText className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden divide-y divide-gray-200">
                                {vendas.map((venda) => {
                                    const productCount = venda.products ? venda.products.length : 0
                                    const serviceCount = venda.services ? venda.services.length : 0
                                    return (
                                        <div key={venda.sale_id} className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <User className="w-5 h-5 text-red-600" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {venda.customer_name || `Cliente #${venda.customer_id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatarDataMobile(venda.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-sm font-bold text-gray-900">{formatarPreco(venda.total)}</p>
                                                    <span
                                                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                                            venda.status,
                                                        )}`}
                                                    >
                                                        {venda.status || "Concluída"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    {productCount > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Package className="w-3 h-3 text-blue-600" />
                                                            {productCount}
                                                        </span>
                                                    )}
                                                    {serviceCount > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Wrench className="w-3 h-3 text-green-600" />
                                                            {serviceCount}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" />
                                                        {getPaymentMethodShort(venda.payment_method)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={() => setVendaExpandida(vendaExpandida === venda.sale_id ? null : venda.sale_id)}
                                                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    {vendaExpandida === venda.sale_id ? "Ocultar" : "Ver detalhes"}
                                                </button>
                                                <button
                                                    onClick={() => handleGerarRelatorio(venda)}
                                                    disabled={gerandoRelatorio === venda.sale_id}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 disabled:opacity-50"
                                                >
                                                    {gerandoRelatorio === venda.sale_id ? (
                                                        <>
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Gerando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FileText className="w-3 h-3" />
                                                            Relatório
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Detalhes expandidos */}
                                            {vendaExpandida === venda.sale_id && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="space-y-2">
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-700">ID da Venda:</span>
                                                            <span className="text-gray-600 ml-1">{venda.sale_id}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-700">Cliente:</span>
                                                            <span className="text-gray-600 ml-1">
                                                                {venda.customer_name || `Cliente #${venda.customer_id}`}
                                                                {venda.customer_email && ` (${venda.customer_email})`}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-700">Vendedor:</span>
                                                            <span className="text-gray-600 ml-1">
                                                                {venda.seller_email || `ID: ${venda.seller_id}`}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-700">Tipo:</span>
                                                            <span className="text-gray-600 ml-1 capitalize">{venda.sale_type || "venda"}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="font-medium text-gray-700">Data completa:</span>
                                                            <span className="text-gray-600 ml-1">{formatarData(venda.date)}</span>
                                                        </div>
                                                        {(venda.products?.length > 0 || venda.services?.length > 0) && (
                                                            <div className="text-xs space-y-2">
                                                                {venda.products?.length > 0 && (
                                                                    <div>
                                                                        <span className="font-medium text-gray-700">Produtos:</span>
                                                                        <div className="ml-1 mt-1 space-y-1">
                                                                            {venda.products.slice(0, 3).map((product, index) => (
                                                                                <div key={index} className="text-gray-600 flex justify-between">
                                                                                    <div className="flex-1 truncate mr-2">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Package className="w-2 h-2 text-blue-600" />
                                                                                            {product.name || `Produto ${product.product_id}`}
                                                                                            <span className="text-gray-400 ml-1">
                                                                                                x{product.quantity || product.total_sales || 1}
                                                                                            </span>
                                                                                        </span>
                                                                                    </div>
                                                                                    <span>{formatarPreco(product.price || 0)}</span>
                                                                                </div>
                                                                            ))}
                                                                            {venda.products.length > 3 && (
                                                                                <div className="text-gray-500 italic">+{venda.products.length - 3} mais...</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {venda.services?.length > 0 && (
                                                                    <div>
                                                                        <span className="font-medium text-gray-700">Serviços:</span>
                                                                        <div className="ml-1 mt-1 space-y-1">
                                                                            {venda.services.slice(0, 3).map((service, index) => (
                                                                                <div key={index} className="text-gray-600 flex justify-between">
                                                                                    <div className="flex-1 truncate mr-2">
                                                                                        <span className="flex items-center gap-1">
                                                                                            <Wrench className="w-2 h-2 text-green-600" />
                                                                                            {service.name || `Serviço ${service.service_id}`}
                                                                                            <span className="text-gray-400 ml-1">
                                                                                                x{service.quantity || service.total_sales || 1}
                                                                                            </span>
                                                                                        </span>
                                                                                    </div>
                                                                                    <span>{formatarPreco(service.price || 0)}</span>
                                                                                </div>
                                                                            ))}
                                                                            {venda.services.length > 3 && (
                                                                                <div className="text-gray-500 italic">+{venda.services.length - 3} mais...</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SalesDashboard
