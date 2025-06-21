"use client"

import { useState, useCallback, useTransition, useEffect } from "react"
import type { Cliente, ProdutoSelecionado, ServicoSelecionado, Venda, NotificationState } from "@/types"
import { downloadPDF, convertVendaForPDF } from "@/lib/generate-pdf"
import { generateReportHTML, prepareEmailData } from "@/lib/email-utils"
import { sendEmail, type EmailData } from "@/api/email"
import { FileText, Home, Plus, ArrowLeft, Menu, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSalesDraft } from "@/hooks/use-sales-draft"
import { useUser } from "@/context/UserContext"
import Notification from "@/components/sale/Notification"
import SalesDashboard from "@/components/sale/SalesDashboard"
import Stepper from "@/components/sale/Stepper"
import Step1_SelecionarCliente from "@/components/sale/Step1_SelecionarCliente"
import Step2_SelecionarProdutos from "@/components/sale/Step2_SelecionarProdutos"
import Step3_SelecionarServicos from "@/components/sale/Step3_SelecionarServicos"
import Step4_RevisaoProdutos from "@/components/sale/Step4_RevisaoProdutosEServicos"
import Step5_Finalizacao from "@/components/sale/Step5_Finalizacao"
import EmailPreviewModal from "@/components/EmailPreviewModal"

