'use client'
import { LayoutDashboardIcon } from "lucide-react";
import CardStatus from "./CardStatus";
import Header from "./Header";
import { Separator } from "./ui/separator";
import QuickSearch from "./QuickSearch";
import ChartBarItem from "./BarChartItem"
import RecentPatientsTable from "./RecentPatientTable";
import { useEffect, useState } from "react";
import DistributionBloodPressureChart from "./DistributionBloodPressureChart"
import { useAuth } from "@clerk/nextjs";
import { mobileApiService, setupMobileAuthInterceptor } from "@/lib/mobile-api-service";

const DashboardContainer = () => {
    const [ patientCount, setPatientCount ] = useState(0)
    const [ normalPatient, setNormalPatient ] = useState(0)
    const [ riskPatient, setRiskPatient ] = useState(0)
    const [ checkedToday, setCheckedToday ] = useState(0)
    const [ notCheckedToday, setNotCheckedToday ] = useState(0)
    const [ recentPatients, setRecentPatients ] = useState([])
    const [ distributionByStatus, setDistributionByStatus ] = useState([])
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const { getToken } = useAuth()

    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 1500)
        setupMobileAuthInterceptor(getToken)
        fetchDashboardData()
    }, [getToken])

    const fetchDashboardData = async () => {
        try {
            // Step 1: Ambil id_user dari endpoint /api/doctor (mapping Clerk → FastAPI)
            const doctorProfile = await mobileApiService.getDoctorProfile()
            const idUser = doctorProfile?.id_user

            if (!idUser) {
                console.warn('[Dashboard] id_user tidak tersedia — /api/doctor belum aktif')
                return
            }

            // Step 2: Ambil semua pasien + latest vitals sekaligus (parallel per pasien)
            const patients = await mobileApiService.getPatientsWithLatestVitals(idUser)

            // Step 3: Hitung statistik lokal (menggantikan /patients/summary/status)
            const stats = mobileApiService.computeStats(patients)
            setPatientCount(stats.total_patient)
            setNormalPatient(stats.normal_patient)
            setRiskPatient(stats.hyper_patient)
            setCheckedToday(stats.checked_today)
            setNotCheckedToday(stats.not_checked_today)

            // Step 4: Recent patients — urutkan berdasarkan lastVisit terbaru, ambil 5
            const sorted = [...patients]
                .filter(p => p.lastVisit !== null)
                .sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit))
                .slice(0, 5)
            setRecentPatients(sorted)

        } catch (err) {
            console.error('[Dashboard] fetchDashboardData error:', err)
        }
    }


    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle="Dashboard"
                rightTitle="Flowbeat Dashboard"
                description="Pantau pasien dengan cepat"
                icon={<LayoutDashboardIcon />}
            />
            <Separator className="my-2 max-w-screen-2xl" />
            <div className="grid lg:grid-cols-4 md:grid-cols-3 max-sm:grid-cols-2 gap-2 flex-grow">
                <CardStatus
                    title="Total Pasien"
                    description="+20% dari bulan lalu"
                    value={patientCount}
                />
                <CardStatus
                    title="Pasien Berisiko"
                    description="Perlu perhatian khusus"
                    value={riskPatient}
                />
                <CardStatus
                    title="Pasien Normal"
                    description="Total pasien sehat"
                    value={normalPatient}
                />
                <CardStatus
                    title="Pemeriksaan Hari Ini"
                    description={`${notCheckedToday} belum selesai`}
                    value={checkedToday}
                />
            </div>
            <div className="lg:flex gap-2 items-start my-4">
                <div className="flex flex-col gap-4">
                    <DistributionBloodPressureChart distributionByStatus={distributionByStatus} isDataMounted={isDataMounted}/>
                    <ChartBarItem />
                </div>
                <div className="space-y-2 max-sm:mt-8 sm:mt-8 lg:mt-0 lg:w-1/2">
                    <QuickSearch />
                    <RecentPatientsTable recentPatients={recentPatients}/>
                </div>
            </div>
        </main>
    );
}

export default DashboardContainer;