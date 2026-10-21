'use client'
import Header from "@/components/Header";
import MedicalHistory from "@/components/PatientDetails/Medical History";
// import PatientNotes from "@/components/Notes/PatientNotes";
import ProfileDataPatient from "@/components/PatientDetails/ProfileDataPatient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Pen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/lib/api-client";
// import { createEchoInstance } from "@/lib/echo";
import { useAuth } from "@clerk/nextjs";
import ControlDelayDropdown from "@/components/ControlDelayLayer/ControlDelayDropdown"
import { BloodPressureChart } from "@/components/PatientDetails/BloodPressureChart"
import VitalSignChart from "@/components/PatientDetails/VitalSignChart"


const DetailPatientPage = () => {
    const { id } = useParams()
    const [ patient, setPatient ] = useState([])
    const [ patientHealthData, setPatientHealthData ] = useState([])
    const [ bloodPressureData, setBloodPressureData ] = useState([])
    const [ VitalSignData, setVitalSignData ] = useState([])
    const [ currentPage, setCurrentPage ] = useState(1)
    const [ totalPages, setTotalPages ] = useState(1)
    const [ isDataMounted, setIsDataMounted ] = useState(true)
    const echoRef = useRef(null)
    const auth = useAuth()
    const [selectedDevice, setSelectedDevice] = useState("")

    const getDetailData = useCallback(async () => {
            const res = await apiClient.get(`/user/${id}`)
            setPatient(res.data?.data || null)
            setPatientHealthData(res.data?.health_data)
            // setTotalPages(res.data?.health_data.last_page)
    }, [id])

    const fetchBPData = useCallback(async () => {
            if (!patient?.id) return
            const res = await apiClient.get(`/omron/${id}`)

            const rawData = res.data?.data || []
            const formattedData = rawData.map((item) => ({
                date: item.created_at,
                systolic: Number(item.sys),
                diastolic: Number(item.dia),
                bpm: Number(item.bpm),
                mov: Boolean(item.mov),
                ihb: Boolean(item.ihb),
            }));

            setBloodPressureData(formattedData)
    }, [patient?.id]) 

    const fetchVitalData = useCallback(
        async () => {
            if (!patient?.id) return
            const res = await apiClient.get(`/sensormax/${id}`)
            const rawData = res.data?.data || []
            const formattedData = rawData.map((item) => ({
                date: item.created_at,
                hr: Number(item.hr),
                SpO2: Number(item.SpO2),
            }));
            setVitalSignData(formattedData)
    }, [patient?.id]) 

    // useEffect(() => {
    //     setTimeout(() => {setIsDataMounted(false)}, 3000)
    //     getDetailData()
    //     if (patient?.id) {
    //         fetchBPData()
    //         fetchVitalData()
    //     }
    // }, [patient?.id, currentPage, getDetailData])

        useEffect(() => {
            getDetailData();
            }, [getDetailData]);

        useEffect(() => {
            if (patient?.id) {
                fetchBPData();
                fetchVitalData();
                setTimeout(() => setIsDataMounted(false), 3000);
            }
        }, [patient?.id, fetchBPData, fetchVitalData]);


    // ✅ fetch data ketika device dipilih
        useEffect(() => {
            if (selectedDevice === "omron") {
            fetchBPData()
            } else if (selectedDevice === "max30100") {
            fetchVitalData()
            }
        }, [selectedDevice, fetchBPData, fetchVitalData])

    return (
        <main className="pr-4 py-2 h-full flex flex-col">
            <Header
                leftTitle={`Detail Pasien: ${patient.name}`}
                rightTitle="Flowbeat"
                description={`MRN: ${id}`} 
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
                        <ProfileDataPatient patientHealthData={patientHealthData} patient={patient} isDataMounted={isDataMounted}/>
                        {/* <PatientNotes patientid={id} /> */}
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