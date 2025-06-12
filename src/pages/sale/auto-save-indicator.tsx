"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, WifiOff, Save } from "lucide-react"

interface AutoSaveIndicatorProps {
    lastSaved?: string
    isSaving?: boolean
}

const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ lastSaved, isSaving = false }) => {
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    const formatLastSaved = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 10) return "agora"
        if (diffInSeconds < 60) return `${diffInSeconds}s`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`
        return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }

    // Não mostrar se não há dados para salvar
    if (!lastSaved && !isSaving) return null

    return (
        <div className="fixed bottom-4 right-4 z-40">
            <div className="bg-white border border-gray-200 rounded-full shadow-lg px-3 py-2 flex items-center gap-2 text-xs">
                {!isOnline ? (
                    <>
                        <WifiOff className="w-3 h-3 text-red-500" />
                        <span className="text-red-600">Offline</span>
                    </>
                ) : isSaving ? (
                    <>
                        <Save className="w-3 h-3 text-blue-500 animate-pulse" />
                        <span className="text-blue-600">Salvando...</span>
                    </>
                ) : lastSaved ? (
                    <>
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600">Salvo {formatLastSaved(lastSaved)}</span>
                    </>
                ) : null}
            </div>
        </div>
    )
}

export default AutoSaveIndicator
