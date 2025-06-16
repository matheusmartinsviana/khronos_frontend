import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ServiceTableSkeletonProps {
    rows?: number
}

export function ServiceTableSkeleton({ rows = 10 }: ServiceTableSkeletonProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">
                            <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead>
                            <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead className="w-[120px]">
                            <Skeleton className="h-4 w-12" />
                        </TableHead>
                        <TableHead className="w-[150px]">
                            <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-[120px]">
                            <Skeleton className="h-4 w-20" />
                        </TableHead>
                        <TableHead className="w-[100px]">
                            <Skeleton className="h-4 w-16" />
                        </TableHead>
                        <TableHead className="w-[100px]">
                            <Skeleton className="h-4 w-12" />
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }).map((_, index) => (
                        <TableRow key={index}>
                            <TableCell>
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-full max-w-[200px]" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-4 w-16" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8" />
                                    <Skeleton className="h-8 w-8" />
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
