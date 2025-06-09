

import * as React from "react"
import { X } from "lucide-react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    // Fechar o modal quando pressionar ESC
    React.useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [onClose])

    // Prevenir scroll do body quando o modal estiver aberto
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay com blur e gradiente */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Container do modal com animação */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 opacity-100 border border-gray-200">
                {/* Header do modal */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-red-100 rounded-t-xl">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Fechar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Conteúdo do modal */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    )
}
