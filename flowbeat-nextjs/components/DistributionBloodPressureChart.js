"use client"

import ChartSkeleton from "./Skeleton/ChartSkeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const BloodPressureChart = ({ distributionByStatus, isDataMounted }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Distribusi Status Tekanan Darah</CardTitle>
        <CardDescription className="">Persentase pasien berdasarkan kategori tekanan darah dalam 5 minggu terakhir</CardDescription>
      </CardHeader>
      {isDataMounted ? (<ChartSkeleton />) : (
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
      )}
    </Card>
  )
}

export default BloodPressureChart