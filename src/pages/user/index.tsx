"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { getUser, getUserById, createUser, updateUser, removeUser, createSalesperson } from "@/api/user"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrashIcon, PenIcon, UserPlus, Search, Loader2, Save, User, Mail, Shield } from "lucide-react"

const searchSchema = z.object({
    search: z.string(),
})

const userSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional().or(z.literal("")),
    role: z.enum(["salesperson", "admin", "viewer", "blocked"]),
})

type SearchFormData = z.infer<typeof searchSchema>
type UserFormData = z.infer<typeof userSchema>

interface UserData {
    user_id: number
    name: string
    email: string
    password?: string
    role: "salesperson" | "admin" | "viewer" | "blocked"
    createdAt?: string
    updatedAt?: string
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [salespersonDialogOpen, setSalespersonDialogOpen] = useState(false)
    const [idToDelete, setIdToDelete] = useState<string | null>(null)
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
    const [currentUser, setCurrentUser] = useState<UserData | null>(null)
    const [editLoading, setEditLoading] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)

    const searchForm = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            search: "",
        },
    })

    const userForm = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "viewer",
        },
    })

    const editForm = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "viewer",
        },
    })

    const salespersonForm = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "salesperson",
        },
    })

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await getUser()

            const usersFormatted: UserData[] = Array.isArray(response.data)
                ? response.data.map((item: any) => ({
                    user_id: item.user_id,
                    name: item.name || "Nome não informado",
                    email: item.email || "",
                    role: item.role || "viewer",
                    createdAt: item.createdAt || item.created_at,
                    updatedAt: item.updatedAt || item.updated_at,
                }))
                : []

            setUsers(usersFormatted)
            setFilteredUsers(usersFormatted)
        } catch (error) {
            console.error("Erro ao buscar usuários:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUser = async (userId: string) => {
        try {
            setEditLoading(true)
            const response = await getUserById(userId)
            const user = response.data
            setCurrentUser(user)

            editForm.reset({
                name: user.name || "",
                email: user.email || "",
                password: "",
                role: user.role || "viewer",
            })
        } catch (error) {
            console.error("Erro ao buscar usuário:", error)
        } finally {
            setEditLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const onSearch = (data: SearchFormData) => {
        const searchTerm = data.search.toLowerCase()
        if (!searchTerm) {
            setFilteredUsers(users)
        } else {
            const filtered = users.filter(
                (user) => user.name?.toLowerCase().includes(searchTerm) || user.email?.toLowerCase().includes(searchTerm),
            )
            setFilteredUsers(filtered)
        }
    }

    const onAdd = () => {
        setCreateDialogOpen(true)
    }

    const onCreateSalesperson = () => {
        setSalespersonDialogOpen(true)
    }

    const onEdit = async (userId: string) => {
        await fetchUser(userId)
        setEditDialogOpen(true)
    }

    const handleOpenDeleteModal = (userId: string) => {
        setIdToDelete(userId)
        setDeleteDialogOpen(true)
    }

    const confirmDelete = async () => {
        if (idToDelete !== null) {
            try {
                await removeUser(idToDelete)
                await fetchUsers()
            } catch (error) {
                console.error("Erro ao deletar usuário:", error)
            }
        }
        setDeleteDialogOpen(false)
        setIdToDelete(null)
    }

    const onSubmitCreate = async (data: UserFormData) => {
        setCreateLoading(true)
        try {
            await createUser(data)
            setCreateDialogOpen(false)
            userForm.reset()
            await fetchUsers()
        } catch (error) {
            console.error("Erro ao salvar usuário:", error)
        } finally {
            setCreateLoading(false)
        }
    }

    const onSubmitEdit = async (data: UserFormData) => {
        if (!currentUser?.user_id) return

        setEditLoading(true)
        try {
            // Remove password if empty
            const updateData = data.password ? data : { ...data, password: undefined }
            await updateUser(currentUser.user_id.toString(), updateData)
            setEditDialogOpen(false)
            await fetchUsers()
        } catch (error) {
            console.error("Erro ao atualizar usuário:", error)
        } finally {
            setEditLoading(false)
        }
    }

    const onSubmitSalesperson = async (data: UserFormData) => {
        setCreateLoading(true)
        try {
            await createSalesperson(data)
            setSalespersonDialogOpen(false)
            salespersonForm.reset()
            await fetchUsers()
        } catch (error) {
            console.error("Erro ao criar vendedor:", error)
        } finally {
            setCreateLoading(false)
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "admin":
                return "Administrador"
            case "salesperson":
                return "Vendedor"
            case "viewer":
                return "Visualizador"
            case "blocked":
                return "Bloqueado"
            default:
                return "Visualizador"
        }
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                        <p className="text-gray-600">Gerencie os usuários do sistema</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={onAdd} className="w-full sm:w-auto">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Novo Usuário
                        </Button>
                        <Button onClick={onCreateSalesperson} variant="outline" className="w-full sm:w-auto">
                            <Shield className="mr-2 h-4 w-4" />
                            Novo Vendedor
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex gap-2 w-full sm:max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Pesquisar usuários..."
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
                        {filteredUsers.length} usuário{filteredUsers.length !== 1 ? "s" : ""} encontrado
                        {filteredUsers.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* Lista de Usuários */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                        <span className="ml-2 text-gray-600">Carregando usuários...</span>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <UserPlus className="mx-auto h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                        <p className="text-gray-600 mb-4">
                            {searchForm.watch("search") ? "Tente ajustar sua pesquisa" : "Comece cadastrando seu primeiro usuário"}
                        </p>
                        {!searchForm.watch("search") && (
                            <Button onClick={onAdd}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Cadastrar Usuário
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
                                            Usuário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contato
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Função
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                                                        ? "bg-red-100 text-red-800"
                                                        : user.role === "salesperson"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : user.role === "viewer"
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {getRoleLabel(user.role)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => onEdit(user.user_id.toString())}>
                                                        <PenIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteModal(user.user_id.toString())}
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
                            <DialogTitle>Deseja realmente deletar este usuário?</DialogTitle>
                            <DialogDescription>
                                Esta ação não poderá ser desfeita. Todos os dados do usuário serão permanentemente removidos.
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
                    <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <PenIcon className="h-5 w-5 text-red-600" />
                                Editar Usuário
                            </DialogTitle>
                            <DialogDescription>Atualize os dados do usuário</DialogDescription>
                        </DialogHeader>

                        {editLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="animate-spin h-8 w-8 text-red-600" />
                                <span className="ml-2 text-gray-600">Carregando dados do usuário...</span>
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

                                    {/* Email e Telefone */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-red-600" />
                                                        Email <span className="text-red-600">*</span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="email@exemplo.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Função e Status */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={editForm.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        <Shield className="h-4 w-4 text-red-600" />
                                                        Função <span className="text-red-600">*</span>
                                                    </FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione a função" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="user">Usuário</SelectItem>
                                                            <SelectItem value="salesperson">Vendedor</SelectItem>
                                                            <SelectItem value="admin">Administrador</SelectItem>
                                                            <SelectItem value="viewer">Visualizador</SelectItem>
                                                            <SelectItem value="blocked">Bloqueado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Senha */}
                                    <FormField
                                        control={editForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-red-600" />
                                                    Nova Senha (deixe em branco para manter)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="Nova senha" {...field} />
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
                                                    Atualizar Usuário
                                                </>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Dialog de Criação */}
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-red-600" />
                                Cadastrar Novo Usuário
                            </DialogTitle>
                            <DialogDescription>Preencha os dados do novo usuário</DialogDescription>
                        </DialogHeader>

                        <Form {...userForm}>
                            <form onSubmit={userForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                                {/* Nome */}
                                <FormField
                                    control={userForm.control}
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

                                {/* Email e Telefone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={userForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-red-600" />
                                                    Email <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@exemplo.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Função e Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={userForm.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-red-600" />
                                                    Função <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione a função" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="user">Usuário</SelectItem>
                                                        <SelectItem value="salesperson">Vendedor</SelectItem>
                                                        <SelectItem value="admin">Administrador</SelectItem>
                                                        <SelectItem value="viewer">Visualizador</SelectItem>
                                                        <SelectItem value="blocked">Bloqueado</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Senha */}
                                <FormField
                                    control={userForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-red-600" />
                                                Senha <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Senha" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateDialogOpen(false)}
                                        disabled={createLoading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={createLoading}>
                                        {createLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Salvar Usuário
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Dialog de Criação de Vendedor */}
                <Dialog open={salespersonDialogOpen} onOpenChange={setSalespersonDialogOpen}>
                    <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-600" />
                                Cadastrar Novo Vendedor
                            </DialogTitle>
                            <DialogDescription>Preencha os dados do novo vendedor</DialogDescription>
                        </DialogHeader>

                        <Form {...salespersonForm}>
                            <form onSubmit={salespersonForm.handleSubmit(onSubmitSalesperson)} className="space-y-4">
                                {/* Nome */}
                                <FormField
                                    control={salespersonForm.control}
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

                                {/* Email e Telefone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={salespersonForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-red-600" />
                                                    Email <span className="text-red-600">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="email@exemplo.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Status */}
                                <FormField
                                    control={salespersonForm.control}
                                    name="role"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-red-600" />
                                                Função <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione a função" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="salesperson">Vendedor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Senha */}
                                <FormField
                                    control={salespersonForm.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-red-600" />
                                                Senha <span className="text-red-600">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Senha" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setSalespersonDialogOpen(false)}
                                        disabled={createLoading}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit" disabled={createLoading}>
                                        {createLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Salvar Vendedor
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
