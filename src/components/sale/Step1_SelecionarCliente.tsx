"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getCustomers } from "@/api/customer-api"
import type { Cliente } from "@/types"
import ClienteModal from "./ClienteModal"
import { Grid, List, Check } from "lucide-react"

interface Step1Props {
  onClienteSelect: (cliente: Cliente) => void
  clienteSelecionado: Cliente | null
  onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

type ViewMode = "grid" | "table"

const Step1_SelecionarCliente: React.FC<Step1Props> = ({ onClienteSelect, clienteSelecionado, onShowNotification }) => {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const fetchClientes = async () => {
    try {
      setLoading(true)
      const response = await getCustomers()
      const clientesFormatados: Cliente[] = Array.isArray(response.data)
        ? response.data.map((item: any) => ({
            id: item.customer_id,
            customer_id: item.customer_id,
            name: item.name || "Nome não informado",
            email: item.email,
            contato: item.contact,
            observacoes: item.observation,
            endereco: item.adress,
            cep: item.cep,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          }))
        : []
      setClientes(clientesFormatados)
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      onShowNotification("error", "Erro ao buscar clientes. Tente novamente mais tarde.")
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const clientesFiltrados = Array.isArray(clientes)
    ? clientes.filter(
        (cliente) =>
          cliente.name?.toLowerCase().includes(filtro.toLowerCase()) ||
          cliente.contato?.includes(filtro) ||
          cliente.email?.toLowerCase().includes(filtro.toLowerCase()),
      )
    : []

  const handleNovoCliente = async (novoCliente: Cliente) => {
    await fetchClientes()
    setIsModalOpen(false)
    onClienteSelect(novoCliente)
    onShowNotification("success", `Cliente ${novoCliente.name} cadastrado com sucesso!`)
  }

  const handleSelectCliente = (cliente: Cliente) => {
    onClienteSelect(cliente)
    onShowNotification("success", `Cliente ${cliente.name} selecionado!`)
  }

  const isClienteSelected = (cliente: Cliente) => {
    return clienteSelecionado?.id === cliente.id || clienteSelecionado?.customer_id === cliente.customer_id
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {clientesFiltrados.map((cliente) => (
        <div
          key={cliente.id || cliente.customer_id}
          className={`border rounded p-3 cursor-pointer transition-all duration-200 ${
            isClienteSelected(cliente)
              ? "border-red-700 bg-red-50 shadow-md"
              : "bg-white hover:bg-gray-50 hover:shadow-sm border-gray-200"
          }`}
          onClick={() => handleSelectCliente(cliente)}
        >
          <h4 className="text-gray-800 font-medium text-base mb-2 truncate">{cliente.name}</h4>
          <div className="space-y-1">
            <p className="text-gray-600 text-sm truncate">
              <span className="font-medium">Email:</span> {cliente.email || "Não informado"}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium">Contato:</span> {cliente.contato || "Não informado"}
            </p>
            {cliente.observacoes && (
              <p className="text-gray-600 text-sm line-clamp-2">
                <span className="font-medium">Observações:</span> {cliente.observacoes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seleção</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Observações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientesFiltrados.map((cliente) => (
            <tr
              key={cliente.id || cliente.customer_id}
              className={`cursor-pointer transition-colors duration-200 ${
                isClienteSelected(cliente) ? "bg-red-50 border-l-4 border-l-red-700" : "hover:bg-gray-50"
              }`}
              onClick={() => handleSelectCliente(cliente)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center">
                  {isClienteSelected(cliente) && <Check className="w-5 h-5 text-red-700" />}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{cliente.name}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-600">{cliente.email || "Não informado"}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm text-gray-600">{cliente.contato || "Não informado"}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-600 max-w-xs truncate">{cliente.endereco || "Não informado"}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-600 max-w-xs truncate">{cliente.observacoes || "Nenhuma"}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="p-4 lg:p-6 flex flex-col w-full">
      <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Cliente</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Pesquisar cliente..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors duration-200 ${
                viewMode === "grid" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Visualização em Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 transition-colors duration-200 ${
                viewMode === "table" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-4 h-4 " />
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 text-sm transition-colors duration-200 w-full sm:w-auto whitespace-nowrap"
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
        <div
          className={`${viewMode === "grid" ? "max-h-96 lg:max-h-[500px] overflow-y-auto pr-2" : "max-h-96 lg:max-h-[500px] overflow-auto"} w-full`}
        >
          {clientesFiltrados.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              {filtro ? "Nenhum cliente encontrado para a pesquisa." : "Nenhum cliente cadastrado."}
            </div>
          ) : (
            <>{viewMode === "grid" ? renderGridView() : renderTableView()}</>
          )}
        </div>
      )}

      {clienteSelecionado && (
        <div className="mt-4 p-3 rounded border border-green-300 bg-green-100 text-green-800 text-sm flex items-center">
          <svg className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">
            Cliente Selecionado: <strong className="ml-1">{clienteSelecionado.name}</strong>
          </span>
        </div>
      )}

      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNovoCliente}
        onShowNotification={onShowNotification}
      />
    </div>
  )
}

export default Step1_SelecionarCliente
