"use client"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dot, HeartPulse, UsersRound } from "lucide-react"
import { BloodPressureChart } from "../BloodPressureChart"

const MedicalHistory = ({ patient, bloodPressureData }) => {
  return (
    <div className="space-y-4 flex-1">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Grafik Tekanan Darah</CardTitle>
        </CardHeader>
        <BloodPressureChart bloodPressureData={bloodPressureData}/>
      </Card>
      <Card>
        <BloodPressureChart bloodPressureData={bloodPressureData}/>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Riwayat Medis</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                <TableHead className="whitespace-nowrap">SYS / DIA</TableHead>
                <TableHead className="whitespace-nowrap">Denyut</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">SpO2</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Pergerakan</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">Denyut Tidak Teratur</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patient?.health_data?.map((patient, index) => (
                <TableRow key={index}>
                  <TableCell data-label="Tanggal">{patient.created_at}</TableCell>
                  <TableCell data-label="SYS / DIA">{patient.sys} / {patient.dia}</TableCell>
                  <TableCell data-label="Denyut">{patient.bpm}</TableCell>
                  <TableCell data-label="SpO2" className="hidden md:table-cell">96</TableCell>
                  <TableCell data-label="Pergerakan" className="hidden md:table-cell">
                    {patient.mov ? <UsersRound className="h-4 text-red-500" /> : <Dot className="h-4 text-gray-400" />}
                  </TableCell>
                  <TableCell data-label="Denyut Tidak Teratur" className="hidden lg:table-cell">
                    {patient.ihb ? <HeartPulse className="h-4 text-red-500" /> : <Dot className="h-4 text-gray-400" />}
                  </TableCell>
                  <TableCell data-label="Status">{patient.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

export default MedicalHistory