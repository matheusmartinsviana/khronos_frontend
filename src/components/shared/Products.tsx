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

const formSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    observation: z.string().min(1, "Descrição é obrigatória"),
    price: z.coerce.number().min(0, "Preço deve ser positivo"),
    code: z.coerce.string().min(1, "O código do produto é obrigatório"),
})

type ProductFormData = z.infer<typeof formSchema>

export default function ProductForm() {
    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            observation: "",
            price: 0,
            code: "",
        },
    })

    const onSubmit = (data: ProductFormData) => {
        console.log("Produto cadastrado:", data)
    }

    return (
        <div className="flex items-center justify-center p-4 w-full">
            <Card className="w-3xl shadow-md">
                <CardHeader>
                    <CardTitle>Cadastro de Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Informe o nome do produto:</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Informe o código do produto:</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Informe o preço do produto (R$):</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Realize o upload da imagem do produto:</FormLabel>
                                        <Input type="file" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="observation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observação</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Observação do produto" {...field} className="max-h-[200px]   " />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Cadastrar novo produto
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
