import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfilePatientSkeleton from "../Skeleton/ProfilePatientSkeleton";
const ProfileDataPatient = ({ patient, lastVisit, isDataMounted, patientHealthData}) => {
    const getStatusColor = (status) => {
        switch (status) {
            case "Rendah":
                return "bg-blue-500"
            case "Normal":
                return "bg-green-500";
            case "Normal Tinggi":
                return "bg-yellow-500";
            case "Hipertensi Tinggi":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <Card className="h-full max-sm:w-full">
            <CardHeader>
                <CardTitle className="text-xl">Informasi Pasien</CardTitle>
            </CardHeader>
            {isDataMounted ? (<ProfilePatientSkeleton />) : (
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Nama</p>
                        <p>{patient?.name || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Usia</p>
                        <p>{patient?.age || '--'} tahun</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Jenis Kelamin</p>
                        <p>{patient?.gender || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tekanan Darah Terakhir</p>
                        <p>{patientHealthData.data?.[0]?.sys !== undefined ? `${patientHealthData.data[0].sys} / ${patientHealthData.data[0].dia}` : '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge className={`${getStatusColor(patientHealthData.data?.[0]?.status || '--')} text-white`}>
                            {patientHealthData.data?.[0]?.status || '--'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Terakhir Diperiksa</p>
                        <p>{lastVisit ? new Date(lastVisit).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) : '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tinggi Badan</p>
                        <p>{patient?.tb ? `${patient.tb} cm` : '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Berat Badan</p>
                        <p>{patient?.bb ? `${patient.bb} kg` : '--'}</p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ProfileDataPatient;