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
        const response = await apiClient(`/patients?page=${currentPage}`)
        const data = await response.data
        if (data.success) {
          setPatients(data.patients.data)
          setTotalPages(data.patients.last_page)
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
        return sortDirection === "asc" ? a.first_name.localeCompare(b.first_name) : b.first_name.localeCompare(a.first_name)
      }
      if (sortColumn === "age") {
        return sortDirection === "asc" ? a.age - b.age : b.age - a.age
      }
      return 0
    })
    .filter((patient) =>
      patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const handleSort = (column) => {
    setSortColumn(column);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Rendah":
        return "bg-blue-500"
      case "Normal":
        return "bg-green-500"
      case "Normal Tinggi":
        return "bg-yellow-500"
      case "Hipertensi Tinggi":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getLastCheckupTime = (healthData) => {
    if (!healthData || healthData.length === 0) return "Belum ada data"
    return dayjs(healthData[0].created_at).fromNow()
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
                <TableHead className="w-[100px]">MRN</TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                  Nama{" "} {sortDirection === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : null}
                  {sortColumn === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead className="cursor-pointer w-4" onClick={() => handleSort("age")}>
                  Usia{" "}
                  {sortColumn === "age" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="inline h-4 w-4" />
                    ) : (
                      <ChevronDown className="inline h-4 w-4" />
                    ))}
                </TableHead>
                <TableHead>Tekanan Darah Terakhir</TableHead>
                <TableHead className="w-40">Denyut terakhir</TableHead>
                <TableHead className="w-40">Spo2</TableHead>
                <TableHead className="">Terakhir Diperiksa</TableHead>
                <TableHead className="text-right w-[96px] ">Menus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPatients.map((patient) => {
                const lastBP = patient.health_data.length > 0
                  ? `${patient.health_data[0].sys}/${patient.health_data[0].dia}`
                  : "N/A";
                const status = patient.health_data.length > 0 ? patient.health_data[0].status : "Tidak ada data"

                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">...{patient.uuid.slice(-5)}</TableCell>
                      <TableCell>
                        <Button variant="link" className="p-0" onClick={() => router.push(`/patients/${patient.uuid}`)}>
                          {`${patient.first_name} ${patient.last_name || ""}`}
                        </Button>
                      </TableCell>
                    <TableCell>{patient.age || "♾️"}</TableCell>
                    <TableCell>{lastBP}</TableCell>
                    <TableCell>{lastBP}</TableCell>
                    <TableCell>{lastBP}</TableCell>
                    {/* <TableCell>
                      <Badge className={`${getStatusColor(status)} text-white`}>{status}</Badge>
                    </TableCell> */}
                    <TableCell>{getLastCheckupTime(patient.health_data)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Menu</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(patient.uuid.toString())}>
                            Salin MRN Pasien
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <Button variant="link" asChild onClick={() => router.push(`/patients/${patient.uuid}`)}>
                            <DropdownMenuItem>Detail pasien</DropdownMenuItem>
                          </Button>
                          <Button asChild>
                            <DropdownMenuItem>Laporkan!</DropdownMenuItem>
                          </Button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
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