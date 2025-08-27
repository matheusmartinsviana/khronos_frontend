"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getEnvironments } from "../../api/environment"
import type { Environment } from "../../types"
import EnvironmentModal from "./EnvironmentModal"
import { Grid, List, Check, MapPinHouse } from "lucide-react"

interface Step0Props {
    onEnvironmentSelect: (environment: Environment) => void
    environmentSelecionado: Environment | null
    onShowNotification: (type: "success" | "error" | "info", message: string) => void
}

type ViewMode = "grid" | "table"

const Step0_SelecionarAmbiente: React.FC<Step0Props> = ({
    onEnvironmentSelect,
    environmentSelecionado = null,
    onShowNotification,
}) => {
    const [environments, setEnvironments] = useState<Environment[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filtro, setFiltro] = useState("")
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<ViewMode>("grid")

    const fetchEnvironments = async () => {
        try {
            setLoading(true)
            const response = await getEnvironments()
            const environmentsFormatados: Environment[] = Array.isArray(response.data)
                ? response.data.map((item: any) => ({
                    environment_id: item.environment_id,
                    name: item.name || "Nome não informado",
                    description: item.description,
                    createdAt: item.createdAt,
                    updatedAt: item.updatedAt,
                }))
                : []
            setEnvironments(environmentsFormatados)
        } catch (error) {
            console.error("Erro ao buscar ambientes:", error)
            onShowNotification("error", "Erro ao buscar ambientes. Tente novamente mais tarde.")
            setEnvironments([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEnvironments()
    }, [])

    const environmentsFiltrados = Array.isArray(environments)
        ? environments.filter(
            (environment) =>
                environment.name?.toLowerCase().includes(filtro.toLowerCase()) ||
                environment.description?.toLowerCase().includes(filtro.toLowerCase()),
        )
        : []

    const handleNovoEnvironment = async (novoEnvironment: Environment) => {
        await fetchEnvironments()
        setIsModalOpen(false)
        onEnvironmentSelect(novoEnvironment)
        onShowNotification("success", `Ambiente ${novoEnvironment.name} cadastrado com sucesso!`)
    }

    const handleSelectEnvironment = (environment: Environment) => {
        onEnvironmentSelect(environment)
        onShowNotification("success", `Ambiente ${environment.name} selecionado!`)
    }

    const isEnvironmentSelected = (environment: Environment) => {
        return environmentSelecionado?.environment_id === environment.environment_id
    }

    const renderGridView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" data-testid="environments-grid">
            {environmentsFiltrados.map((environment) => (
                <div
                    key={environment.environment_id}
                    data-testid={`environment-card`}
                    className={`border rounded p-3 cursor-pointer transition-all duration-200 ${isEnvironmentSelected(environment)
                        ? "border-red-700 bg-red-50 shadow-md"
                        : "bg-white hover:bg-gray-50 hover:shadow-sm border-gray-200"
                        }`}
                    onClick={() => handleSelectEnvironment(environment)}
                >
                    <h4 className="text-gray-800 font-medium text-base mb-2 truncate flex items-center">
                        <MapPinHouse className="w-4 h-4 text-gray-500 mr-2" />
                        {environment.name}
                    </h4>
                    <div className="space-y-1">
                        <p className="text-gray-600 text-sm truncate">
                            <span className="font-medium">Descrição:</span> {environment.description || "Não informado"}
                        </p>
                        <p className="text-gray-600 text-sm">
                            <span className="font-medium">Criado em:</span> {environment.createdAt ? new Date(environment.createdAt).toLocaleDateString() : "Não informado"}
                        </p>
                        <p className="text-gray-600 text-sm">
                            <span className="font-medium">Atualizado em:</span> {environment.updatedAt ? new Date(environment.updatedAt).toLocaleDateString() : "Não informado"}
                        </p>
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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado em</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atualizado em</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {environmentsFiltrados.map((environment) => (
                        <tr
                            key={environment.environment_id}
                            className={`cursor-pointer transition-colors duration-200 ${isEnvironmentSelected(environment) ? "bg-red-50 border-l-4 border-l-red-700" : "hover:bg-gray-50"
                                }`}
                            onClick={() => handleSelectEnvironment(environment)}
                        >
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center justify-center">
                                    {isEnvironmentSelected(environment) && <Check className="w-5 h-5 text-red-700" />}
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                    <MapPinHouse className="w-4 h-4 text-gray-500 mr-2" />
                                    <div className="text-sm font-medium text-gray-900">{environment.name}</div>
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{environment.description || "Não informado"}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{environment.createdAt ? new Date(environment.createdAt).toLocaleDateString() : "Não informado"}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm text-gray-600">{environment.updatedAt ? new Date(environment.updatedAt).toLocaleDateString() : "Não informado"}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )

    return (
        <div className="p-4 lg:p-6 flex flex-col w-full">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Selecionar Ambiente</h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Pesquisar ambiente..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:max-w-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />

                    <div className="flex items-center border border-gray-300 rounded">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 transition-colors duration-200 ${viewMode === "grid" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                                }`}
                            title="Visualização em Grid"
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 transition-colors duration-200 ${viewMode === "table" ? "bg-red-700 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
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
                    + Novo Ambiente
                </button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto mb-2"></div>
                    Carregando ambientes...
                </div>
            ) : (
                <div
                    className={`${viewMode === "grid" ? "max-h-96 lg:max-h-[500px] overflow-y-auto pr-2" : "max-h-96 lg:max-h-[500px] overflow-auto"} w-full`}
                >
                    {environmentsFiltrados.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            {filtro ? "Nenhum ambiente encontrado para a pesquisa." : "Nenhum ambiente cadastrado."}
                        </div>
                    ) : (
                        <>{viewMode === "grid" ? renderGridView() : renderTableView()}</>
                    )}
                </div>
            )}

            {environmentSelecionado && (
                <div className="mt-4 p-3 rounded border border-green-300 bg-green-100 text-green-800 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="truncate">
                        Ambiente Selecionado: <strong className="ml-1">{environmentSelecionado.name}</strong>
                    </span>
                </div>
            )}

            <EnvironmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleNovoEnvironment}
                onShowNotification={onShowNotification}
            />
        </div>
    )
}

export default Step0_SelecionarAmbiente