'use client'
import Header from "@/components/Header";
import MedicalHistory from "@/components/PatientDetails/Medical History";
import ProfileDataPatient from "@/components/PatientDetails/ProfileDataPatient";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { ArrowLeft, Edit, Pen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    
    const getDetailData = async () => {
        const res = await axios.get(`http://127.0.0.1:8000/api/patients/${uuid}?page=${currentPage}`)
        setPatient(res.data?.patient_data)
        setPatientHealthData(res.data?.health_data)
        setLastVisit(res.data?.lastVisit)
        setTotalPages(res.data?.health_data.last_page)
    }

    const fetchBPData = async () => {
        if (!patient?.id) return
        const res = await axios.get(`http://127.0.0.1:8000/api/blood-pressure-data/${patient.id}?`)
        setBloodPressureData(res.data)
    }

    const fetchVitalData = async () => {
        if (!patient?.id) return
        const res = await axios.get(`http://127.0.0.1:8000/api/vital-sign-data/${patient?.id}?`)
        setVitalSignData(res.data)
    }

    useEffect(() => {
        setTimeout(() => {setIsDataMounted(false)}, 3000)
        getDetailData()
        if (patient?.id) {
            fetchBPData()
            fetchVitalData()
        }
    }, [patient?.id, currentPage])

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
            <div className="flex gap-4 py-4 w-full xl:flex-row sm:flex-col  max-sm:flex-col">
                <ProfileDataPatient patient={patient} lastVisit={lastVisit} isDataMounted={isDataMounted}/>
                <MedicalHistory currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages}  patientHealthData={patientHealthData} bloodPressureData={bloodPressureData} VitalSignData={VitalSignData} isDataMounted={isDataMounted} />
            </div>
        </main>
    );
}

export default DetailPatientPage;