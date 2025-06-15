import { useState, useEffect, useRef } from "react"
import { FileText, Eye, Calendar, CreditCard, Loader2, User, Users, Download, Search, ChevronDown, ChevronUp, X, ArrowUpDown, ChevronLeft, ChevronRight, RefreshCw, MoreHorizontal, TrendingUp, TrendingDown, Package, ShoppingCart, DollarSign, BarChart3, Activity, Clock, Target, Award, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Filter, ListFilter } from 'lucide-react'
import { getSales, getSaleById } from "@/api/sale"
import { getSalespersons } from "@/api/user"
import { getCustomers } from "@/api/customer-api"
import { getProducts } from "@/api/product"
import { downloadPDF } from "@/lib/generate-pdf"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { SaleCard } from "@/components/sale/sale-card"
import type { JSX } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useUser } from "@/context/UserContext"

interface Sale {
    sale_id: string
    amount: number
    sale_type: string
    date: string
    payment_method: string | null
    ProductSales: any[]
    Salesperson: {
        seller_id: number
        user_id: number
        User: {
            user_id: number
            name: string
            email: string
        }
    }
    Customer: {
        customer_id: number
        name: string
        email: string | null
    }
    status?: string
}

interface Salesperson {
    seller_id: number
    sales: number
    user_id: number
    category_id: number
    User: {
        user_id: number
        name: string
        email: string
    }
}

interface AdminStats {
    totalSales: number
    totalValue: number
    salesToday: number
    valueToday: number
    salesMonth: number
    valueMonth: number
    topSeller: string
    topSellerSales: number
    salesGrowth: number
    valueGrowth: number
    averageTicket: number
    totalCustomers: number
    totalProducts: number
    topProduct: string
}

