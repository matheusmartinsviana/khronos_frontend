"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createCustomer } from "@/api/customer-api"
import { clienteSchema, type ClienteFormData } from "@/schemas/clienteSchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Mail, Phone, MapPin, FileText, Loader2, Save } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function CadastroClientePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const form = useForm<ClienteFormData>({
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

    const onSubmit = async (data: ClienteFormData) => {
        setLoading(true)

        try {
            await createCustomer(data)
            navigate("/clientes")
        } catch (error) {
            console.error("Erro ao cadastrar cliente:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        navigate("/clientes")
    }

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

                {/* Formulário */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-red-600" />
                            Dados do Cliente
                        </CardTitle>
                        <CardDescription>Preencha as informações básicas do cliente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Nome */}
                                <FormField
                                    control={form.control}
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
                                        control={form.control}
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
                                        control={form.control}
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
                                        control={form.control}
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
                                        control={form.control}
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
                                    control={form.control}
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
            </div>
        </div>
    )
}
