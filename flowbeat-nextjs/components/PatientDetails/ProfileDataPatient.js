import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfilePatientSkeleton from "../Skeleton/ProfilePatientSkeleton";
const ProfileDataPatient = ({ patient, isDataMounted }) => {
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
                        <p>{patient?.name || "--"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Usia</p>
                        <p>{patient?.age ? `${patient.age} tahun` : "--"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Nomor Telepon</p>
                        <p>{patient?.phone_number || "--"}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium">Alamat</p>
                        <p>{patient?.address || "--"}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Tanggal Registrasi</p>
                        <p>
                            {patient?.created_at
                                ? new Date(patient.created_at).toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })
                                : "--"}
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default ProfileDataPatient;