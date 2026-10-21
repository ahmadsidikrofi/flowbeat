import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Info } from "lucide-react";
import { Badge } from "../ui/badge";

const HealthInsight = () => {
    return (
        <Dialog>
            <DialogTrigger>
                <Info className="h-4 w-4 ml-2 cursor-pointer text-blue-500 hover:text-blue-700" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rentang Tekanan Darah</DialogTitle>
                    <DialogDescription>
                        Berikut adalah kategori tekanan darah berdasarkan nilai Systolic (SYS) & Diastolic (DIA).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <span>🟢 Normal</span>
                        <Badge className="bg-green-500 text-white">SYS 90-120 | DIA 60-80</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>🟡 Normal Tinggi</span>
                        <Badge className="bg-yellow-500 text-white">SYS 121-139 | DIA 81-89</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>🟠 Hipertensi Stage 1</span>
                        <Badge className="bg-orange-500 text-white">SYS 140-159 | DIA 90-99</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>🔴 Hipertensi Stage 2</span>
                        <Badge className="bg-red-500 text-white">SYS ≥160 | DIA ≥100</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>⚠️ Krisis Hipertensi</span>
                        <Badge className="bg-red-700 text-white">SYS ≥180 | DIA ≥110</Badge>
                    </div>
                </div>

                <DialogTitle className="mt-4">Body Movement & Irregular Heartbeat</DialogTitle>
                <div className="space-y-2">
                    <div className="flex justify-between gap-4 items-center">
                        <span>💨 Body Movement</span>
                        <Badge className="bg-blue-500 text-white">Gerakan berlebihan, bisa mempengaruhi hasil</Badge>
                    </div>
                    <div className="flex justify-between gap-2 items-center">
                        <span>❤️ Irregular Heartbeat</span>
                        <Badge className="bg-purple-500 text-white">Detak jantung tidak teratur, periksa lebih lanjut</Badge>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default HealthInsight;