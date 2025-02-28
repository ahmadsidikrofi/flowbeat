"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Dot, HeartPulse, UsersRound } from "lucide-react"
import { BloodPressureChart } from "./BloodPressureChart"
import VitalSignChart from "./VitalSignChart"
import ControlDelayDropdown from "../ControlDelayLayer/ControlDelayDropdown"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Button } from "../ui/button"
import HealthInsight from "./HealthInsight"
import { useState } from "react"
import TableSkeleton from "../Skeleton/TableSkeleton"

const MedicalHistory = ({ patientHealthData, bloodPressureData, VitalSignData, currentPage, setCurrentPage, totalPages, isDataMounted }) => {
  const [ isTableMounted, setIsTableMounted ] = useState(true)
  setTimeout(() => setIsTableMounted(false), 3000)
  return (
    <div className="space-y-4 flex-1">
      <ControlDelayDropdown />
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Grafik Tekanan Darah</CardTitle>
        </CardHeader>
        <BloodPressureChart isDataMounted={isDataMounted} bloodPressureData={bloodPressureData}/>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Grafik Tanda Vital (coming soon)</CardTitle>
        </CardHeader>
        <VitalSignChart isDataMounted={isDataMounted} VitalSignData={VitalSignData}/>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex gap-2 items-center">
            <CardTitle className="text-xl">Riwayat Medis</CardTitle>
            <HealthInsight />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          {isTableMounted ? (<TableSkeleton />) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap">SYS / DIA</TableHead>
                  <TableHead className="whitespace-nowrap">Denyut</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">SpO2</TableHead>
                  <TableHead className="whitespace-nowrap hidden md:table-cell">Pergerakan</TableHead>
                  <TableHead className="whitespace-wrap hidden lg:table-cell">{`Denyut Tidak\nTeratur`}</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patientHealthData.data?.map((healthData, index) => (
                  <TableRow key={index}>
                    <TableCell data-label="Tanggal">{healthData.created_at}</TableCell>
                    <TableCell data-label="SYS / DIA">{healthData.sys} / {healthData.dia}</TableCell>
                    <TableCell data-label="Denyut">{healthData.bpm}</TableCell>
                    <TableCell data-label="SpO2" className="hidden md:table-cell">96</TableCell>
                    <TableCell data-label="Pergerakan" className="hidden md:table-cell cursor-cell">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {healthData.mov ? <UsersRound className="h-4 text-red-500" /> : <Dot className="h-4 text-gray-400" />}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Terdeteksi pergerakan tubuh ketika pemeriksaan</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell data-label="Denyut Tidak Teratur" className="hidden lg:table-cell cursor-cell">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {healthData.ihb ? <HeartPulse className="h-4 text-red-500" /> : <Dot className="h-4 text-gray-400" />}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Jantung tidak berdenyut dengan lancar</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell data-label="Status">{healthData.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>
      <div className="flex items-center justify-end space-x-2 pb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentPage((prev) => Math.max(prev - 1, 1))
            setIsTableMounted(true)
          }}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            setIsTableMounted(true)
          }}
          disabled={currentPage === totalPages}
        >
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export default MedicalHistory