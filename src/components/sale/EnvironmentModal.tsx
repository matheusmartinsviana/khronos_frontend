"use client"

import React, { useState, useEffect } from "react"
import type { Environment } from "@/types"
import { Modal } from "../ui/modal"
import { FileText, Loader2 } from "lucide-react"
import { createEnvironment } from "@/api/environment"

interface EnvironmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (environment: Environment) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const EnvironmentModal: React.FC<EnvironmentModalProps> = ({
    isOpen,
    onClose,
    onSave,
    onShowNotification,
}) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                description: "",
            })
            setErrors({})
        }
    }, [isOpen])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            const newEnvironment: Environment = {
                // environment_id: Date.now().toString(),
                ...formData,
                description: formData.description ?? "Descrição não informada",
                // createdAt: new Date().toISOString(),
                // updatedAt: new Date().toISOString(),
            }

            const response = await createEnvironment({
                name: newEnvironment.name,
                description: newEnvironment.description,
            })

            onSave(newEnvironment)
            onShowNotification("success", `Ambiente ${formData.name} cadastrado com sucesso!`)
            onClose()
        } catch (error) {
            onShowNotification("error", "Erro ao cadastrar ambiente. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Novo Ambiente">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="text-red-600" />
                        Nome do Ambiente <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${errors.name
                            ? "border-red-500 bg-red-50 focus:ring-red-500"
                            : "border-gray-300 focus:border-red-500 focus:ring-red-500"
                            } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                        placeholder="Digite o nome do ambiente"
                        required
                    />
                    {errors.name && (
                        <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            {errors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="text-red-600" />
                        Descrição
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-500 transition-all duration-200 resize-none"
                        placeholder="Descreva o ambiente..."
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] transition-all duration-200 shadow-lg hover:shadow-xl"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Salvar Ambiente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default EnvironmentModal
