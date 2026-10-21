'use client'
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import 'dayjs/locale/id'
dayjs.extend(relativeTime)
dayjs.locale('id')
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TableSkeleton from "./Skeleton/TableSkeleton";
import apiClient from "@/lib/api-client";

const PatientList = () => {
  const [ isTableMounted, setIsTableMounted ] = useState(true)
  const [patients, setPatients] = useState([])
  const [sortColumn, setSortColumn] = useState("")
  const [sortDirection, setSortDirection] = useState("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const router = useRouter()

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient(`/user`)
        const resData = await response.data
        
        if (resData.success) {
          setPatients(resData.data.data)
          setTotalPages(resData.data.last_page)
          setIsTableMounted(true)
          setTimeout(() => {
              setIsTableMounted(false)
          }, 1000)
        }
      } catch (error) {
        console.error("Error fetching patients:", error)
      }
    }
    fetchPatients()
  }, [currentPage])

  const sortedPatients = [...patients]
    .sort((a, b) => {
      if (sortColumn === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      return 0
    })
    .filter((patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  const handleSort = (column) => {
    setSortColumn(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }


  return (
    <div className="mt-8">
      <div className="flex max-sm:flex-col gap-2 sm:justify-between sm:items-center mb-4 max-sm:max-w-md">
        <Input
          placeholder="Cari pasien..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline">
          Filter <ChevronDown className="ml-2 h-4" />
        </Button>
      </div>
      <div className="rounded-md border max-sm:max-w-[88vw]">
        {isTableMounted ? (<TableSkeleton />) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  Nama{" "}
                  {sortColumn === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead>No HP</TableHead>
                <TableHead>Usia</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="w-[200px]">Tanggal Registrasi</TableHead>
                <TableHead className="text-right">Menu</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => router.push(`/patients/${patient.id}`)}
                    >
                      {patient.name}
                    </Button>
                  </TableCell>
                  <TableCell>{patient.phone_number}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.address}</TableCell>
                  <TableCell>{dayjs(patient.created_at).format("DD MMM YYYY HH:mm")}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Menu</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            navigator.clipboard.writeText(patient.phone_number.toString())
                          }
                        >
                          Salin No Hp Pasien
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Button
                          variant="link"
                          asChild
                          onClick={() => router.push(`/patients/${patient.id}`)}
                        >
                          <DropdownMenuItem>Detail pasien</DropdownMenuItem>
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PatientList;