'use client'
import { LayoutDashboardIcon } from "lucide-react";
import CardStatus from "./CardStatus";
import Header from "./Header";
import { Separator } from "./ui/separator";
import QuickSearch from "./QuickSearch";
import ChartBarItem from "./BarChartItem"
import RecentPatientsTable from "./RecentPatientTable";
import { useEffect, useState } from "react";
import axios from "axios";
import DistributionBloodPressureChart from "./DistributionBloodPressureChart"

const DashboardContainer = () => {
    const [ patientCount, setPatientCount ] = useState(0)
    const [ normalPatient, setNormalPatient ] = useState(0)
    const [ riskPatient, setRiskPatient ] = useState(0)
    const [ checkedToday, setCheckedToday ] = useState(0)
    const [ notCheckedToday, setNotCheckedToday ] = useState(0)
    const [ recentPatients, setRecentPatients ] = useState([])
    const [ distributionByStatus, setDistributionByStatus ] = useState([])
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const CountPatient = async () => {
        const [patientsRes, statusRes, recentRes, distributionRes] = await Promise.all([
            axios.get('http://127.0.0.1:8000/api/patients'),
            axios.get('http://127.0.0.1:8000/api/patient-status'),
            axios.get('http://127.0.0.1:8000/api/recent-patients'),
            axios.get('http://127.0.0.1:8000/api/status-distribution')
        ]);

        setPatientCount(statusRes.data.total_patient)
        setNormalPatient(statusRes.data.normal_patient)
        setRiskPatient(statusRes.data.hyper_patient)
        setCheckedToday(statusRes.data.checked_today)
        setNotCheckedToday(statusRes.data.not_checked_today)
        setRecentPatients(recentRes.data.recent_patients)
        setDistributionByStatus(distributionRes.data.data)
    }
    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 1500)
        CountPatient()
    }, [])
    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle="Dashboard"
                rightTitle="Flowbeat Dashboard"
                description="Pantau pasien dengan cepat"
                icon={<LayoutDashboardIcon />}
            />
            <Separator className="my-8 max-w-screen-2xl" />
            <div className="grid lg:grid-cols-4 md:grid-cols-3 max-sm:grid-cols-2 gap-8 flex-grow">
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
            <div className="lg:flex gap-2 items-start my-8">
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