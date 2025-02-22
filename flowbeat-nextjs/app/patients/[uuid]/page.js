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
    const [ lastVisit, setLastVisit ] = useState('')
    const [ bloodPressureData, setBloodPressureData ] = useState([])
    
    const getDetailData = async () => {
        const res = await axios.get(`http://127.0.0.1:8000/api/patients/${uuid}`)
        setPatient(res.data?.patient_data)
        setLastVisit(res.data?.lastVisit)
    }

    const fetchBPData = async () => {
        if (!patient?.id) return
        const res = await axios.get(`http://127.0.0.1:8000/api/blood-pressure-data/${patient.id}?`)
        setBloodPressureData(res.data)
    }

    useEffect(() => {
        getDetailData()
        if (patient?.id) {
            fetchBPData()
        }
    }, [patient?.id])

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
                <ProfileDataPatient patient={patient} lastVisit={lastVisit}/>
                <MedicalHistory patient={patient} bloodPressureData={bloodPressureData} />
            </div>
        </main>
    );
}

export default DetailPatientPage;