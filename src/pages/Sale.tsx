import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import Seo from "@/lib/Seo";
import metaData from "@/utils/metadata";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { z } from "zod"
import { Input } from "@/components/ui/input";

const billingMethodEnum = z.enum(["pix", "boleto", "debitCard", "creditCard"])

const formSchema = z.object({
    billingMethod: billingMethodEnum,
    times: z.coerce.number().min(1, "Quantidade de parcelas é obrigatória").max(12, "Qunatidade máxima de parcelas é 12"),
})

type ProductFormData = z.infer<typeof formSchema>

const billingMethodLabels: Record<z.infer<typeof billingMethodEnum>, string> = {
    pix: "Pix",
    debitCard: "Cartão de Débito",
    creditCard: "Cartão de Crédito",
    boleto: "Boleto",
}

export default function Sale() {
    const form = useForm<ProductFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            billingMethod: "pix",
            times: 1,
        },
    })
    const billingMethod = form.watch("billingMethod")

    const meta = metaData["/venda"];
    
    const onSubmit = (data: ProductFormData) => {
        console.log("Venda cadastrada:", data)
    }

    return (
        <>
            <Seo
                title={meta.title}
                description={meta.description}
                image={meta.image}
                canonical={meta.canonical}
                schemaMarkup={meta.schemaMarkup}
            />
            <Card className="w-3xl shadow-md">
                <CardHeader>
                    <CardTitle>Informações para Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-10">
                    <Form {...form}  >
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="billingMethod"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Forma de Pagamento</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecione o método de pagamento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {billingMethodEnum.options.map((method) => (
                                                        <SelectItem key={method} value={method}>
                                                            {billingMethodLabels[method]}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>

                                    </FormItem>
                                )}
                            />
                            {
                                billingMethod == 'creditCard' && (
                                    <FormField
                                        control={form.control}
                                        name="times"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parcelas</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        className="input px-3 py-2 border rounded w-full"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )
                            }
                            <Button type="submit" className="w-full">Efetivar Pedido</Button>
                            <FormMessage />
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </>
    )
}