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
                <div className="flex-1">
                    <PatientList />
                </div>
            </main>
        </SidebarInset>
     );
}
 
export default PatientsPage;