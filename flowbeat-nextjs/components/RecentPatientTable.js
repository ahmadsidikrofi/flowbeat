import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

const getStatusColor = (status) => {
  if (status === "Rendah") {
    return "bg-blue-500"
  } else if (status === "Normal") {
    return "bg-green-500"
  } else if (status === "Normal Tinggi") {
    return "bg-yellow-500"
  } else if (status === "Hipertensi Tinggi") {
    return "bg-red-500"
  } else {
    return "bg-gray-500"
  }
}

const RecentPatientsTable = ({ recentPatients }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-medium">Pasien Terbaru</CardTitle>
        <CardDescription className="">Daftar pasien yang baru diperiksa</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Nama</TableHead>
              <TableHead className="text-left">Tekanan Darah</TableHead>
              <TableHead className="text-center font-medium">Status</TableHead>
              <TableHead className="text-right">Terakhir Diperiksa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPatients.map((patient) => (
              <TableRow key={patient.id} className="p-12">
                <TableCell className="">{patient.first_name}</TableCell>
                <TableCell className="">{patient.lastBP}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(patient.status)} rounded-full text-nowrap`}>{patient.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{patient.lastVisit}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default RecentPatientsTable