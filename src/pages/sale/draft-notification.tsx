"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Clock, FileText, X, RotateCcw, Trash2 } from "lucide-react"

interface DraftInfo {
    step: number
    cliente?: string
    totalItens: number
    lastSaved: string
    timeAgo: string
}

interface DraftNotificationProps {
    draftInfo: DraftInfo
    onRestoreDraft: () => void
    onDiscardDraft: () => void
}

const DraftNotification: React.FC<DraftNotificationProps> = ({ draftInfo, onRestoreDraft, onDiscardDraft }) => {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    const handleRestore = () => {
        onRestoreDraft()
        setIsVisible(false)
    }

    const handleDiscard = () => {
        onDiscardDraft()
        setIsVisible(false)
    }

    const handleDismiss = () => {
        setIsVisible(false)
    }

    return (
        <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-orange-600" />
                            <h3 className="font-semibold text-orange-800">Rascunho encontrado</h3>
                        </div>

                        <div className="text-sm text-orange-700 space-y-1">
                            <p>Você tem uma venda em andamento salva como rascunho:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Etapa:</span>
                                    <span>{draftInfo.step + 1}/5</span>
                                </div>
                                {draftInfo.cliente && (
                                    <div className="flex items-center gap-1">
                                        <span className="font-medium">Cliente:</span>
                                        <span className="truncate">{draftInfo.cliente}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <span className="font-medium">Itens:</span>
                                    <span>{draftInfo.totalItens}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                                <Clock className="w-3 h-3" />
                                <span>Salvo {draftInfo.timeAgo}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleRestore} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Restaurar
                        </Button>

                        <Button
                            onClick={handleDiscard}
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Descartar
                        </Button>

                        <Button
                            onClick={handleDismiss}
                            size="sm"
                            variant="ghost"
                            className="text-orange-600 hover:bg-orange-100 p-1"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default DraftNotification