export default function SalesPage() {
  const { user } = useUser()
  const [showSalesProcess, setShowSalesProcess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [produtosSelecionados, setProdutosSelecionados] = useState<ProdutoSelecionado[]>([])
  const [servicosSelecionados, setServicosSelecionados] = useState<ServicoSelecionado[]>([])
  const [vendaFinalizada, setVendaFinalizada] = useState<Venda | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [emailPreviewData, setEmailPreviewData] = useState<EmailData | null>(null)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "info",
    message: "",
  })

  // Hook para gerenciar rascunhos - sempre ativo
  const { draft, saveDraft, clearDraft, hasDraft, getDraftInfo, deactivateDraft } = useSalesDraft()
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const steps = [
    "Selecionar Cliente",
    "Selecionar Produtos",
    "Selecionar Serviços",
    "Revisar Produtos e Serviços",
    "Finalizar Venda",
  ]

  // Restaurar estado automaticamente ao carregar a página
  useEffect(() => {
    if (!isInitialized && hasDraft() && draft) {
      setCurrentStep(draft.currentStep)
      setClienteSelecionado(draft.clienteSelecionado)
      setProdutosSelecionados(draft.produtosSelecionados)
      setServicosSelecionados(draft.servicosSelecionados)
      setShowSalesProcess(true)
      setIsInitialized(true)

      // Mostrar notificação discreta de restauração
      showNotification("info", "Continuando venda anterior...")
    } else {
      setIsInitialized(true)
    }
  }, [hasDraft, draft, isInitialized])

  // Auto-save effect - sempre ativo, salva a cada 1 segundo para ser mais responsivo
  useEffect(() => {
    if (!isInitialized) return

    const autoSaveTimer = setTimeout(() => {
      if (
        showSalesProcess &&
        (clienteSelecionado || produtosSelecionados.length > 0 || servicosSelecionados.length > 0)
      ) {
        setIsSaving(true)
        saveDraft({
          currentStep,
          clienteSelecionado,
          produtosSelecionados,
          servicosSelecionados,
          observacoes: "",
          metodoPagamento: "dinheiro",
        })

        setTimeout(() => setIsSaving(false), 300)
      }
    }, 1000) // Salva a cada 1 segundo

    return () => clearTimeout(autoSaveTimer)
  }, [
    currentStep,
    clienteSelecionado,
    produtosSelecionados,
    servicosSelecionados,
    showSalesProcess,
    saveDraft,
    isInitialized,
  ])

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

  // Função para abrir preview do email
  const handleOpenEmailPreview = useCallback(async () => {
    if (!vendaFinalizada || !clienteSelecionado || !user) {
      showNotification("error", "Dados insuficientes para gerar preview do email")
      return
    }

    // Verificar se o cliente tem email
    if (!clienteSelecionado.email) {
      showNotification("error", "Cliente não possui email cadastrado")
      return
    }

    try {
      // Gerar HTML do relatório
      const reportHTML = generateReportHTML(
        vendaFinalizada,
        clienteSelecionado,
        produtosSelecionados,
        servicosSelecionados,
        user,
      )

      // Preparar dados do email
      const emailData = prepareEmailData(
        vendaFinalizada,
        clienteSelecionado,
        produtosSelecionados,
        servicosSelecionados,
        user,
        reportHTML,
      )

      setEmailPreviewData(emailData)
      setShowEmailPreview(true)
    } catch (error) {
      console.error("Erro ao gerar preview do email:", error)
      showNotification("error", "Erro ao gerar preview do email")
    }
  }, [vendaFinalizada, clienteSelecionado, produtosSelecionados, servicosSelecionados, user, showNotification])

  // Função para confirmar envio do email
  const handleConfirmSendEmail = useCallback(async () => {
    if (!emailPreviewData) return

    setIsEmailSending(true)

    try {
      // Enviar email
      await sendEmail(emailPreviewData)

      setEmailSent(true)
      setShowEmailPreview(false)
      showNotification("success", "Email enviado com sucesso para cliente e vendedor!")
    } catch (error) {
      console.error("Erro ao enviar email:", error)
      showNotification("error", "Erro ao enviar email. Tente novamente.")
    } finally {
      setIsEmailSending(false)
    }
  }, [emailPreviewData, showNotification])

  // Função para fechar modal de preview
  const handleCloseEmailPreview = useCallback(() => {
    setShowEmailPreview(false)
    setEmailPreviewData(null)
  }, [])

  // Memoized handlers to prevent unnecessary re-renders
  const handleClienteSelect = useCallback((cliente: Cliente) => {
    setClienteSelecionado(cliente)
  }, [])

  const handleAdicionarProduto = useCallback((produto: ProdutoSelecionado) => {
    // Verificar se é uma ação de remoção (toggle)
    if (produto._action === "remove") {
      setProdutosSelecionados((prev) => {
        const currentProducts = Array.isArray(prev) ? prev : []
        return currentProducts.filter((p) => p.product_id !== produto.product_id)
      })
      return
    }

    setProdutosSelecionados((prev) => {
      const currentProducts = Array.isArray(prev) ? prev : []
      return [...currentProducts, produto]
    })
  }, [])

  const handleAdicionarServico = useCallback((servico: ServicoSelecionado) => {
    console.log("handleAdicionarServico chamado com:", servico)

    // Verificar se é uma ação de remoção (toggle)
    if (servico._action === "remove") {
      console.log("Removendo serviço:", servico.product_id || servico.service_id)
      setServicosSelecionados((prev) => {
        const currentServices = Array.isArray(prev) ? prev : []
        return currentServices.filter((s) => s.product_id !== servico.product_id && s.service_id !== servico.product_id)
      })
      return
    }

    // Garantir que o serviço tenha a flag isService
    const servicoComFlag = {
      ...servico,
      isService: true,
      service_id: servico.service_id || servico.product_id,
    }

    console.log("Adicionando serviço:", servicoComFlag)
    setServicosSelecionados((prev) => {
      const currentServices = Array.isArray(prev) ? prev : []
      return [...currentServices, servicoComFlag]
    })
  }, [])

  const handleRemoverProduto = useCallback((produtoId: number) => {
    setProdutosSelecionados((prev) => {
      const currentProducts = Array.isArray(prev) ? prev : []
      return currentProducts.filter((p) => p.product_id !== produtoId)
    })
  }, [])

  const handleRemoverServico = useCallback((servicoId: number) => {
    setServicosSelecionados((prev) => {
      const currentServices = Array.isArray(prev) ? prev : []
      return currentServices.filter((s) => s.product_id !== servicoId && s.service_id !== servicoId)
    })
  }, [])

  const handleAlterarQuantidade = useCallback(
    (produtoId: number, quantidade: number, tipo: "produto" | "servico" = "produto") => {
      if (tipo === "produto") {
        setProdutosSelecionados((prev) => {
          const currentProducts = Array.isArray(prev) ? prev : []
          return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, quantidade } : p))
        })
      } else {
        setServicosSelecionados((prev) => {
          const currentServices = Array.isArray(prev) ? prev : []
          return currentServices.map((s) =>
            s.product_id === produtoId || s.service_id === produtoId ? { ...s, quantidade } : s,
          )
        })
      }
    },
    [],
  )

  const handleAlterarZoneamento = useCallback(
    (produtoId: number, zoneamento: string, tipo: "produto" | "servico" = "produto") => {
      if (tipo === "produto") {
        setProdutosSelecionados((prev) => {
          const currentProducts = Array.isArray(prev) ? prev : []
          return currentProducts.map((p) => (p.product_id === produtoId ? { ...p, zoneamento } : p))
        })
      } else {
        setServicosSelecionados((prev) => {
          const currentServices = Array.isArray(prev) ? prev : []
          return currentServices.map((s) =>
            s.product_id === produtoId || s.service_id === produtoId ? { ...s, zoneamento } : s,
          )
        })
      }
    },
    [],
  )

  const handleFinalizarVenda = useCallback(
    async (venda: Venda) => {
      setVendaFinalizada(venda)
      // Desativar rascunho quando a venda for finalizada
      deactivateDraft()
      // Reset email status
      setEmailSent(false)
    },
    [deactivateDraft],
  )

  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        return clienteSelecionado !== null
      case 1:
        return Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0 || servicosSelecionados.length > 0
      case 2:
        return Array.isArray(servicosSelecionados) && servicosSelecionados.length > 0 || produtosSelecionados.length > 0
      case 3:
        return (
          (Array.isArray(produtosSelecionados) && produtosSelecionados.length > 0) ||
          (Array.isArray(servicosSelecionados) && servicosSelecionados.length > 0)
        )
      case 4:
        return false // Última etapa
      default:
        return false
    }
  }, [currentStep, clienteSelecionado, produtosSelecionados, servicosSelecionados])

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

  // Função para permitir navegação direta pelo stepper
  const handleStepClick = useCallback(
    (stepIndex: number) => {
      // Só permite navegar para etapas já visitadas ou a próxima
      if (stepIndex <= currentStep) {
        startTransition(() => {
          setCurrentStep(stepIndex)
          window.scrollTo({ top: 0, behavior: "smooth" })
        })
      }
    },
    [currentStep],
  )

  const handleIniciarNovaVenda = useCallback(() => {
    // Limpar rascunho anterior antes de iniciar nova venda
    clearDraft()

    startTransition(() => {
      setShowSalesProcess(true)
      setCurrentStep(0)
      setClienteSelecionado(null)
      setProdutosSelecionados([])
      setServicosSelecionados([])
      setVendaFinalizada(null)
      setEmailSent(false)
      showNotification("info", "Nova venda iniciada")
    })
  }, [clearDraft, showNotification])

  const handleVoltarDashboard = useCallback(() => {
    startTransition(() => {
      setShowSalesProcess(false)
      // Não limpar os estados para manter o rascunho
      setCurrentStep(0)
      setClienteSelecionado(null)
      setProdutosSelecionados([])
      setServicosSelecionados([])
      setVendaFinalizada(null)
      setEmailSent(false)
      deactivateDraft()
    })
    showNotification("info", "Voltando ao Dashboard")
  }, [])

  const handleLimparVenda = useCallback(() => {
    clearDraft()
    startTransition(() => {
      setShowSalesProcess(false)
      setCurrentStep(0)
      setClienteSelecionado(null)
      setProdutosSelecionados([])
      setServicosSelecionados([])
      setVendaFinalizada(null)
      setEmailSent(false)
      showNotification("info", "Venda limpa")
    })
  }, [clearDraft, showNotification])

  const handleGerarPDF = useCallback(() => {
    if (!vendaFinalizada || !clienteSelecionado || !user) return;

    startTransition(() => {
      try {
        // Combinar produtos e serviços para o PDF
        const todosItens = [...produtosSelecionados, ...servicosSelecionados];

        // Usar a função utilitária para converter os dados
        const vendaParaPDF = convertVendaForPDF(vendaFinalizada, clienteSelecionado, todosItens, user);
        console.log("Dados para PDF:", vendaParaPDF);

        // Garantir que metodoPagamento não seja undefined
        if (!vendaParaPDF.metodoPagamento) {
          vendaParaPDF.metodoPagamento = "dinheiro";
        }

        downloadPDF(vendaParaPDF);
        showNotification("success", "Relatório gerado e baixado com sucesso!");
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        showNotification("error", "Erro ao gerar o relatório. Tente novamente.");
      }
    });
  }, [vendaFinalizada, clienteSelecionado, produtosSelecionados, servicosSelecionados, user, showNotification]);

  // Efeito para debug
  useEffect(() => {
    console.log("Serviços selecionados atualizados:", servicosSelecionados)
  }, [servicosSelecionados])

  // Se a venda foi finalizada, mostrar tela de sucesso
  if (vendaFinalizada) {
    return (
      <>
        <div className="flex items-center justify-center p-4 min-h-screen w-full">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Venda Finalizada!</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">A venda foi processada com sucesso.</p>

              {/* Status do email */}
              {emailSent && (
                <div className="mb-6 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email enviado com sucesso!</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Botão para enviar email */}
                <Button
                  onClick={handleOpenEmailPreview}
                  disabled={!clienteSelecionado?.email}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {emailSent ? "Reenviar Email" : "Enviar Email"}
                </Button>

                {!clienteSelecionado?.email && (
                  <p className="text-xs text-red-600">Cliente não possui email cadastrado</p>
                )}

                <Button
                  onClick={handleGerarPDF}
                  disabled={isPending}
                  variant="outline"
                  className="w-full text-sm sm:text-base"
                >
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
                      Gerando...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Baixar Relatório PDF
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleIniciarNovaVenda}
                  className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Venda
                </Button>

                <Button onClick={handleVoltarDashboard} variant="outline" className="w-full text-sm sm:text-base">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de Preview do Email */}
        <EmailPreviewModal
          isOpen={showEmailPreview}
          onClose={handleCloseEmailPreview}
          onConfirmSend={handleConfirmSendEmail}
          emailData={emailPreviewData}
          isLoading={isEmailSending}
        />

        <Notification
          notification={notification}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      </>
    )
  }

  // Se não está no processo de venda, mostrar dashboard
  if (!showSalesProcess) {
    return (
      <div className="w-full min-h-screen">
        <div className="mx-auto pr-4 pt-4 pb-4">
          <SalesDashboard onIniciarVenda={handleIniciarNovaVenda} onShowNotification={showNotification} />
        </div>
        <Notification
          notification={notification}
          onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        />
      </div>
    )
  }

  // Processo de venda
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-4 py-4 sm:px-6 sm:py-6">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header responsivo */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 truncate">Sistema de Vendas</h1>

            {/* Desktop buttons */}
            <div className="hidden sm:flex gap-2">
              <Button
                onClick={handleLimparVenda}
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Limpar
              </Button>
              <Button onClick={handleVoltarDashboard} variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              variant="outline"
              size="sm"
              className="sm:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="sm:hidden mb-4 p-4 bg-white rounded-lg shadow-md border">
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    handleLimparVenda()
                    setShowMobileMenu(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Limpar Venda
                </Button>
                <Button
                  onClick={() => {
                    handleVoltarDashboard()
                    setShowMobileMenu(false)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          )}

          <Stepper currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

          <Card className="w-full shadow-lg border-gray-200">
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
                <Step3_SelecionarServicos
                  servicosSelecionados={servicosSelecionados}
                  onAdicionarServico={handleAdicionarServico}
                  onShowNotification={showNotification}
                />
              )}

              {currentStep === 3 && (
                <Step4_RevisaoProdutos
                  produtos={produtosSelecionados}
                  servicos={servicosSelecionados}
                  onRemoverProduto={handleRemoverProduto}
                  onRemoverServico={handleRemoverServico}
                  onAlterarQuantidade={handleAlterarQuantidade}
                  onAlterarZoneamento={handleAlterarZoneamento}
                  onShowNotification={showNotification}
                />
              )}

              {currentStep === 4 && clienteSelecionado && (
                <Step5_Finalizacao
                  cliente={clienteSelecionado}
                  produtos={produtosSelecionados}
                  servicos={servicosSelecionados}
                  onFinalizarVenda={handleFinalizarVenda}
                  onShowNotification={showNotification}
                />
              )}

              {/* Navigation Buttons - Responsivo */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
                  <Button
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto order-2 sm:order-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>

                  <div className="text-sm text-gray-600 text-center order-1 sm:order-2 font-medium">
                    Etapa {currentStep + 1} de {steps.length}
                  </div>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep() || isPending}
                      size="sm"
                      className="w-full sm:w-auto order-3 bg-red-700 hover:bg-red-800"
                      data-testid="next-step-button"
                    >
                      Próximo
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  ) : (
                    <div className="order-3 text-sm text-gray-500 text-center sm:text-right">
                      Finalize a venda acima
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Notification notification={notification} onClose={() => setNotification((prev) => ({ ...prev, show: false }))} />
    </div>
  )
}
