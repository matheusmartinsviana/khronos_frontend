"use client"

import { useState, useCallback, useTransition } from "react"
import type { Cliente, ProdutoSelecionado, Venda, NotificationState } from "@/types"
import Step1_SelecionarCliente from "@/components/sale/Step1_SelecionarCliente"
import Stepper from "@/components/sale/Stepper"
import Step2_SelecionarProdutos from "@/components/sale/Step2_SelecionarProdutos"
import Step3_RevisaoProdutos from "@/components/sale/Step3_RevisaoProdutos"
import Step4_Finalizacao from "@/components/sale/Step4_Finalizacao"
import Notification from "@/components/sale/Notification"
import SalesDashboard from "@/components/sale/SalesDashboard"
import { useUser } from "@/context/UserContext"
import { downloadPDF, openPDFInNewTab, convertVendaForPDF } from "@/lib/generate-pdf"
import { FileText, Home, Plus, ExternalLink, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function SalesPage() {
    const { user } = useUser()
    const [showSalesProcess, setShowSalesProcess] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
    const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
    const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
    const [isPending, startTransition] = useTransition()
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        type: "info",
        message: "",
    })

    const steps = ["Selecionar Cliente", "Selecionar Produtos", "Revisar Produtos", "Finalizar Venda"]

    // Memoized notification handler to prevent unnecessary re-renders
    const showNotification = useCallback((type: "success" | "error" | "info", message: string) => {
        setNotification({
            show: true,
            type,
            message,
        })

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }))
        }, 5000)
    }, [])

    // Memoized handlers to prevent unnecessary re-renders
    const handleClienteSelect = useCallback((cliente: Cliente) => {
        setClienteSelecionado(cliente)
    }, [])

    const handleAdicionarProduto = useCallback((produto: ProdutoSelecionado) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return [...currentProducts, produto]
        })
    }, [])

    const handleRemoverProduto = useCallback((produtoId: number) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.filter((p) => p.product_id !== produtoId)
        })
    }, [])

    const handleAlterarQuantidade = useCallback((produtoId: number, quantidade: number) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, quantidade } : p))
        })
    }, [])

    const handleAlterarZoneamento = useCallback((produtoId: number, zoneamento: string) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, zoneamento } : p))
        })
    }, [])

    const handleFinalizarVenda = useCallback((venda: Venda) => {
        setVendaFinalizada(venda)
    }, [])

    const canProceedToNextStep = useCallback(() => {
        switch (currentStep) {
            case 0:
                return clienteSelecionado !== null
            case 1:
                return Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0
            case 2:
                return Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0
            case 3:
                return false // Última etapa
            default:
                return false
        }
    }, [currentStep, clienteSelecionado, produtosSelecionados])

    const handleNextStep = useCallback(() => {
        if (canProceedToNextStep() && currentStep < steps.length - 1) {
            startTransition(() => {
                setCurrentStep((prev) => prev + 1)
                window.scrollTo({ top: 0, behavior: "smooth" })
            })
        }
    }, [canProceedToNextStep, currentStep, steps.length])

    const handlePrevStep = useCallback(() => {
        if (currentStep > 0) {
            startTransition(() => {
                setCurrentStep((prev) => prev - 1)
                window.scrollTo({ top: 0, behavior: "smooth" })
            })
        }
    }, [currentStep])

    const handleIniciarNovaVenda = useCallback(() => {
        startTransition(() => {
            setShowSalesProcess(true)
            setCurrentStep(0)
            setClienteSelecionado(null)
            setProdutosSelecionados([])
            setVendaFinalizada(null)
            showNotification("info", "Nova venda iniciada")
        })
    }, [showNotification])

    const handleVoltarDashboard = useCallback(() => {
        startTransition(() => {
            setShowSalesProcess(false)
            setCurrentStep(0)
            setClienteSelecionado(null)
            setProdutosSelecionados([])
            setVendaFinalizada(null)
        })
    }, [])

    const handleGerarPDF = useCallback(() => {
        if (!vendaFinalizada || !clienteSelecionado || !user) return

        startTransition(() => {
            try {
                // Usar a função utilitária para converter os dados
                const vendaParaPDF = convertVendaForPDF(vendaFinalizada, clienteSelecionado, produtosSelecionados, user)

                // Garantir que metodoPagamento não seja undefined
                if (!vendaParaPDF.metodoPagamento) {
                    vendaParaPDF.metodoPagamento = "dinheiro"
                }

                downloadPDF(vendaParaPDF)
                showNotification("success", "Relatório gerado e baixado com sucesso!")
            } catch (error) {
                console.error("Erro ao gerar relatório:", error)
                showNotification("error", "Erro ao gerar o relatório. Tente novamente.")
            }
        })
    }, [vendaFinalizada, clienteSelecionado, produtosSelecionados, user, showNotification])

    const handleVisualizarPDF = useCallback(() => {
        if (!vendaFinalizada || !clienteSelecionado || !user) return

        try {
            // Usar a função utilitária para converter os dados
            const vendaParaPDF = convertVendaForPDF(vendaFinalizada, clienteSelecionado, produtosSelecionados, user)
            openPDFInNewTab(vendaParaPDF)
        } catch (error) {
            console.error("Erro ao visualizar relatório:", error)
            showNotification("error", "Erro ao visualizar o relatório.")
        }
    }, [vendaFinalizada, clienteSelecionado, produtosSelecionados, user, showNotification])

    // Se a venda foi finalizada, mostrar tela de sucesso
    if (vendaFinalizada) {
        return (
            <div className="flex items-center justify-center p-4 h-full">
                <Card className="max-w-md w-full">
                    <CardContent className="p-8 text-center">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Venda Finalizada!</h2>
                        <p className="text-gray-600 mb-6">A venda foi processada com sucesso.</p>

                        <div className="space-y-3">
                            <Button onClick={handleGerarPDF} disabled={isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                                {isPending ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Gerando Relatório...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Baixar Relatório
                                    </>
                                )}
                            </Button>

                            <Button onClick={handleVisualizarPDF} className="w-full bg-green-600 hover:bg-green-700">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Visualizar Relatório
                            </Button>

                            <Button onClick={handleIniciarNovaVenda} className="w-full bg-red-600 hover:bg-red-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Venda
                            </Button>

                            <Button onClick={handleVoltarDashboard} variant="outline" className="w-full">
                                <Home className="w-4 h-4 mr-2" />
                                Voltar ao Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Notification
                    notification={notification}
                    onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
                />
            </div>
        )
    }

    // Se não está no processo de venda, mostrar dashboard
    if (!showSalesProcess) {
        return (
            <div className="w-full h-full">
                <SalesDashboard onIniciarVenda={handleIniciarNovaVenda} onShowNotification={showNotification} />
                <Notification
                    notification={notification}
                    onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
                />
            </div>
        )
    }

    // Processo de venda
    return (
        <div className="w-full h-full">
            <div className="w-full h-full px-4 py-6 lg:px-6">
                <div className="w-full max-w-none">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Sistema de Vendas</h1>
                        <Button onClick={handleVoltarDashboard} variant="outline" className="gap-2">
                            <ArrowLeft className="w-4 h-4" />
                            Voltar
                        </Button>
                    </div>

                    <Stepper currentStep={currentStep} steps={steps} />

                    <Card className="w-full">
                        <CardContent className="p-0">
                            {currentStep === 0 && (
                                <Step1_SelecionarCliente
                                    onClienteSelect={handleClienteSelect}
                                    clienteSelecionado={clienteSelecionado}
                                    onShowNotification={showNotification}
                                />
                            )}

                            {currentStep === 1 && (
                                <Step2_SelecionarProdutos
                                    produtosSelecionados={produtosSelecionados}
                                    onAdicionarProduto={handleAdicionarProduto}
                                    onShowNotification={showNotification}
                                />
                            )}

                            {currentStep === 2 && (
                                <Step3_RevisaoProdutos
                                    produtos={produtosSelecionados}
                                    onRemoverProduto={handleRemoverProduto}
                                    onAlterarQuantidade={handleAlterarQuantidade}
                                    onAlterarZoneamento={handleAlterarZoneamento}
                                    onShowNotification={showNotification}
                                />
                            )}

                            {currentStep === 3 && clienteSelecionado && (
                                <Step4_Finalizacao
                                    cliente={clienteSelecionado}
                                    produtos={produtosSelecionados}
                                    onFinalizarVenda={handleFinalizarVenda}
                                    onShowNotification={showNotification}
                                />
                            )}

                            {/* Navigation Buttons */}
                            {currentStep !== 3 && (
                                <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
                                    <Button
                                        onClick={handlePrevStep}
                                        disabled={currentStep === 0}
                                        variant="outline"
                                        className="order-2 sm:order-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Anterior
                                    </Button>

                                    <div className="text-sm text-gray-600 flex items-center justify-center order-1 sm:order-2">
                                        Etapa {currentStep + 1} de {steps.length}
                                    </div>

                                    <Button
                                        onClick={handleNextStep}
                                        disabled={!canProceedToNextStep() || isPending}
                                        className="order-3 bg-red-700 hover:bg-red-800"
                                    >
                                        Próximo
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Notification notification={notification} onClose={() => setNotification((prev) => ({ ...prev, show: false }))} />
        </div>
    )
}
