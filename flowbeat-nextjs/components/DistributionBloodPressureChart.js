"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

// const data = [
//   { date: "1 Jun", normal: 80, prehypertension: 15, hypertension: 5 },
//   { date: "8 Jun", normal: 75, prehypertension: 18, hypertension: 7 },
//   { date: "15 Jun", normal: 78, prehypertension: 16, hypertension: 6 },
//   { date: "22 Jun", normal: 82, prehypertension: 14, hypertension: 4 },
//   { date: "29 Jun", normal: 79, prehypertension: 17, hypertension: 4 },
// ]

const BloodPressureChart = ({ distributionByStatus }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Distribusi Status Tekanan Darah</CardTitle>
        <CardDescription className="">Persentase pasien berdasarkan kategori tekanan darah dalam 5 minggu terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={265}>
          <LineChart data={distributionByStatus}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Normal" stroke="#10b981" name="Normal" />
            <Line type="monotone" dataKey="Normal Tinggi" stroke="#f59e0b" name="Normal Tinggi" />
            <Line type="monotone" dataKey="Hipertensi Tinggi" stroke="#ef4444" name="Hipertensi" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default BloodPressureChart