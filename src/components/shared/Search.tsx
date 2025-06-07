import {
    Form,
    FormControl,
    FormField,
    FormItem,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"

import { type UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { Search as SearchIcon } from "lucide-react"

const formSchema = z.object({
    search: z.string()
})
type SearchFormData = z.infer<typeof formSchema>

interface Props {
    title: string
    form: UseFormReturn<SearchFormData>
    onSearch: (data: SearchFormData) => void
    count?: number
    onHandleClickAdd?: () => void
}

export default function Search({ form, title, onSearch, onHandleClickAdd, count }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    className="flex w-full gap-5 items-center">
                    {
                        onHandleClickAdd && (
                            <Button className='w-2/12' type="button" onClick={onHandleClickAdd}>
                                Adicionar
                            </Button>
                        )
                    }

                    <Form {...form}>
                        <form
                            className="flex w-full"
                            onSubmit={form.handleSubmit(onSearch)}
                        >
                            <FormField
                                control={form.control}
                                name="search"
                                render={({ field }) => (
                                    <FormItem className="w-full">
                                        <FormControl>
                                            <Input
                                                type="text"
                                                className="rounded-br-none rounded-tr-none"
                                                placeholder={`Buscar por ${title}`}
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                className="w-1/7 rounded-bl-none rounded-tl-none"
                                type="submit"
                            >
                                <SearchIcon />
                            </Button>
                        </form>
                    </Form>

                    {
                        count && (
                            <div className="w-2/12">
                                Total: {count}
                            </div>
                        )
                    }
                </div>
            </CardContent>
        </Card>
    )
}
