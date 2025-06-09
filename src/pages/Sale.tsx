"use client"

import { useState } from "react"
import type { Cliente, ProdutoSelecionado, Venda } from "@/types"
import Step1_SelecionarCliente from "@/components/sale/Step1_SelecionarCliente"
import Stepper from "@/components/sale/Stepper"
import Step2_SelecionarProdutos from "@/components/sale/Step2_SelecionarProdutos"
import Step3_RevisaoProdutos from "@/components/sale/Step3_RevisaoProdutos"
import Step4_Finalizacao from "@/components/sale/Step4_Finalizacao"

export default function SalesPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
    const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
    const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)

    const steps = ["Selecionar Cliente", "Selecionar Produtos", "Revisar Produtos", "Finalizar Venda"]

    const showNotification = (type: "success" | "error" | "info", message: string) => {
        // Implementar sistema de notificação aqui
        console.log(`${type.toUpperCase()}: ${message}`)
    }

    const handleClienteSelect = (cliente: Cliente) => {
        setClienteSelecionado(cliente)
    }

    const handleAdicionarProduto = (produto: ProdutoSelecionado) => {
        setProdutosSelecionados((prev) => [...prev, produto])
    }

    const handleRemoverProduto = (produtoId: number) => {
        setProdutosSelecionados((prev) => prev.filter((p) => p.product_id !== produtoId))
    }

    const handleAlterarQuantidade = (produtoId: number, quantidade: number) => {
        setProdutosSelecionados((prev) => prev.map((p) => (p.product_id === produtoId ? { ...p, quantidade } : p)))
    }

    const handleAlterarZoneamento = (produtoId: number, zoneamento: string) => {
        setProdutosSelecionados((prev) => prev.map((p) => (p.product_id === produtoId ? { ...p, zoneamento } : p)))
    }

    const handleFinalizarVenda = (venda: Venda) => {
        setVendaFinalizada(venda)
        // Resetar o formulário ou redirecionar
        setTimeout(() => {
            setCurrentStep(0)
            setClienteSelecionado(null)
            setProdutosSelecionados([])
            setVendaFinalizada(null)
        }, 3000)
    }

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 0:
                return clienteSelecionado !== null
            case 1:
                return produtosSelecionados.length > 0
            case 2:
                return produtosSelecionados.length > 0
            case 3:
                return false // Última etapa
            default:
                return false
        }
    }

    const handleNextStep = () => {
        if (canProceedToNextStep() && currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    if (vendaFinalizada) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
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
                    <p className="text-gray-600 mb-4">A venda foi processada com sucesso. Redirecionando...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sistema de Vendas</h1>

                    <Stepper currentStep={currentStep} steps={steps} />

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
                        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={handlePrevStep}
                                disabled={currentStep === 0}
                                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                Anterior
                            </button>

                            <div className="text-sm text-gray-600 flex items-center">
                                Etapa {currentStep + 1} de {steps.length}
                            </div>

                            <button
                                onClick={handleNextStep}
                                disabled={!canProceedToNextStep() || currentStep === steps.length - 1}
                                className="px-6 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {currentStep === steps.length - 1 ? "Finalizar" : "Próximo"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