export default function AdminDashboard() {
    const [sales, setSales] = useState<Sale[]>([])
    const [salespersons, setSalespersons] = useState<Salesperson[]>([])
    const [customers, setCustomers] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedSeller, setSelectedSeller] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [dateFilter, setDateFilter] = useState<string>("all")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [priceRangeFilter, setPriceRangeFilter] = useState<string>("all")
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
    const [expandedSale, setExpandedSale] = useState<string | null>(null)
    const [generatingReport, setGeneratingReport] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [sortField, setSortField] = useState<string>("date")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("sales")
    const [stats, setStats] = useState<AdminStats>({
        totalSales: 0,
        totalValue: 0,
        salesToday: 0,
        valueToday: 0,
        salesMonth: 0,
        valueMonth: 0,
        topSeller: "",
        topSellerSales: 0,
        salesGrowth: 0,
        valueGrowth: 0,
        averageTicket: 0,
        totalCustomers: 0,
        totalProducts: 0,
        topProduct: "N/A",
    })

    const { user } = useUser()
    const tableRef = useRef<HTMLDivElement>(null)
    const isMobile = useIsMobile()

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }

            // Fetch all data in parallel
            const [salesResponse, salespersonsResponse, customersResponse, productsResponse] = await Promise.all([
                getSales(),
                getSalespersons(),
                getCustomers(),
                getProducts(),
            ])

            const salesData = Array.isArray(salesResponse.data) ? salesResponse.data : []
            const salespersonsData = Array.isArray(salespersonsResponse.data) ? salespersonsResponse.data : []
            const customersData = Array.isArray(customersResponse.data) ? customersResponse.data : []
            const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : []

            setSales(salesData)
            setSalespersons(salespersonsData)
            setCustomers(customersData)
            setProducts(productsData)

            // Calculate statistics
            calculateStats(salesData, salespersonsData, customersData, productsData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const calculateStats = (
        salesData: Sale[],
        salespersonsData: Salesperson[],
        customersData: any[],
        productsData: any[],
    ) => {
        const today = new Date()
        const todayString = today.toDateString()

        // Filter sales by date
        const salesToday = salesData.filter((sale) => new Date(sale.date).toDateString() === todayString)

        // Get current month sales
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        const salesMonth = salesData.filter((sale) => {
            const saleDate = new Date(sale.date)
            return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
        })

        // Get previous month for comparison
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        const salesPrevMonth = salesData.filter((sale) => {
            const saleDate = new Date(sale.date)
            return saleDate.getMonth() === prevMonth && saleDate.getFullYear() === prevMonthYear
        })

        // Calculate growth percentages
        const salesGrowth =
            salesPrevMonth.length > 0 ? ((salesMonth.length - salesPrevMonth.length) / salesPrevMonth.length) * 100 : 0

        const valueMonth = salesMonth.reduce((sum, sale) => sum + (sale.amount || 0), 0)
        const valuePrevMonth = salesPrevMonth.reduce((sum, sale) => sum + (sale.amount || 0), 0)
        const valueGrowth = valuePrevMonth > 0 ? ((valueMonth - valuePrevMonth) / valuePrevMonth) * 100 : 0

        // Find top seller
        let topSeller = { name: "N/A", sales: 0 }
        if (salespersonsData.length > 0) {
            const topSellerData = [...salespersonsData].sort((a, b) => b.sales - a.sales)[0]
            topSeller = { name: topSellerData.User.name, sales: topSellerData.sales }
        }

        // Calculate average ticket
        const averageTicket =
            salesData.length > 0 ? salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0) / salesData.length : 0

        // Find top product (simplified)
        const topProduct = productsData.length > 0 ? productsData[0].name : "N/A"

        setStats({
            totalSales: salesData.length,
            totalValue: salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0),
            salesToday: salesToday.length,
            valueToday: salesToday.reduce((sum, sale) => sum + (sale.amount || 0), 0),
            salesMonth: salesMonth.length,
            valueMonth: valueMonth,
            topSeller: topSeller.name,
            topSellerSales: topSeller.sales,
            salesGrowth,
            valueGrowth,
            averageTicket,
            totalCustomers: customersData.length,
            totalProducts: productsData.length,
            topProduct,
        })
    }

    const formatPrice = (value?: number | null): string => {
        if (typeof value !== "number" || isNaN(value) || value === null || value === undefined) {
            return "R$ 0,00"
        }
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    }

    const formatDate = (date: string): string => {
        try {
            return new Date(date).toLocaleDateString("pt-BR", {
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

    const formatShortDate = (date: string): string => {
        try {
            return new Date(date).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            })
        } catch (error) {
            return "Data inválida"
        }
    }

    const formatPercentage = (value: number): string => {
        const sign = value >= 0 ? "+" : ""
        return `${sign}${value.toFixed(1)}%`
    }

    const getStatusColor = (status: string | undefined): string => {
        switch (status?.toLowerCase()) {
            case "concluida":
            case "concluída":
                return "bg-green-50 text-green-700 border-green-200"
            case "pendente":
                return "bg-yellow-50 text-yellow-700 border-yellow-200"
            case "cancelada":
                return "bg-red-50 text-red-700 border-red-200"
            default:
                return "bg-green-50 text-green-700 border-green-200"
        }
    }

    const getStatusIcon = (status: string | undefined): JSX.Element => {
        switch (status?.toLowerCase()) {
            case "concluida":
            case "concluída":
                return <CheckCircle2 className="h-3 w-3" />
            case "pendente":
                return <Clock className="h-3 w-3" />
            case "cancelada":
                return <XCircle className="h-3 w-3" />
            default:
                return <CheckCircle2 className="h-3 w-3" />
        }
    }

    const getPaymentMethodLabel = (method: string | null): string => {
        if (!method) return "Não informado"

        const methods: Record<string, string> = {
            dinheiro: "Dinheiro",
            cartao: "Cartão",
            pix: "PIX",
            boleto: "Boleto",
            "não informado": "Não informado",
        }
        return methods[method.toLowerCase()] || method || "Não informado"
    }

    const handleGenerateReport = async (sale: Sale) => {
        setGeneratingReport(sale.sale_id)

        try {
            // Buscar dados completos da venda
            const response = await getSaleById(sale.sale_id)
            const saleDetails = response.data

            if (!saleDetails) {
                throw new Error("Não foi possível obter os detalhes da venda")
            }

            // Converter venda para o formato do PDF e baixar
            const saleForPDF = {
                id: saleDetails.sale_id,
                customer: {
                    id: saleDetails.Customer.customer_id,
                    name: saleDetails.Customer.name || `Cliente #${saleDetails.Customer.customer_id}`,
                    email: saleDetails.Customer.email || "",
                },
                products: saleDetails.ProductSales || [],
                total: saleDetails.amount,
                date: saleDetails.date,
                payment_method: saleDetails.payment_method || "não informado",
                seller: {
                    name: saleDetails.Salesperson.User.name,
                    email: saleDetails.Salesperson.User.email,
                },
            }

            await downloadPDF(saleForPDF)
        } catch (error) {
            console.error("Error generating report:", error)
            alert("Erro ao gerar relatório. Por favor, tente novamente.")
        } finally {
            setGeneratingReport(null)
        }
    }

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDirection("asc")
        }
    }

    const handleRefresh = () => {
        fetchData(true)
    }

    const handleClearFilters = () => {
        setSelectedSeller("all")
        setDateFilter("all")
        setSearchTerm("")
        setStatusFilter("all")
        setPriceRangeFilter("all")
        setPaymentMethodFilter("all")
    }

    const filteredSales = sales.filter((sale) => {
        // Filter by seller
        if (selectedSeller !== "all" && sale.Salesperson.seller_id.toString() !== selectedSeller) {
            return false
        }

        // Filter by date
        if (dateFilter !== "all") {
            const saleDate = new Date(sale.date)
            const today = new Date()

            if (dateFilter === "today" && saleDate.toDateString() !== today.toDateString()) {
                return false
            }

            if (dateFilter === "week") {
                const weekAgo = new Date()
                weekAgo.setDate(today.getDate() - 7)
                if (saleDate < weekAgo) {
                    return false
                }
            }

            if (dateFilter === "month") {
                const monthAgo = new Date()
                monthAgo.setMonth(today.getMonth() - 1)
                if (saleDate < monthAgo) {
                    return false
                }
            }
        }

        // Filter by status
        if (statusFilter !== "all" && sale.status?.toLowerCase() !== statusFilter) {
            return false
        }

        // Filter by payment method
        if (paymentMethodFilter !== "all" && sale.payment_method?.toLowerCase() !== paymentMethodFilter) {
            return false
        }

        // Filter by price range
        if (priceRangeFilter !== "all") {
            const amount = sale.amount || 0
            if (priceRangeFilter === "under100" && amount >= 100) {
                return false
            }
            if (priceRangeFilter === "100to500" && (amount < 100 || amount > 500)) {
                return false
            }
            if (priceRangeFilter === "500to1000" && (amount < 500 || amount > 1000)) {
                return false
            }
            if (priceRangeFilter === "over1000" && amount <= 1000) {
                return false
            }
        }

        // Filter by search term
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return (
                sale.Customer?.name?.toLowerCase().includes(searchLower) ||
                sale.Salesperson.User?.name?.toLowerCase().includes(searchLower) ||
                sale.sale_id.toString().includes(searchLower)
            )
        }

        return true
    })

    // Sort the filtered sales
    const sortedSales = [...filteredSales].sort((a, b) => {
        if (sortField === "date") {
            return sortDirection === "asc"
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime()
        }

        if (sortField === "amount") {
            return sortDirection === "asc" ? (a.amount || 0) - (b.amount || 0) : (b.amount || 0) - (a.amount || 0)
        }

        if (sortField === "customer") {
            const nameA = a.Customer.name || `Cliente #${a.Customer.customer_id}`
            const nameB = b.Customer.name || `Cliente #${b.Customer.customer_id}`
            return sortDirection === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
        }

        if (sortField === "seller") {
            return sortDirection === "asc"
                ? a.Salesperson.User.name.localeCompare(b.Salesperson.User.name)
                : b.Salesperson.User.name.localeCompare(a.Salesperson.User.name)
        }

        return 0
    })

    // Pagination
    const totalPages = Math.ceil(sortedSales.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedSales = sortedSales.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top of table when changing pages
        if (tableRef.current) {
            tableRef.current.scrollTo({ top: 0, behavior: "smooth" })
        }
    }

    const hasActiveFilters =
        selectedSeller !== "all" ||
        dateFilter !== "all" ||
        searchTerm !== "" ||
        statusFilter !== "all" ||
        priceRangeFilter !== "all" ||
        paymentMethodFilter !== "all"

    // Get recent sales for dashboard
    const recentSales = [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    const getGreeting = () => {
        const hora = new Date().getHours()
        if (hora < 12) return "Bom dia"
        if (hora < 18) return "Boa tarde"
        return "Boa noite"
    }

    // Skeleton components
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

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <div className="w-full mx-auto px-4 lg:px-6 py-4 lg:py-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 w-full">
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
                                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{getGreeting()}, {user?.name || "Administrador"}! 👋</h1>
                                <p className="text-gray-600 mt-1">Painel de controle administrativo</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2"
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                >
                                    {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                    Atualizar
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                                    <div className="text-2xl font-bold">{stats.salesToday}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {stats.salesToday === 1 ? "venda realizada" : "vendas realizadas"}
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
                                    <div className="text-2xl font-bold">{formatPrice(stats.valueToday)}</div>
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
                                    <div className="text-2xl font-bold">{stats.totalCustomers}</div>
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
                                    <div className="text-2xl font-bold">{stats.totalProducts}</div>
                                    <p className="text-xs text-muted-foreground">produtos no catálogo</p>
                                </CardContent>
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                            </Card>
                        </>
                    )}
                </div>

                {/* Performance Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                                    <div className="text-2xl font-bold">{stats.salesMonth}</div>
                                    <div className="flex items-center text-xs">
                                        {stats.salesGrowth >= 0 ? (
                                            <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                                        )}
                                        <span className={stats.salesGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                                            {formatPercentage(stats.salesGrowth)}
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
                                    <div className="text-2xl font-bold">{formatPrice(stats.valueMonth)}</div>
                                    <div className="flex items-center text-xs">
                                        {stats.valueGrowth >= 0 ? (
                                            <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                                        ) : (
                                            <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                                        )}
                                        <span className={stats.valueGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                                            {formatPercentage(stats.valueGrowth)}
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
                                    <div className="text-2xl font-bold">{formatPrice(stats.averageTicket)}</div>
                                    <p className="text-xs text-muted-foreground">valor médio por venda</p>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="sales" className="mb-6" value={activeTab} onValueChange={setActiveTab}>
                    {/* <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                        <TabsTrigger value="sales" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Vendas
                        </TabsTrigger>
                        <TabsTrigger value="sellers" className="text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Vendedores
                        </TabsTrigger>
                    </TabsList> */}

                    <TabsContent value="sales">
                        {/* Dashboard Content */}
                        {activeTab === "sales" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
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
                                                </div>
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
                                                {recentSales.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                        <p className="text-lg font-medium mb-2">Nenhuma venda realizada ainda</p>
                                                        <p className="text-sm">As vendas aparecerão aqui</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {recentSales.map((sale) => (
                                                            <div
                                                                key={sale.sale_id}
                                                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                                        <ShoppingCart className="h-5 w-5 text-red-600" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">
                                                                            {sale.Customer.name || `Cliente #${sale.Customer.customer_id}`}
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">{formatDate(sale.date)}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-gray-900">{formatPrice(sale.amount || 0)}</p>
                                                                    <p className="text-sm text-gray-500 capitalize">{sale.payment_method || "N/A"}</p>
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
                                                    <span className="font-bold text-blue-600">{stats.totalSales}</span>
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
                                                    <span className="font-bold text-green-600">{formatPrice(stats.totalValue)}</span>
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <User className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">Melhor Vendedor</p>
                                                            <p className="text-xs text-gray-500">{stats.topSellerSales} vendas</p>
                                                        </div>
                                                    </div>
                                                    <span className="font-bold text-purple-600 text-sm truncate max-w-[100px]">
                                                        {stats.topSeller}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Filters */}
                        <Card className="mb-6">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                            <Input
                                                type="search"
                                                placeholder="Buscar por cliente, vendedor ou ID..."
                                                className="pl-8 border-gray-200"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        <div className="hidden md:flex gap-3">
                                            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                                                <SelectTrigger className="w-[180px] border-gray-200">
                                                    <SelectValue placeholder="Filtrar por vendedor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todos os vendedores</SelectItem>
                                                    {salespersons.map((seller) => (
                                                        <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                                                            {seller.User.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                                <SelectTrigger className="w-[180px] border-gray-200">
                                                    <SelectValue placeholder="Filtrar por data" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">Todas as datas</SelectItem>
                                                    <SelectItem value="today">Hoje</SelectItem>
                                                    <SelectItem value="week">Última semana</SelectItem>
                                                    <SelectItem value="month">Último mês</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Mobile filter button */}
                                        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" className="md:hidden flex items-center gap-2 border-gray-200">
                                                    <ListFilter className="h-4 w-4" />
                                                    Filtros
                                                    {hasActiveFilters && (
                                                        <Badge variant="secondary" className="ml-1 h-5 px-1">
                                                            {(selectedSeller !== "all" ? 1 : 0) +
                                                                (dateFilter !== "all" ? 1 : 0) +
                                                                (statusFilter !== "all" ? 1 : 0) +
                                                                (priceRangeFilter !== "all" ? 1 : 0) +
                                                                (paymentMethodFilter !== "all" ? 1 : 0)}
                                                        </Badge>
                                                    )}
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent side="bottom" className="h-[70vh]">
                                                <SheetHeader>
                                                    <SheetTitle>Filtros</SheetTitle>
                                                </SheetHeader>
                                                <div className="py-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Vendedor</label>
                                                        <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Filtrar por vendedor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Todos os vendedores</SelectItem>
                                                                {salespersons.map((seller) => (
                                                                    <SelectItem key={seller.seller_id} value={seller.seller_id.toString()}>
                                                                        {seller.User.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Período</label>
                                                        <Select value={dateFilter} onValueChange={setDateFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Filtrar por data" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Todas as datas</SelectItem>
                                                                <SelectItem value="today">Hoje</SelectItem>
                                                                <SelectItem value="week">Última semana</SelectItem>
                                                                <SelectItem value="month">Último mês</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Status</label>
                                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Filtrar por status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Todos os status</SelectItem>
                                                                <SelectItem value="concluída">Concluída</SelectItem>
                                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Método de Pagamento</label>
                                                        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Filtrar por pagamento" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Todos os métodos</SelectItem>
                                                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                                                <SelectItem value="cartao">Cartão</SelectItem>
                                                                <SelectItem value="pix">PIX</SelectItem>
                                                                <SelectItem value="boleto">Boleto</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium">Faixa de Preço</label>
                                                        <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Filtrar por valor" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="all">Todas as faixas</SelectItem>
                                                                <SelectItem value="under100">Até R$ 100</SelectItem>
                                                                <SelectItem value="100to500">R$ 100 a R$ 500</SelectItem>
                                                                <SelectItem value="500to1000">R$ 500 a R$ 1000</SelectItem>
                                                                <SelectItem value="over1000">Acima de R$ 1000</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex gap-2 pt-4">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => {
                                                                handleClearFilters()
                                                                setIsFilterOpen(false)
                                                            }}
                                                        >
                                                            Limpar
                                                        </Button>
                                                        <Button
                                                            className="flex-1 bg-red-700 hover:bg-red-800"
                                                            onClick={() => setIsFilterOpen(false)}
                                                        >
                                                            Aplicar
                                                        </Button>
                                                    </div>
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>

                                    {/* Filtros avançados desktop */}
                                    <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="border-gray-200">
                                                <SelectValue placeholder="Status da venda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os status</SelectItem>
                                                <SelectItem value="concluída">Concluída</SelectItem>
                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                <SelectItem value="cancelada">Cancelada</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                                            <SelectTrigger className="border-gray-200">
                                                <SelectValue placeholder="Método de pagamento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos os métodos</SelectItem>
                                                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                                                <SelectItem value="cartao">Cartão</SelectItem>
                                                <SelectItem value="pix">PIX</SelectItem>
                                                <SelectItem value="boleto">Boleto</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
                                            <SelectTrigger className="border-gray-200">
                                                <SelectValue placeholder="Faixa de preço" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas as faixas</SelectItem>
                                                <SelectItem value="under100">Até R$ 100</SelectItem>
                                                <SelectItem value="100to500">R$ 100 a R$ 500</SelectItem>
                                                <SelectItem value="500to1000">R$ 500 a R$ 1000</SelectItem>
                                                <SelectItem value="over1000">Acima de R$ 1000</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Active filters */}
                                    {hasActiveFilters && (
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">Filtros ativos:</span>
                                            {selectedSeller !== "all" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Vendedor:{" "}
                                                    {salespersons.find((s) => s.seller_id.toString() === selectedSeller)?.User.name ||
                                                        selectedSeller}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setSelectedSeller("all")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {dateFilter !== "all" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Período:{" "}
                                                    {dateFilter === "today" ? "Hoje" : dateFilter === "week" ? "Última semana" : "Último mês"}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setDateFilter("all")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {statusFilter !== "all" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setStatusFilter("all")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {paymentMethodFilter !== "all" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Pagamento: {getPaymentMethodLabel(paymentMethodFilter)}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setPaymentMethodFilter("all")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {priceRangeFilter !== "all" && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Valor:{" "}
                                                    {priceRangeFilter === "under100"
                                                        ? "Até R$ 100"
                                                        : priceRangeFilter === "100to500"
                                                            ? "R$ 100 a R$ 500"
                                                            : priceRangeFilter === "500to1000"
                                                                ? "R$ 500 a R$ 1000"
                                                                : "Acima de R$ 1000"}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setPriceRangeFilter("all")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            {searchTerm && (
                                                <Badge
                                                    variant="secondary"
                                                    className="flex items-center gap-1 pl-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                >
                                                    Busca: {searchTerm}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-4 w-4 ml-1 hover:bg-gray-200"
                                                        onClick={() => setSearchTerm("")}
                                                    >
                                                        <X className="h-2 w-2" />
                                                    </Button>
                                                </Badge>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs h-6 px-2 hover:bg-gray-100 text-gray-600"
                                                onClick={handleClearFilters}
                                            >
                                                Limpar todos
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sales Table */}
                        <Card className="overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500">Carregando dados...</p>
                                </div>
                            ) : filteredSales.length === 0 ? (
                                <div className="p-8 text-center">
                                    <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2 text-gray-700">Nenhuma venda encontrada</p>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                                        Não encontramos vendas com os filtros selecionados. Tente ajustar seus critérios de busca ou limpar
                                        os filtros.
                                    </p>
                                    <Button variant="outline" className="mt-4 border-gray-200" onClick={handleClearFilters}>
                                        Limpar filtros
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden lg:block">
                                        <div className="border-b border-gray-200">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <div className="text-sm text-gray-500">
                                                    Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSales.length)} de{" "}
                                                    {filteredSales.length} vendas
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={itemsPerPage.toString()}
                                                        onValueChange={(value) => {
                                                            setItemsPerPage(Number.parseInt(value))
                                                            setCurrentPage(1)
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[130px] h-8 text-xs border-gray-200">
                                                            <SelectValue placeholder="Itens por página" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="10">10 por página</SelectItem>
                                                            <SelectItem value="25">25 por página</SelectItem>
                                                            <SelectItem value="50">50 por página</SelectItem>
                                                            <SelectItem value="100">100 por página</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="max-h-[600px] overflow-auto" ref={tableRef}>
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-white shadow-sm z-10">
                                                    <TableRow>
                                                        <TableHead className="w-[80px]">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 -ml-2 font-medium"
                                                                onClick={() => handleSort("sale_id")}
                                                            >
                                                                ID
                                                                {sortField === "sale_id" && (
                                                                    <ArrowUpDown
                                                                        className={cn(
                                                                            "ml-1 h-3 w-3 inline",
                                                                            sortDirection === "asc" ? "transform rotate-180" : "",
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 -ml-2 font-medium"
                                                                onClick={() => handleSort("date")}
                                                            >
                                                                Data
                                                                {sortField === "date" && (
                                                                    <ArrowUpDown
                                                                        className={cn(
                                                                            "ml-1 h-3 w-3 inline",
                                                                            sortDirection === "asc" ? "transform rotate-180" : "",
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 -ml-2 font-medium"
                                                                onClick={() => handleSort("customer")}
                                                            >
                                                                Cliente
                                                                {sortField === "customer" && (
                                                                    <ArrowUpDown
                                                                        className={cn(
                                                                            "ml-1 h-3 w-3 inline",
                                                                            sortDirection === "asc" ? "transform rotate-180" : "",
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 -ml-2 font-medium"
                                                                onClick={() => handleSort("seller")}
                                                            >
                                                                Vendedor
                                                                {sortField === "seller" && (
                                                                    <ArrowUpDown
                                                                        className={cn(
                                                                            "ml-1 h-3 w-3 inline",
                                                                            sortDirection === "asc" ? "transform rotate-180" : "",
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 px-2 -ml-2 font-medium"
                                                                onClick={() => handleSort("amount")}
                                                            >
                                                                Valor
                                                                {sortField === "amount" && (
                                                                    <ArrowUpDown
                                                                        className={cn(
                                                                            "ml-1 h-3 w-3 inline",
                                                                            sortDirection === "asc" ? "transform rotate-180" : "",
                                                                        )}
                                                                    />
                                                                )}
                                                            </Button>
                                                        </TableHead>
                                                        <TableHead>Pagamento</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead className="text-right">Ações</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedSales.map((sale) => (
                                                        <TableRow key={sale.sale_id} className="group">
                                                            <TableCell className="font-medium">{sale.sale_id}</TableCell>
                                                            <TableCell>{formatDate(sale.date)}</TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="bg-red-100 text-red-600 text-xs">
                                                                            {sale?.Customer?.name?.charAt(0) || "C"}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="truncate">
                                                                        {sale?.Customer?.name || `Cliente #${sale?.Customer?.customer_id}`}
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="max-w-[200px]">
                                                                <div className="flex items-center gap-2">
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                                            {sale?.Salesperson?.User?.name?.charAt(0)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <span className="truncate">{sale?.Salesperson?.User?.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="font-medium">{formatPrice(sale.amount)}</TableCell>
                                                            <TableCell>{getPaymentMethodLabel(sale.payment_method)}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn("gap-1 flex items-center", getStatusColor(sale.status))}
                                                                >
                                                                    {getStatusIcon(sale.status)}
                                                                    <span>{sale.status || "Concluída"}</span>
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 px-2 text-xs"
                                                                    onClick={() => setExpandedSale(expandedSale === sale.sale_id ? null : sale.sale_id)}
                                                                >
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Ver detalhes
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="lg:hidden">
                                        <ScrollArea ref={tableRef}>
                                            {paginatedSales.map((sale) => (
                                                <SaleCard
                                                    key={sale.sale_id}
                                                    sale={sale}
                                                    expandedSale={expandedSale}
                                                    setExpandedSale={setExpandedSale}
                                                    generatingReport={generatingReport}
                                                    handleGenerateReport={handleGenerateReport}
                                                    formatPrice={formatPrice}
                                                    formatDate={formatDate}
                                                    formatShortDate={formatShortDate}
                                                    getStatusColor={getStatusColor}
                                                    getPaymentMethodLabel={getPaymentMethodLabel}
                                                    getStatusIcon={getStatusIcon}
                                                />
                                            ))}
                                        </ScrollArea>
                                    </div>
                                </>
                            )}

                            {/* Pagination */}
                            {!loading && filteredSales.length > 0 && (
                                <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200">
                                    <div className="hidden sm:block text-sm text-gray-500">
                                        Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSales.length)} de{" "}
                                        {filteredSales.length} vendas
                                    </div>
                                    <div className="flex items-center justify-center sm:justify-end gap-1 w-full sm:w-auto">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => handlePageChange(1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <ChevronLeft className="h-4 w-4 -ml-2" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>

                                        <div className="flex items-center gap-1 mx-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum
                                                if (totalPages <= 5) {
                                                    // Show all pages if 5 or fewer
                                                    pageNum = i + 1
                                                } else if (currentPage <= 3) {
                                                    // Near the start
                                                    pageNum = i + 1
                                                } else if (currentPage >= totalPages - 2) {
                                                    // Near the end
                                                    pageNum = totalPages - 4 + i
                                                } else {
                                                    // In the middle
                                                    pageNum = currentPage - 2 + i
                                                }

                                                return (
                                                    <Button
                                                        key={i}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        className={cn(
                                                            "h-8 w-8 p-0 border-gray-200",
                                                            currentPage === pageNum ? "bg-red-700 hover:bg-red-800" : "",
                                                        )}
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                )
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8 border-gray-200"
                                            onClick={() => handlePageChange(totalPages)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <ChevronRight className="h-4 w-4 -ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>

                    <TabsContent value="sellers">
                        <Card>
                            {loading ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500">Carregando dados...</p>
                                </div>
                            ) : salespersons.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium mb-2 text-gray-700">Nenhum vendedor encontrado</p>
                                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                                        Não encontramos vendedores cadastrados no sistema.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-gray-50">
                                                <TableRow>
                                                    <TableHead className="w-[80px]">ID</TableHead>
                                                    <TableHead>Vendedor</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Vendas</TableHead>
                                                    <TableHead>Performance</TableHead>
                                                    <TableHead>Categoria</TableHead>
                                                    <TableHead className="text-right">Ações</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {salespersons.map((seller) => (
                                                    <TableRow key={seller.seller_id} className="group">
                                                        <TableCell className="font-medium">{seller.seller_id}</TableCell>
                                                        <TableCell className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8 border border-gray-200">
                                                                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                                    {seller.User.name.charAt(0)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{seller.User.name}</div>
                                                                <div className="text-xs text-gray-500">ID: {seller.user_id}</div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{seller.User.email}</TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{seller.sales}</div>
                                                            <div className="text-xs text-gray-500">vendas totais</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="w-full flex items-center gap-2">
                                                                <Progress
                                                                    value={Math.min((seller.sales / 10) * 100, 100)}
                                                                    className="h-2"
                                                                    indicatorClassName={cn(
                                                                        seller.sales > 8
                                                                            ? "bg-green-500"
                                                                            : seller.sales > 5
                                                                                ? "bg-amber-500"
                                                                                : "bg-gray-400",
                                                                    )}
                                                                />
                                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                                    {Math.min((seller.sales / 10) * 100, 100).toFixed(0)}%
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                                                                Categoria {seller.category_id}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Ver detalhes</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <FileText className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Gerar relatório</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>

                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48">
                                                                        <DropdownMenuItem>
                                                                            <Eye className="h-4 w-4 mr-2" />
                                                                            Ver detalhes
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem>
                                                                            <FileText className="h-4 w-4 mr-2" />
                                                                            Ver vendas
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem>
                                                                            <FileText className="h-4 w-4 mr-2" />
                                                                            Gerar relatório
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
