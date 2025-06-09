"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getCustomers } from "@/api/customer-api"
import type { Cliente } from "@/types"
import CadastroCliente from "./CadastroCliente"

interface Step1Props {
    onClienteSelect: (cliente: Cliente) => void
    clienteSelecionado: Cliente | null
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

const Step1_SelecionarCliente: React.FC<Step1Props> = ({ onClienteSelect, clienteSelecionado, onShowNotification }) => {
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [mostrarCadastro, setMostrarCadastro] = useState(false)
    const [filtro, setFiltro] = useState("")
    const [loading, setLoading] = useState(true)

    const fetchClientes = async () => {
        try {
            setLoading(true)
            const response = await getCustomers()
            const clientesFormatados: Cliente[] = response.data.map((item: any) => ({
                id: item.customer_id,
                customer_id: item.customer_id,
                name: item.name,
                email: item.email,
                contato: item.contact,
                observacoes: item.observation,
                endereco: item.adress,
                cep: item.cep,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            }))
            setClientes(clientesFormatados)
        } catch (error) {
            console.error("Erro ao buscar clientes:", error)
            onShowNotification("error", "Erro ao buscar clientes. Tente novamente mais tarde.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClientes()
    }, [])

    const clientesFiltrados = clientes.filter(
        (cliente) =>
            cliente.name?.toLowerCase().includes(filtro.toLowerCase()) ||
            cliente.contato?.includes(filtro) ||
            cliente.email?.toLowerCase().includes(filtro.toLowerCase()),
    )

    const handleNovoCliente = async (novoCliente: Cliente) => {
        await fetchClientes()
        setMostrarCadastro(false)
        onClienteSelect(novoCliente)
        onShowNotification("success", `Cliente ${novoCliente.name} cadastrado com sucesso!`)
    }

    const handleSelectCliente = (cliente: Cliente) => {
        onClienteSelect(cliente)
        onShowNotification("success", `Cliente ${cliente.name} selecionado!`)
    }

    if (mostrarCadastro) {
        return (
            <CadastroCliente
                onSave={handleNovoCliente}
                onCancel={() => setMostrarCadastro(false)}
                onShowNotification={onShowNotification}
            />
        )
    }

    return (
        <div className="p-4 flex flex-col bg-white rounded shadow-md mx-auto w-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Selecionar Cliente</h2>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Pesquisar cliente..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                    onClick={() => setMostrarCadastro(true)}
                    className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 text-sm transition-colors duration-200"
                >
                    + Novo Cliente
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                    Carregando clientes...
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto pr-2">
                    {clientesFiltrados.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            {filtro ? "Nenhum cliente encontrado para a pesquisa." : "Nenhum cliente cadastrado."}
                        </div>
                    ) : (
                        clientesFiltrados.map((cliente) => (
                            <div
                                key={cliente.id || cliente.customer_id}
                                className={`border rounded p-3 mb-2 cursor-pointer transition-all duration-200 
                  ${clienteSelecionado?.id === cliente.id || clienteSelecionado?.customer_id === cliente.customer_id
                                        ? "border-red-700 bg-red-50 shadow-md"
                                        : "bg-white hover:bg-gray-50 hover:shadow-sm border-gray-200"
                                    }`}
                                onClick={() => handleSelectCliente(cliente)}
                            >
                                <h4 className="text-gray-800 font-medium text-base mb-2">{cliente.name}</h4>
                                <div className="space-y-1">
                                    <p className="text-gray-600 text-sm">
                                        <span className="font-medium">Email:</span> {cliente.email || "Não informado"}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        <span className="font-medium">Contato:</span> {cliente.contato || "Não informado"}
                                    </p>
                                    {cliente.observacoes && (
                                        <p className="text-gray-600 text-sm">
                                            <span className="font-medium">Observações:</span> {cliente.observacoes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {clienteSelecionado && (
                <div className="mt-4 p-3 rounded border border-green-300 bg-green-100 text-green-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Cliente Selecionado: <strong className="ml-1">{clienteSelecionado.name}</strong>
                </div>
            )}
        </div>
    )
}

export default Step1_SelecionarCliente
