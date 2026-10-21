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
import { useAuth } from "@clerk/nextjs";

const DetailPatientPage = () => {
    const { uuid } = useParams()
    const [ patient, setPatient ] = useState({})
    const [ patientHealthData, setPatientHealthData ] = useState([])
    const [ lastVisit, setLastVisit ] = useState('')
    const [ bloodPressureData, setBloodPressureData ] = useState([])
    const [ VitalSignData, setVitalSignData ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const auth = useAuth()

    const getDetailData = useCallback(async () => {
        try {
            const res = await fetch(`/api/patients/${uuid}?page=${currentPage}`)
            const data = await res.json()
            if (data.success) {
                setPatient(data.patient_data || {})
                setPatientHealthData(data.health_data || {})
                setLastVisit(data.lastVisit || '-')
                setTotalPages(data.health_data?.last_page || 1)

                // Blood pressure data from health_data measurements
                const healthItems = data.health_data?.data || []
                const bpFormatted = healthItems.map((item) => ({
                    date: item.created_at,
                    systolic: Number(item.sys),
                    diastolic: Number(item.dia),
                    bpm: Number(item.bpm),
                    mov: Boolean(item.mov),
                    ihb: Boolean(item.ihb),
                }))
                setBloodPressureData(bpFormatted)

                // SpO2 / vital sign data
                const spo2Items = data.spo2_data || []
                const vitalFormatted = spo2Items.map((item) => ({
                    date: item.created_at,
                    hr: Number(item.bpm || 0),
                    SpO2: Number(item.spo2 || 0),
                }))
                setVitalSignData(vitalFormatted)
            }
        } catch (error) {
            console.error("Error fetching patient detail:", error)
        }
    }, [uuid, currentPage])

    useEffect(() => {
        getDetailData()
        setTimeout(() => { setIsDataMounted(false) }, 3000)
    }, [getDetailData])

    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle={`Detail Pasien: ${patient.first_name || patient.name || ''}`}
                rightTitle="Flowbeat"
                description={`MRN: ${uuid}`} 
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
                        <ProfileDataPatient patientHealthData={patientHealthData} patient={patient} lastVisit={lastVisit} isDataMounted={isDataMounted}/>
                        <PatientNotes patientUUID={uuid} />
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <MedicalHistory 
                        currentPage={currentPage} 
                        setCurrentPage={setCurrentPage} 
                        totalPages={totalPages} 
                        patientHealthData={patientHealthData} 
                        bloodPressureData={bloodPressureData} 
                        VitalSignData={VitalSignData} 
                        setIsDataMounted={setIsDataMounted} 
                        isDataMounted={isDataMounted} 
                    />
                </div>
            </div>
        </main>
    );
}

export default DetailPatientPage;