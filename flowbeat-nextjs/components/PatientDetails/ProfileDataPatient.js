import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfilePatientSkeleton from "../Skeleton/ProfilePatientSkeleton";
const ProfileDataPatient = ({ patient, lastVisit, isDataMounted }) => {

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
        <Card className="h-[46rem] lg:w-80 max-sm:w-full">
            <CardHeader>
                <CardTitle className="text-xl">Informasi Pasien</CardTitle>
            </CardHeader>
            {isDataMounted ? (<ProfilePatientSkeleton />) : (
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Nama</p>
                        <p>{patient?.first_name || '--'} {patient?.last_name || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Usia</p>
                        <p>{patient?.age || '--'} tahun</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tanggal Lahir</p>
                        <p>{patient?.date_of_birth || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Jenis Kelamin</p>
                        <p>{patient?.gender || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Nomor Telepon</p>
                        <p>{patient?.phone_number || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Alamat</p>
                        <p>{patient?.address || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tekanan Darah Terakhir</p>
                        <p>{patient?.health_data?.[0]?.sys || '--'} / {patient?.health_data?.[0]?.dia || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Status</p>
                        <Badge className={`${getStatusColor(patient?.health_data?.[0].status || '--')} text-white`}>
                            {patient?.health_data?.[0].status || '--'}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Terakhir Diperiksa</p>
                        <p>{lastVisit || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tinggi Badan</p>
                        <p>{patient?.height || '--'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Berat Badan</p>
                        <p>{patient?.weight || '--'}</p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ProfileDataPatient;