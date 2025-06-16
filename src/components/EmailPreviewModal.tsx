"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Send } from "lucide-react"
import type { EmailData } from "@/api/email"

interface EmailPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirmSend: () => void
    emailData: EmailData | null
    isLoading: boolean
}

export default function EmailPreviewModal({
    isOpen,
    onClose,
    onConfirmSend,
    emailData,
    isLoading,
}: EmailPreviewModalProps) {
    if (!emailData) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-red-700" />
                        </div>
                        <div>
                            <DialogTitle>Confirmar Envio</DialogTitle>
                            <DialogDescription>Verificar destinatários do email</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email do Cliente:</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">{emailData.customerEmail}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Cópia para Vendedor:</label>
                            <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded border">{emailData.sellerEmail}</p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                        O comprovante da venda #{emailData.saleData.sale_id} será enviado para ambos os emails acima.
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={onConfirmSend} disabled={isLoading} className="bg-red-700 hover:bg-red-800">
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar Email
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
