import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    birthday: z.coerce.string().min(1, "Data de nascimento é obrigatória"),
    documentNumber: z.coerce.string().min(1, "Documento é obrigatório"),
    rg: z.coerce.number().optional(),
    nacionality: z.string().optional(),
    status: z.string().optional(),
    gender: z.string().optional(),
    observation: z.string(),
    cep: z.string().optional(),
    address: z.string().optional(),
    addressNumber: z.coerce.number().optional(),
})

type CustomerFormData = z.infer<typeof formSchema>

export default function CustomerForm() {
    const navigate = useNavigate()
    const form = useForm<CustomerFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            birthday: "",
            documentNumber: "",
            rg: 0,
            observation: "",
            nacionality: "",
            status: "",
            gender: "",
            cep: "",
            address: "",
            addressNumber: 0,
        },
    })

    const onSubmit = (data: CustomerFormData) => {
        console.log("Cliente cadastrado:", data)
    }

    return (
        <Card className="w-3xl shadow-md">
            <CardHeader>
                <CardTitle>Cadastro de Cliente</CardTitle>
            </CardHeader>

            <CardContent>
                <Form {...form}>
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome Completo:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="birthday"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data de Nascimento:</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="date" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="documentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CPF/CNPJ:</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="text" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rg"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>RG:</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nacionality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nacionalidade:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status Civil:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Gênero:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CEP:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Endereço:</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="addressNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Número:</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="md:col-span-2">
                            <FormField
                                control={form.control}
                                name="observation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observação:</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Observação do cliente" className="max-h-[200px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="w-full"
                            >
                                Cadastrar
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}