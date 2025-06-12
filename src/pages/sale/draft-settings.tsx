"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Settings, Trash2, Download, Upload } from "lucide-react"
import { useSalesDraft } from "@/hooks/use-sales-draft"
import { Switch } from "@/components/ui/switch"

interface DraftSettingsProps {
    autoSaveEnabled: boolean
    onAutoSaveToggle: (enabled: boolean) => void
}

const DraftSettings: React.FC<DraftSettingsProps> = ({ autoSaveEnabled, onAutoSaveToggle }) => {
    const { draft, clearDraft, getDraftInfo } = useSalesDraft()
    const [isOpen, setIsOpen] = useState(false)

    const handleExportDraft = () => {
        if (!draft) return

        const dataStr = JSON.stringify(draft, null, 2)
        const dataBlob = new Blob([dataStr], { type: "application/json" })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement("a")
        link.href = url
        link.download = `rascunho-venda-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
    }

    const handleImportDraft = () => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".json"

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const importedDraft = JSON.parse(e.target?.result as string)
                    // Aqui você pode validar e restaurar o rascunho importado
                    console.log("Rascunho importado:", importedDraft)
                } catch (error) {
                    console.error("Erro ao importar rascunho:", error)
                }
            }
            reader.readAsText(file)
        }

        input.click()
    }

    const draftInfo = getDraftInfo()

    return (
        <div className="relative">
            <Button onClick={() => setIsOpen(!isOpen)} variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Rascunhos
            </Button>

            {isOpen && (
                <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Configurações de Rascunho
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        {/* Auto-save toggle */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-save" className="text-sm">
                                Salvamento automático
                            </Label>
                            <Switch id="auto-save" checked={autoSaveEnabled} onCheckedChange={onAutoSaveToggle} />
                        </div>

                        {/* Draft info */}
                        {draftInfo && (
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="text-xs font-medium text-gray-700 mb-1">Rascunho atual:</p>
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div>Etapa: {draftInfo.step + 1}/5</div>
                                    {draftInfo.cliente && <div>Cliente: {draftInfo.cliente}</div>}
                                    <div>Itens: {draftInfo.totalItens}</div>
                                    <div>Salvo: {draftInfo.timeAgo}</div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button
                                onClick={handleExportDraft}
                                disabled={!draft}
                                size="sm"
                                variant="outline"
                                className="w-full justify-start gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Exportar rascunho
                            </Button>

                            <Button onClick={handleImportDraft} size="sm" variant="outline" className="w-full justify-start gap-2">
                                <Upload className="w-4 h-4" />
                                Importar rascunho
                            </Button>

                            <Button
                                onClick={() => {
                                    clearDraft()
                                    setIsOpen(false)
                                }}
                                disabled={!draft}
                                size="sm"
                                variant="destructive"
                                className="w-full justify-start gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Limpar rascunho
                            </Button>
                        </div>

                        <div className="pt-2 border-t">
                            <Button onClick={() => setIsOpen(false)} size="sm" variant="ghost" className="w-full">
                                Fechar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DraftSettings
