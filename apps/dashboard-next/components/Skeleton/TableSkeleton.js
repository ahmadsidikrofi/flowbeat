'use client'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "../ui/skeleton"

const TableSkeleton = () => {
    return (
        <Table>
            <TableHeader>
                <TableRow className="max-sm:text-[12px]">
                    <TableHead className="p-4 max-sm:text-nowrap">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50" />
                    </TableHead>
                    <TableHead>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50" />
                    </TableHead>
                    <TableHead>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50" />
                    </TableHead>
                    <TableHead>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50" />
                    </TableHead>
                    <TableHead>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50" />
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow className="text-left max-sm:text-[12px]">
                    <TableCell className="p-5">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                </TableRow>
                <TableRow className="text-left max-sm:text-[12px]">
                    <TableCell className="p-5">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                </TableRow>
                <TableRow className="text-left max-sm:text-[12px]">
                    <TableCell className="p-5">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                </TableRow>
                <TableRow className="text-left max-sm:text-[12px]">
                    <TableCell className="p-5">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                </TableRow>
                <TableRow className="text-left max-sm:text-[12px]">
                    <TableCell className="p-5">
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 w-24" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 inset-0 bg-gradient-to-br from-transparent to-blue-500/50 text-right w-48" />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}
export default TableSkeleton