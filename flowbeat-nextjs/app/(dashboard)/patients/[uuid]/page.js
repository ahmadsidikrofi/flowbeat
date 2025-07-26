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
import { useCallback, useEffect, useRef, useState, useref } from "react";
import apiClient from "@/lib/api-client";
import { createEchoInstance } from "@/lib/echo";
import { useAuth } from "@clerk/nextjs";

const DetailPatientPage = () => {
    const { uuid } = useParams()
    const [ patient, setPatient ] = useState([])
    const [ patientHealthData, setPatientHealthData ] = useState([])
    const [ lastVisit, setLastVisit ] = useState('')
    const [ bloodPressureData, setBloodPressureData ] = useState([])
    const [ VitalSignData, setVitalSignData ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const echoRef = useRef(null)
    const auth = useAuth()

    const getDetailData = useCallback(async () => {
            const res = await apiClient.get(`/patients/${uuid}?page=${currentPage}`)
            setPatient(res.data?.patient_data)
            setPatientHealthData(res.data?.health_data)
            setLastVisit(res.data?.lastVisit)
            setTotalPages(res.data?.health_data.last_page)
    }, [uuid, currentPage]) 

    const fetchBPData = useCallback(async () => {
            if (!patient?.id) return
            const res = await apiClient.get(`/patients/${patient.id}/blood-pressures`)
            setBloodPressureData(res.data)
    }, [patient?.id]) 

    const fetchVitalData = useCallback(
        async () => {
            if (!patient?.id) return
            const res = await apiClient.get(`/patients/${patient.id}/vital-signs`)
            setVitalSignData(res.data)
    }, [patient?.id]) 

    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 3000)
        getDetailData()
        if (patient?.id) {
            fetchBPData()
            fetchVitalData()
        }
    }, [patient?.id, currentPage, getDetailData])

    useEffect(() => {
        if (!patient?.id || ! auth.isLoaded) return 

        const setupWebSocket = async () => {
            try {
                const echo = createEchoInstance(auth);
                echoRef.current = echo;
                
                console.log(`🚀 Terhubung dan mendengarkan di channel: patient.${patient.id}`);
                echo.channel(`patient.${patient.id}`)
                    .listen('.BloodPressureDataEvent', (data) => {
                        console.log('✅ EVENT REAL-TIME DITERIMA!', data);
                        fetchBPData();
                    });


            } catch (error) {
                console.error('WebSocket setup error:', error);
            }
        };
        setupWebSocket();
        
        return () => {
            if (echoRef.current) {
                echoRef.current.leave(`patient.${patient.id}`);
            }
        };
        
    }, [patient?.id, auth.isLoaded, auth, fetchBPData])

    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle={`Detail Pasien: ${patient.first_name}`}
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