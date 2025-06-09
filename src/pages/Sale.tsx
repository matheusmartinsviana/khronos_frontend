"use client"

import { useState } from "react"
import type { Cliente, ProdutoSelecionado, Venda, NotificationState } from "@/types"
import Step1_SelecionarCliente from "@/components/sale/Step1_SelecionarCliente"
import Stepper from "@/components/sale/Stepper"
import Step2_SelecionarProdutos from "@/components/sale/Step2_SelecionarProdutos"
import Step3_RevisaoProdutos from "@/components/sale/Step3_RevisaoProdutos"
import Step4_Finalizacao from "@/components/sale/Step4_Finalizacao"
import Notification from "@/components/sale/Notification"
import SalesDashboard from "@/components/sale/SalesDashboard"
import { useUser } from "@/context/UserContext"

export default function SalesPage() {
    const { user } = useUser()
    const [showSalesProcess, setShowSalesProcess] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
    const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
    const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
    const [notification, setNotification] = useState<NotificationState>({
        show: false,
        type: "info",
        message: "",
    })

    const steps = ["Selecionar Cliente", "Selecionar Produtos", "Revisar Produtos", "Finalizar Venda"]

    const showNotification = (type: "success" | "error" | "info", message: string) => {
        setNotification({
            show: true,
            type,
            message,
        })

        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }))
        }, 5000)
    }

    const handleClienteSelect = (cliente: Cliente) => {
        setClienteSelecionado(cliente)
    }

    const handleAdicionarProduto = (produto: ProdutoSelecionado) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return [...currentProducts, produto]
        })
    }

    const handleRemoverProduto = (produtoId: number) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.filter((p) => p.product_id !== produtoId)
        })
    }

    const handleAlterarQuantidade = (produtoId: number, quantidade: number) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, quantidade } : p))
        })
    }

    const handleAlterarZoneamento = (produtoId: number, zoneamento: string) => {
        setProdutosSelecionados((prev) => {
            const currentProducts = Array.isArray(prev) ? prev : []
            return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, zoneamento } : p))
        })
    }

    const handleFinalizarVenda = (venda: Venda) => {
        setVendaFinalizada(venda)
    }

    const canProceedToNextStep = () => {
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
    }

    const handleNextStep = () => {
        if (canProceedToNextStep() && currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
            window.scrollTo(0, 0)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
            window.scrollTo(0, 0)
        }
    }

    const handleIniciarNovaVenda = () => {
        setShowSalesProcess(true)
        setCurrentStep(0)
        setClienteSelecionado(null)
        setProdutosSelecionados([])
        setVendaFinalizada(null)
        showNotification("info", "Nova venda iniciada")
    }

    const handleVoltarDashboard = () => {
        setShowSalesProcess(false)
        setCurrentStep(0)
        setClienteSelecionado(null)
        setProdutosSelecionados([])
        setVendaFinalizada(null)
    }

    // Se a venda foi finalizada, mostrar tela de sucesso
    if (vendaFinalizada) {
        return (
            <div className="flex items-center justify-center p-4 h-full">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-green-600 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Venda Finalizada!</h2>
                    <p className="text-gray-600 mb-6">A venda foi processada com sucesso.</p>

                    <div className="space-y-3">
                        <button
                            onClick={() => window.print()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                                />
                            </svg>
                            Imprimir Relatório
                        </button>

                        <button
                            onClick={handleIniciarNovaVenda}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova Venda
                        </button>

                        <button
                            onClick={handleVoltarDashboard}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Voltar ao Dashboard
                        </button>
                    </div>
                </div>
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
                        <button
                            onClick={handleVoltarDashboard}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Voltar
                        </button>
                    </div>

                    <Stepper currentStep={currentStep} steps={steps} />

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
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
                            <div className="p-4 lg:p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
                                <button
                                    onClick={handlePrevStep}
                                    disabled={currentStep === 0}
                                    className="px-4 lg:px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 order-2 sm:order-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Anterior
                                </button>

                                <div className="text-sm text-gray-600 flex items-center justify-center order-1 sm:order-2">
                                    Etapa {currentStep + 1} de {steps.length}
                                </div>

                                <button
                                    onClick={handleNextStep}
                                    disabled={!canProceedToNextStep()}
                                    className="px-4 lg:px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 order-3"
                                >
                                    Próximo
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Notification notification={notification} onClose={() => setNotification((prev) => ({ ...prev, show: false }))} />
        </div>
    )
}
