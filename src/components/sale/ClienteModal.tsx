

import React from "react"
import { useState } from "react"
import { createCustomer } from "@/api/customer-api"
import type { Cliente } from "@/types"
import { User, Mail, Phone, MapPin, FileText, Loader2 } from "lucide-react"
import { Modal } from "../ui/modal"

interface ClienteModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (cliente: Cliente) => void
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const ClienteModal: React.FC<ClienteModalProps> = ({ isOpen, onClose, onSave, onShowNotification }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        observation: "",
        adress: "",
        cep: "",
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Resetar formulário quando o modal fechar
    React.useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                email: "",
                contact: "",
                observation: "",
                adress: "",
                cep: "",
            })
            setErrors({})
        }
    }, [isOpen])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))

        // Limpar erro do campo quando o usuário digitar
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) {
            newErrors.name = "Nome é obrigatório"
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email inválido"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validate()) return

        setLoading(true)

        try {
            const response = await createCustomer(formData)

            if (response.data) {
                const novoCliente: Cliente = {
                    id: response.data.customer_id,
                    customer_id: response.data.customer_id,
                    name: response.data.name,
                    email: response.data.email,
                    contato: response.data.contact,
                    observacoes: response.data.observation,
                    endereco: response.data.adress,
                    cep: response.data.cep,
                    createdAt: response.data.createdAt,
                    updatedAt: response.data.updatedAt,
                }

                onSave(novoCliente)
                onShowNotification("success", `Cliente ${novoCliente.name} cadastrado com sucesso!`)
                onClose()
            }
        } catch (error) {
            console.error("Erro ao cadastrar cliente:", error)
            onShowNotification("error", "Erro ao cadastrar cliente. Tente novamente.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Novo Cliente">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nome */}
                <div>
                    <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="text-red-600" />
                        Nome <span className="text-red-600">*</span>
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
                        placeholder="Digite o nome completo"
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

                {/* Email e Contato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail size={16} className="text-red-600" />
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg text-sm transition-all duration-200 ${errors.email
                                ? "border-red-500 bg-red-50 focus:ring-red-500"
                                : "border-gray-300 focus:border-red-500 focus:ring-red-500"
                                } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                            placeholder="email@exemplo.com"
                        />
                        {errors.email && (
                            <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="contact" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone size={16} className="text-red-600" />
                            Contato
                        </label>
                        <input
                            type="text"
                            id="contact"
                            name="contact"
                            value={formData.contact}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-500 transition-all duration-200"
                            placeholder="(00) 00000-0000"
                        />
                    </div>
                </div>

                {/* Endereço e CEP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="adress" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin size={16} className="text-red-600" />
                            Endereço
                        </label>
                        <input
                            type="text"
                            id="adress"
                            name="adress"
                            value={formData.adress}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-500 transition-all duration-200"
                            placeholder="Rua, número, bairro"
                        />
                    </div>

                    <div>
                        <label htmlFor="cep" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin size={16} className="text-red-600" />
                            CEP
                        </label>
                        <input
                            type="text"
                            id="cep"
                            name="cep"
                            value={formData.cep}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-500 transition-all duration-200"
                            placeholder="00000-000"
                        />
                    </div>
                </div>

                {/* Observações */}
                <div>
                    <label htmlFor="observation" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText size={16} className="text-red-600" />
                        Observações
                    </label>
                    <textarea
                        id="observation"
                        name="observation"
                        value={formData.observation}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 focus:border-red-500 transition-all duration-200 resize-none"
                        placeholder="Informações adicionais sobre o cliente..."
                    />
                </div>

                {/* Botões */}
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
                                Salvar Cliente
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

export default ClienteModal
