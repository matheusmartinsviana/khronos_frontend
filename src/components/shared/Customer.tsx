import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Search from "./Search"
import GenericList from "./List"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { TrashIcon, PenIcon } from "lucide-react"

const customerHeader = { id: "ID", name: "Nome", documentNumber: "CPF/CNPJ" }
const mockCliente = [
    { id: 1, name: "Cliente A", documentNumber: 100 },
    { id: 2, name: "Cliente B", documentNumber: 150 },
    { id: 3, name: "Cliente C", documentNumber: 200 },
]

const formSchema = z.object({
    search: z.string()
})
type SearchFormData = z.infer<typeof formSchema>

export default function CustomerList() {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [idToDelete, setIdToDelete] = useState<number | null>(null)

    const navigate = useNavigate();

    const form = useForm<SearchFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            search: ""
        },
    })

    const onSearch = (data: SearchFormData) => {
        console.log("Refazer a requisição considerando o filtro", data.search)
    }

    const onAdd = () => {
        navigate("/clientes/add")
    }
    const onEdit = () => { }

    const handleOpenDeleteModal = (id: number) => {
        setIdToDelete(id)
        setDialogOpen(true)
    }

    const confirmDelete = () => {
        if (idToDelete !== null) {
            console.log("Deletando: ", idToDelete)
            // Aqui você faria a requisição de deleção real
        }
        setDialogOpen(false)
        setIdToDelete(null)
    }

    return (
        <div className="flex flex-col gap-8 w-3xl">
            <Search
                title={'Clientes'}
                form={form}
                onSearch={onSearch}
                count={mockCliente.length}
                onHandleClickAdd={onAdd}
            />
            <GenericList
                itemsHeader={customerHeader}
                items={mockCliente}
                renderActions={(item) => (
                    <>
                        <Button variant="outline" onClick={onEdit}><PenIcon /></Button>
                        <Button variant="destructive" onClick={() => handleOpenDeleteModal(item.id)}><TrashIcon /></Button>
                    </>
                )}
                emptyMessage="Nenhum cliente encontrado"
            />

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Deseja realmente deletar?</DialogTitle>
                        <DialogDescription>
                            Essa ação não poderá ser desfeita.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Confirmar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
