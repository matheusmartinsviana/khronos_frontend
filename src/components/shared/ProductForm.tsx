"use client"

import type React from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormData } from "@/schemas/productSchema"
import { Loader2, Save, Package } from "lucide-react"

interface ProductFormProps {
    initialData?: ProductFormData
    onSubmit: (data: ProductFormData) => Promise<void>
    isLoading?: boolean
    categories?: { id: number; name: string }[]
}

export default function ProductForm({ initialData, onSubmit, isLoading = false, categories = [] }: ProductFormProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: "",
            description: "",
            price: 0,
            code: "",
            product_type: "",
            category_id: undefined,
            zoning: "",
        },
    })

    const handleSubmit = async (data: ProductFormData) => {
        await onSubmit(data)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Garantir que categories é um array válido
    const validCategories = Array.isArray(categories)
        ? categories.filter((cat) => cat && typeof cat.id === "number" && cat.name)
        : []

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-red-600" />
                                        Nome do produto <span className="text-red-600">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o nome do produto" {...field} />
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
                                    <FormLabel>
                                        Código do produto <span className="text-red-600">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o código do produto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preço (R$)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="0,00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="product_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de produto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o tipo do produto" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="category_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoria</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            if (value === "-1") {
                                                field.onChange(undefined)
                                            } else {
                                                field.onChange(value ? Number(value) : undefined)
                                            }
                                        }}
                                        value={field.value ? field.value.toString() : ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma categoria" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="-1">Sem categoria</SelectItem>
                                            {validCategories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="zoning"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zoneamento</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Digite o zoneamento" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div>
                        <FormLabel>Imagem do produto</FormLabel>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />
                        {imagePreview && (
                            <div className="mt-2 border rounded-md p-2 w-full max-w-xs">
                                <img
                                    src={imagePreview || "/placeholder.svg"}
                                    alt="Preview"
                                    className="max-h-40 object-contain mx-auto"
                                />
                            </div>
                        )}
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Descreva o produto" {...field} className="min-h-[80px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {initialData ? "Atualizando..." : "Cadastrando..."}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {initialData ? "Atualizar produto" : "Cadastrar produto"}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
