'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ArrowRight, BellRing, X } from 'lucide-react'
import { useState } from 'react'

const AlertNotification = ({ criticalPatients = [] }) => {
    const router = useRouter()
    const [dismissed, setDismissed] = useState([])

    const active = criticalPatients.filter(p => !dismissed.includes(p.id))

    return (
        <Card className="border-red-200 shadow-md">
            <CardHeader className="pb-3 border-b border-red-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-red-500 animate-pulse" />
                        <CardTitle className="text-base text-red-700">Peringatan Pasien</CardTitle>
                    </div>
                    {active.length > 0 && (
                        <Badge className="bg-red-500 text-white text-[10px] px-2 rounded-full animate-pulse">
                            {active.length} BARU
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-y-auto max-h-[340px]">
                    {active.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                            <BellRing className="h-8 w-8 opacity-30" />
                            <p className="text-sm">Tidak ada peringatan aktif</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-red-50">
                            {active.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="group p-4 bg-red-50/60 border-l-4 border-red-500 hover:bg-red-50 transition-all duration-200"
                                >
                                    {/* Header row */}
                                    <div className="flex items-start justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            {/* Avatar */}
                                            <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {(patient.name || '?').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase text-red-500 tracking-wide flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3" /> CRITICAL
                                                </span>
                                                <p className="text-sm font-semibold text-gray-800 leading-tight">{patient.name}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDismissed(d => [...d, patient.id])}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-700 p-0.5 rounded"
                                            title="Tutup"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    {/* Vitals */}
                                    <p className="text-xs text-gray-500 ml-10 mb-2">
                                        Tekanan Darah:{' '}
                                        <span className="font-semibold text-red-600">{patient.lastBP || 'N/A'}</span>
                                        {patient.lastBPM && (
                                            <> · Denyut: <span className="font-semibold text-red-600">{patient.lastBPM}</span></>
                                        )}
                                        {patient.lastVisit && (
                                            <> · <span className="text-gray-400">{patient.lastVisit}</span></>
                                        )}
                                    </p>

                                    {/* Action */}
                                    <div className="flex gap-2 ml-10">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-7 px-3 text-xs"
                                            onClick={() => router.push(`/patients/${patient.id}`)}
                                        >
                                            Lihat Detail <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {active.length > 0 && (
                    <div className="p-3 border-t border-red-100">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => router.push('/patients')}
                        >
                            Lihat Semua Pasien
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default AlertNotification
