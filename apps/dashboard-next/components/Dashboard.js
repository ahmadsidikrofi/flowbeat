'use client'
import { LayoutDashboardIcon, Search } from "lucide-react";
import CardStatus from "./CardStatus";
import Header from "./Header";
import { Separator } from "./ui/separator";
import ChartBarItem from "./BarChartItem"
import RecentPatientsTable from "./RecentPatientTable";
import AlertNotification from "./AlertNotification";
import { useEffect, useRef, useState } from "react";
import DistributionBloodPressureChart from "./DistributionBloodPressureChart"
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const DashboardContainer = () => {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [ patientCount, setPatientCount ] = useState(0)
    const [ normalPatient, setNormalPatient ] = useState(0)
    const [ warningPatient, setWarningPatient ] = useState(0)
    const [ criticalPatient, setCriticalPatient ] = useState(0)
    const [ recentPatients, setRecentPatients ] = useState([])
    const [ criticalPatients, setCriticalPatients ] = useState([])
    const [ distributionByStatus, setDistributionByStatus ] = useState([])
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const { getToken } = useAuth()

    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 1500)
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [statusRes, recentRes, distributionRes, alertsRes] = await Promise.all([
                fetch('/api/patients/summary/status').then(r => r.json()),
                fetch('/api/patients/recent').then(r => r.json()),
                fetch('/api/patients/statistics/distribution').then(r => r.json()),
                fetch('/api/patients/alerts').then(r => r.json()),
            ]);

            if (statusRes.success) {
                setPatientCount(statusRes.total_patient)
                setNormalPatient(statusRes.normal_patient)
                setWarningPatient(statusRes.warning_patient)
                setCriticalPatient(statusRes.critical_patient)
            }
            if (recentRes.success) {
                setRecentPatients(recentRes.recent_patients)
            }
            if (distributionRes.success) {
                setDistributionByStatus(distributionRes.data)
            }
            if (alertsRes.success) {
                setCriticalPatients(alertsRes.critical_patients)
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        }
    }

    return (
        <main className="pr-4 py-2 h-full flex flex-col overflow-auto">
            <Header
                leftTitle="Dashboard"
                rightTitle="Flowbeat Dashboard"
                description="Pantau pasien dengan cepat"
                icon={<LayoutDashboardIcon />}
                centerSlot={
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (searchTerm.trim()) router.push(`/patients?q=${encodeURIComponent(searchTerm.trim())}`)
                        }}
                        className="flex items-center gap-1 border border-input rounded-lg px-3 py-1.5 bg-background shadow-sm focus-within:ring-1 focus-within:ring-blue-400 transition-all"
                    >
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            placeholder="Cari pasien..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
                        />
                    </form>
                }
            />
            <Separator className="my-2 max-w-screen-2xl" />

            {/* ── Summary Cards ────────────────────────────────── */}
            <div className="grid lg:grid-cols-4 md:grid-cols-3 max-sm:grid-cols-2 gap-2 mb-4">
                <CardStatus
                    title="Total Pasien"
                    description="Semua pasien terdaftar"
                    value={patientCount}
                />
                <CardStatus
                    title="Pasien Critical"
                    description="Perlu penanganan segera"
                    value={criticalPatient}
                />
                <CardStatus
                    title="Pasien Warning"
                    description="Perlu pemantauan lebih"
                    value={warningPatient}
                />
                <CardStatus
                    title="Pasien Normal"
                    description="Kondisi dalam batas normal"
                    value={normalPatient}
                />
            </div>

            {/* ── Top Row: Pasien Terbaru (kiri) + Alert (kanan) ── */}
            <div className="flex flex-row gap-4 mb-4 items-start">
                {/* Kiri: Pasien Terbaru */}
                <div className="flex-1 min-w-0">
                    <RecentPatientsTable recentPatients={recentPatients} />
                </div>

                {/* Kanan: Alert Notification */}
                <div className="flex-1 min-w-0">
                    <AlertNotification criticalPatients={criticalPatients} />
                </div>
            </div>

            {/* ── Bottom Row: Distribution Chart + Bar Chart ──── */}
            <div className="grid lg:grid-cols-2 gap-4">
                <DistributionBloodPressureChart distributionByStatus={distributionByStatus} isDataMounted={isDataMounted} />
                <ChartBarItem />
            </div>
        </main>
    );
}

export default DashboardContainer;