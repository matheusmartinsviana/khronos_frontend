"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getCustomers, deleteCustomer, getCustomerById, createCustomer, updateCustomer } from "@/api/customer-api"
import type { Cliente } from "@/types"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    TrashIcon,
    PenIcon,
    UserPlus,
    Search,
    Loader2,
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
} from "lucide-react"

const searchSchema = z.object({
    search: z.string(),
})

const clienteSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido").optional().or(z.literal("")),
    contact: z.string().optional().or(z.literal("")),
    observation: z.string().optional().or(z.literal("")),
    adress: z.string().optional().or(z.literal("")),
    cep: z.string().optional().or(z.literal("")),
})

type SearchFormData = z.infer<typeof searchSchema>
type ClienteFormData = z.infer<typeof clienteSchema>

export default function ClientesPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const isCreating = id === "novo"
    const isListing = !id

    const [clientes, setClientes] = useState<Cliente[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([])
    const [currentCliente, setCurrentCliente] = useState<Cliente | null>(null)
    const [editLoading, setEditLoading] = useState(false)

    const searchForm = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: "",
        },
    })

    const clienteForm = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            name: "",
            email: "",
            contact: "",
            observation: "",
            adress: "",
            cep: "",
        },
    })

    const editForm = useForm<ClienteFormData>({
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            name: "",
            email: "",
            contact: "",
            observation: "",
            adress: "",
            cep: "",
        },
    })

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
            setFilteredClientes(clientesFormatados)
        } catch (error) {
            console.error("Erro ao buscar clientes:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCliente = async (clienteId: string) => {
        try {
            setEditLoading(true)
            const response = await getCustomerById(clienteId)
            const cliente = response.data
            setCurrentCliente(cliente)

            // Preencher o formulário com os dados do cliente
            editForm.reset({
                name: cliente.name || "",
                email: cliente.email || "",
                contact: cliente.contact || cliente.contato || "",
                observation: cliente.observation || cliente.observacoes || "",
                adress: cliente.adress || cliente.endereco || "",
                cep: cliente.cep || "",
            })
        } catch (error) {
            console.error("Erro ao buscar cliente:", error)
        } finally {
            setEditLoading(false)
        }
    }

    useEffect(() => {
        if (isListing) {
            fetchClientes()
        } else if (isCreating) {
            setLoading(false)
            clienteForm.reset()
        }
    }, [id, isListing, isCreating])

    const onSearch = (data: SearchFormData) => {
        const searchTerm = data.search.toLowerCase()
        if (!searchTerm) {
            setFilteredClientes(clientes)
        } else {
            const filtered = clientes.filter(
                (cliente) =>
                    cliente.name?.toLowerCase().includes(searchTerm) ||
                    cliente.email?.toLowerCase().includes(searchTerm) ||
                    cliente.contato?.includes(searchTerm),
            )
            setFilteredClientes(filtered)
        }
    }

    const onAdd = () => {
        navigate("/clientes/novo")
    }

    const onEdit = async (clienteId: string) => {
        await fetchCliente(clienteId)
        setEditDialogOpen(true)
    }

    const handleOpenDeleteModal = (clienteId: string) => {
        setIdToDelete(clienteId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (idToDelete !== null) {
            try {
                await deleteCustomer(idToDelete)
                await fetchClientes()
            } catch (error) {
                console.error("Erro ao deletar cliente:", error)
            }
        }
        setDeleteDialogOpen(false)
        setIdToDelete(null)
    }

    const onSubmitCliente = async (data: ClienteFormData) => {
        setLoading(true)

        try {
            if (isCreating) {
                await createCustomer(data)
                navigate("/clientes")
            }
        } catch (error) {
            console.error("Erro ao salvar cliente:", error)
        } finally {
            setLoading(false)
        }
    }

    const onSubmitEdit = async (data: ClienteFormData) => {
        if (!currentCliente?.customer_id) return

        setEditLoading(true)

        try {
            await updateCustomer(currentCliente.customer_id, data)
            setEditDialogOpen(false)
            await fetchClientes()
        } catch (error) {
            console.error("Erro ao atualizar cliente:", error)
        } finally {
            setEditLoading(false)
        }
    }

    const handleCancel = () => {
        navigate("/clientes")
    }

    // Renderizar formulário de cadastro
    if (isCreating) {
        return (
            <div className="container mx-auto px-4 py-6 max-w-2xl">
                <div className="flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Cadastrar Cliente</h1>
                            <p className="text-gray-600">Preencha os dados do novo cliente</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                            <span className="ml-2 text-gray-600">Carregando...</span>
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5 text-red-600" />
                                    Dados do Cliente
                                </CardTitle>
                                <CardDescription>Preencha as informações básicas do cliente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...clienteForm}>
                                    <form onSubmit={clienteForm.handleSubmit(onSubmitCliente)} className="space-y-6">
                                        {/* Nome */}
                                        <FormField
                                            control={clienteForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-red-600" />
                                                        Nome <span className="text-red-600">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Digite o nome completo" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Email e Contato */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={clienteForm.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Mail className="h-4 w-4 text-red-600" />
                                                            Email
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="email@exemplo.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={clienteForm.control}
                                                name="contact"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-red-600" />
                                                            Contato
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="(00) 00000-0000" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Endereço e CEP */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={clienteForm.control}
                                                name="adress"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-red-600" />
                                                            Endereço
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Rua, número, bairro" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={clienteForm.control}
                                                name="cep"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-red-600" />
                                                            CEP
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="00000-000" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Observações */}
                                        <FormField
                                            control={clienteForm.control}
                                            name="observation"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-red-600" />
                                                        Observações
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Informações adicionais sobre o cliente..."
                                                            className="resize-none"
                                                            rows={4}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Botões */}
                                        <div className="flex justify-end gap-3 pt-6 border-t">
                                            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                                                Cancelar
                                            </Button>
                                            <Button type="submit" disabled={loading}>
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Salvar Cliente
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        )
    }

    // Renderizar listagem de clientes
    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                        <p className="text-gray-600">Gerencie seus clientes cadastrados</p>
                    </div>
                    <Button onClick={onAdd} className="w-full sm:w-auto">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Novo Cliente
                    </Button>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex gap-2 w-full sm:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Pesquisar clientes..."
                                className="pl-10"
                                {...searchForm.register("search")}
                                onChange={(e) => {
                                    searchForm.setValue("search", e.target.value)
                                    onSearch({ search: e.target.value })
                                }}
                            />
                        </div>
                    </form>
                    <div className="text-sm text-gray-600">
                        {filteredClientes.length} cliente{filteredClientes.length !== 1 ? "s" : ""} encontrado
                        {filteredClientes.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* Lista de Clientes */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                        <span className="ml-2 text-gray-600">Carregando clientes...</span>
                    </div>
                ) : filteredClientes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <UserPlus className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                        <p className="text-gray-600 mb-4">
                            {searchForm.watch("search") ? "Tente ajustar sua pesquisa" : "Comece cadastrando seu primeiro cliente"}
                        </p>
                        {!searchForm.watch("search") && (
                            <Button onClick={onAdd}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Cadastrar Cliente
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contato
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Endereço
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredClientes.map((cliente) => (
                                        <tr key={cliente.customer_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{cliente.name}</div>
                                                    <div className="text-sm text-gray-500">{cliente.email || "Email não informado"}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{cliente.contato || "Não informado"}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {cliente.endereco ? (
                                                        <>
                                                            {cliente.endereco}
                                                            {cliente.cep && <div className="text-xs text-gray-500">CEP: {cliente.cep}</div>}
                                                        </>
                                                    ) : (
                                                        "Não informado"
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(cliente.customer_id!)}>
                                                        <PenIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteModal(cliente.customer_id!)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Dialog de Confirmação de Exclusão */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deseja realmente deletar este cliente?</DialogTitle>
                            <DialogDescription>
                                Esta ação não poderá ser desfeita. Todos os dados do cliente serão permanentemente removidos.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={confirmDelete}>
                                Confirmar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Edição */}
                <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogContent className="sm:max-w-md md:max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <PenIcon className="h-5 w-5 text-red-600" />
                                Editar Cliente
                            </DialogTitle>
                            <DialogDescription>Atualize os dados do cliente</DialogDescription>
                        </DialogHeader>

                        {editLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                                <span className="ml-2 text-gray-600">Carregando dados do cliente...</span>
                            </div>
                        ) : (
                            <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                                    {/* Nome */}
                                    <FormField
                                        control={editForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-red-600" />
                                                    Nome <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Digite o nome completo" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Email e Contato */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-red-600" />
                                                        Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@exemplo.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="contact"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-red-600" />
                                                        Contato
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="(00) 00000-0000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Endereço e CEP */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="adress"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-red-600" />
                                                        Endereço
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Rua, número, bairro" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={editForm.control}
                                            name="cep"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-red-600" />
                                                        CEP
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="00000-000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Observações */}
                                    <FormField
                                        control={editForm.control}
                                        name="observation"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-red-600" />
                                                    Observações
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Informações adicionais sobre o cliente..."
                                                        className="resize-none"
                                                        rows={3}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEditDialogOpen(false)}
                                            disabled={editLoading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={editLoading}>
                                            {editLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Salvando...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Atualizar Cliente
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
