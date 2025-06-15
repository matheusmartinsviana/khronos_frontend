import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronDown, ChevronUp, CreditCard, User } from 'lucide-react'
import { cn } from "@/lib/utils"
import type { JSX } from "react"

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

interface SaleCardProps {
    sale: Sale
    expandedSale: string | null
    setExpandedSale: (id: string | null) => void
    generatingReport: string | null
    handleGenerateReport: (sale: Sale) => void
    formatPrice: (value?: number | null) => string
    formatDate: (date: string) => string
    formatShortDate: (date: string) => string
    getStatusColor: (status: string | undefined) => string
    getPaymentMethodLabel: (method: string | null) => string
    getStatusIcon: (status: string | undefined) => JSX.Element
}

export function SaleCard({
    sale,
    expandedSale,
    setExpandedSale,
    generatingReport,
    handleGenerateReport,
    formatPrice,
    formatDate,
    formatShortDate,
    getStatusColor,
    getPaymentMethodLabel,
    getStatusIcon,
}: SaleCardProps) {
    const isExpanded = expandedSale === sale.sale_id

    return (
        <div
            className={cn(
                "p-4 border-b border-gray-100 transition-all duration-200",
                isExpanded ? "bg-gray-50" : "hover:bg-gray-50",
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarFallback className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 font-medium">
                            {sale?.Customer?.name?.charAt(0) || "C"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {sale?.Customer?.name || `Cliente #${sale?.Customer?.customer_id}`}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatShortDate(sale.date)}
                            </span>
                            <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>ID: {sale.sale_id}</span>
                        </div>
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(sale.amount)}</p>
                    <Badge variant="outline" className={cn("mt-1 gap-1 flex items-center", getStatusColor(sale.status))}>
                        {getStatusIcon(sale.status)}
                        <span>{sale.status || "Concluída"}</span>
                    </Badge>
                </div>
            </div>

            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {sale?.Salesperson?.User?.name}
                    </span>
                    <span className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        {getPaymentMethodLabel(sale.payment_method)}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn("text-xs h-8 px-2", isExpanded ? "bg-gray-100" : "")}
                    onClick={() => setExpandedSale(isExpanded ? null : sale.sale_id)}
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Ocultar
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Detalhes
                        </>
                    )}
                </Button>
            </div>

            {/* Expanded details */}
            {isExpanded && (
                <div className="mt-3 pt-3 border-t border-gray-200 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">ID da Venda:</span>
                                <span className="text-gray-600 ml-1">{sale.sale_id}</span>
                            </div>
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">Cliente:</span>
                                <span className="text-gray-600 ml-1">
                                    {sale.Customer.name || `Cliente #${sale.Customer.customer_id}`}
                                    {sale.Customer.email && ` (${sale.Customer.email})`}
                                </span>
                            </div>
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">Vendedor:</span>
                                <span className="text-gray-600 ml-1">
                                    {sale.Salesperson.User.name} ({sale.Salesperson.User.email})
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">Tipo:</span>
                                <span className="text-gray-600 ml-1 capitalize">{sale.sale_type || "venda"}</span>
                            </div>
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">Data completa:</span>
                                <span className="text-gray-600 ml-1">{formatDate(sale.date)}</span>
                            </div>
                            <div className="text-xs">
                                <span className="font-medium text-gray-700">Pagamento:</span>
                                <span className="text-gray-600 ml-1">{getPaymentMethodLabel(sale.payment_method)}</span>
                            </div>
                        </div>
                    </div>

                    {sale.ProductSales && sale.ProductSales.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs font-medium text-gray-700 mb-1">Produtos:</div>
                            <div className="bg-white rounded border border-gray-200 overflow-hidden">
                                <div className="text-xs grid grid-cols-[1fr,auto,auto] gap-2 px-2 py-1 bg-gray-50 border-b border-gray-200">
                                    <div className="font-medium">Produto</div>
                                    <div className="font-medium text-right">Qtd.</div>
                                    <div className="font-medium text-right">Preço</div>
                                </div>
                                <div className="max-h-32 overflow-y-auto">
                                    {sale.ProductSales.map((productSale, index) => (
                                        <div
                                            key={index}
                                            className="text-xs grid grid-cols-[1fr,auto,auto] gap-2 px-2 py-1.5 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="truncate">{productSale.Product?.name || `Produto ${productSale.product_id}`}</div>
                                            <div className="text-right text-gray-600">{productSale.quantity || 1}x</div>
                                            <div className="text-right font-medium">{formatPrice(productSale.product_price || 0)}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs grid grid-cols-[1fr,auto] gap-2 px-2 py-1.5 bg-gray-50 border-t border-gray-200">
                                    <div className="font-medium">Total</div>
                                    <div className="text-right font-medium">{formatPrice(sale.amount)}</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
