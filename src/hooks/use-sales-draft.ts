"use client"

import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"
import type { Cliente, Environment, ProdutoSelecionado, ServicoSelecionado } from "@/types"

interface SalesDraft {
  currentStep: number
  ambienteSelecionado: Environment | null
  clienteSelecionado: Cliente | null
  produtosSelecionados: ProdutoSelecionado[]
  servicosSelecionados: ServicoSelecionado[]
  observacoes: string
  metodoPagamento: "dinheiro" | "cartao" | "pix" | "boleto"
  lastSaved: string
  isActive: boolean // Indica se há uma venda em andamento
}

const DRAFT_KEY = "sales-draft"

export function useSalesDraft() {
  const [draft, setDraft] = useLocalStorage<SalesDraft | null>(DRAFT_KEY, null)

  // Função para salvar o rascunho - sempre ativa
  const saveDraft = useCallback(
    (draftData: Partial<SalesDraft>) => {
      setDraft((prev) => ({
        currentStep: 0,
        ambienteSelecionado: null,
        clienteSelecionado: null,
        produtosSelecionados: [],
        servicosSelecionados: [],
        observacoes: "",
        metodoPagamento: "dinheiro" as const,
        ...prev,
        ...draftData,
        lastSaved: new Date().toISOString(),
        isActive: true,
      }))
    },
    [setDraft],
  )

  // Função para limpar o rascunho
  const clearDraft = useCallback(() => {
    setDraft(null)
  }, [setDraft])

  // Função para verificar se existe rascunho ativo
  const hasDraft = useCallback(() => {
    return (
      draft !== null &&
      draft.isActive &&
      (draft.clienteSelecionado !== null ||
        draft.produtosSelecionados.length > 0 ||
        draft.servicosSelecionados.length > 0)
    )
  }, [draft])

  // Função para obter informações do rascunho
  const getDraftInfo = useCallback(() => {
    if (!draft) return null

    const totalItens = draft.produtosSelecionados.length + draft.servicosSelecionados.length
    const lastSavedDate = new Date(draft.lastSaved)

    return {
      step: draft.currentStep,
      cliente: draft.clienteSelecionado?.name,
      totalItens,
      lastSaved: lastSavedDate.toLocaleString("pt-BR"),
      timeAgo: getTimeAgo(lastSavedDate),
    }
  }, [draft])

  // Função para marcar rascunho como inativo (venda finalizada)
  const deactivateDraft = useCallback(() => {
    if (draft) {
      setDraft({ ...draft, isActive: false })
    }
  }, [draft, setDraft])

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
    getDraftInfo,
    deactivateDraft,
  }
}

// Função auxiliar para calcular tempo decorrido
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "agora mesmo"
  if (diffInMinutes < 60) return `${diffInMinutes} minuto${diffInMinutes > 1 ? "s" : ""} atrás`

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hora${diffInHours > 1 ? "s" : ""} atrás`

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} dia${diffInDays > 1 ? "s" : ""} atrás`
}
