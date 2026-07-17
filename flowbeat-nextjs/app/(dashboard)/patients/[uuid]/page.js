'use client'
import Header from "@/components/Header";
import MedicalHistory from "@/components/PatientDetails/Medical History";
import PatientNotes from "@/components/Notes/PatientNotes";
import ProfileDataPatient from "@/components/PatientDetails/ProfileDataPatient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Pen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createEchoInstance } from "@/lib/echo";
import { useAuth } from "@clerk/nextjs";
import { mobileApiService, setupMobileAuthInterceptor } from "@/lib/mobile-api-service";

const DetailPatientPage = () => {
    const { uuid } = useParams()
    const profileId = parseInt(uuid)

    const [ patient, setPatient ] = useState(null)
    const [ measurements, setMeasurements ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const echoRef = useRef(null)
    const auth = useAuth()

    const fetchPatientData = useCallback(async () => {
        try {
            setupMobileAuthInterceptor(auth.getToken)

            // Ambil semua measurements untuk profile ini
            const measureData = await mobileApiService.getMeasurements(profileId)
            setMeasurements(measureData)
            setTotalPages(Math.max(1, Math.ceil(measureData.length / 5)))

            // Ambil profile info via id_user (dari /api/doctor)
            const doctorProfile = await mobileApiService.getDoctorProfile()
            if (doctorProfile?.id_user) {
                const profiles = await mobileApiService.getProfiles(doctorProfile.id_user)
                const found = profiles.find(p => p.id === profileId)
                if (found) setPatient(found)
            }
        } catch (err) {
            console.error('[DetailPatientPage] fetchPatientData error:', err)
        }
    }, [profileId, auth.getToken])

    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 3000)
        fetchPatientData()
    }, [fetchPatientData])

    // WebSocket untuk real-time BP data
    useEffect(() => {
        if (!profileId || !auth.isLoaded) return

        const setupWebSocket = async () => {
            try {
                const echo = createEchoInstance(auth)
                echoRef.current = echo

                console.log(`🚀 Listening di channel: patient.${profileId}`)
                echo.channel(`patient.${profileId}`)
                    .listen('.BloodPressureDataEvent', (data) => {
                        console.log('✅ EVENT REAL-TIME DITERIMA!', data)
                        fetchPatientData()
                    })
            } catch (error) {
                console.error('WebSocket setup error:', error)
            }
        }
        setupWebSocket()

        return () => {
            if (echoRef.current) {
                echoRef.current.leave(`patient.${profileId}`)
            }
        }
    }, [profileId, auth.isLoaded, auth, fetchPatientData])

    // Paginasi measurements (5 per halaman)
    const PAGE_SIZE = 5
    const paginatedMeasurements = {
        data: measurements.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        last_page: totalPages,
    }

    const latestMeasurement = measurements[0] ?? null

    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle={`Detail Pasien: ${patient?.name ?? '...'}`}
                rightTitle="Flowbeat"
                description={`ID: PT-${String(profileId).padStart(5, '0')}`}
                icon={<Pen />}
            />
            <div className="flex justify-between items-center my-6">
                <Link href="/patients">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4" /> Kembali ke Daftar Pasien
                    </Button>
                </Link>
                <Button>
                    <Edit /> Edit Data Pasien
                </Button>
            </div>
            <Separator className="max-w-screen-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 py-4">
                <div className="lg:col-span-1">
                    <div className="space-y-3">
                        <ProfileDataPatient
                            patientHealthData={paginatedMeasurements}
                            patient={patient}
                            lastVisit={latestMeasurement?.datetime ?? '—'}
                            isDataMounted={isDataMounted}
                        />
                        <PatientNotes patientUUID={String(profileId)} />
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <MedicalHistory
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        patientHealthData={paginatedMeasurements}
                        bloodPressureData={measurements}
                        VitalSignData={[]}
                        setIsDataMounted={setIsDataMounted}
                        isDataMounted={isDataMounted}
                    />
                </div>
            </div>
        </main>
    );
}

export default DetailPatientPage;
