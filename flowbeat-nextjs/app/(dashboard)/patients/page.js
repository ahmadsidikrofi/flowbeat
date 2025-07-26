'use client'
import CardStatus from "@/components/CardStatus";
import Header from "@/components/Header";
import PatientList from "@/components/PatientList";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { HeartPulse, PlusCircle, UserCogIcon, UserPlus2, UsersIcon, UsersRound } from "lucide-react";

const PatientsPage = () => {
    return (
        <SidebarInset>
            <main className="px-4 py-2 w-full h-full flex flex-col">
                <Header
                    leftTitle="Daftar Pasien"
                    rightTitle="Pasiennya Flowbeat"
                    description="Manajemen dan pemantauan seluruh pasien"
                    icon={<UsersIcon />}
                />
                <Separator className="my-8 max-w-screen-2xl" />
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Ringkasan</h2>
                    <Button>
                        <PlusCircle /> Daftarkan Pasien
                    </Button>
                </div>
                {/* <div className="grid lg:grid-cols-4 md:grid-cols-2 max-sm:grid-cols-2 gap-8">
                    <CardStatus
                        title="Total Pasien"
                        description="+20% dari bulan lalu"
                        icon={<UsersRound className="h-4 w-4 text-muted-foreground"/>}
                        value={20}
                    />
                    <CardStatus
                        title="Pasien Baru"
                        description="Minggu ini"
                        value={21}
                        icon={<UserPlus2 className="h-4 w-4 text-muted-foreground" />}
                    />
                    <CardStatus
                        title="Pasien Tidak Aktif"
                        description="1 bulan terakhir"
                        value={23}
                        icon={<UserCogIcon className="h-4 w-4 text-muted-foreground" />}
                    />
                    <CardStatus
                        title="Rata-rata tekanan darah"
                        description={"mmhg"}
                        value={"120/80"}
                    />
                </div> */}
                <div className="flex-1">
                    <PatientList />
                </div>
            </main>
        </SidebarInset>
     );
}
 
export default PatientsPage;