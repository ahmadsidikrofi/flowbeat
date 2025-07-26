"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    PlusCircle,
    Trash2,
    Edit,
    Filter,
    X,
    Trash,
} from "lucide-react"
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import AddNotes from "./AddNotes"
import DeleteNote from "./DeleteNote"
import apiClient from "@/lib/api-client"

const PatientNotes = ({ patientUUID }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [isConfirmationDelete, setIsConfirmationDelete] = useState(false)
    const [currentNote, setCurrentNote] = useState(null)
    const [filterCategory, setFilterCategory] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState()
    const [showFilters, setShowFilters] = useState(false)
    const [notes, setNotes] = useState([])
    const [refreshData, setRefreshData] = useState(false)

    const GetNotesFromDB = async () => {
       const res = await apiClient.get(`/patients/${patientUUID}/notes`)
       setNotes(res.data.data)
    }
    useEffect(() => {
        GetNotesFromDB()
    }, [refreshData])

    const handleOpenDialog = (note) => {
        if (note) {
            setCurrentNote(note)
            setIsEditMode(true)
        } else {
            setCurrentNote({
                id: 0,
                date: format(new Date(), "yyyy-MM-dd"),
                title: "",
                content: "",
                category: "Konsultasi",
                tags: [],
            })
            setIsEditMode(false)
        }
        setIsOpen(true)
    }

    const handleConfirmationDeleteDialog = () => {
        setIsConfirmationDelete(true)
    }

    const getCategoryColor = (category) => {
        switch (category) {
            case "Konsultasi":
                return "bg-blue-100 text-blue-800"
            case "Diagnosis":
                return "bg-orange-100 text-orange-800"
            case "Pengobatan":
                return "bg-green-100 text-green-800"
            case "Pemeriksaan":
                return "bg-purple-100 text-purple-800"
            case "Penting":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const filteredNotes = notes.filter((note) => {
        // Filter by category
        if (filterCategory !== "all" && note.category !== filterCategory) {
            return false
        }

        // Filter by date
        if (selectedDate && format(new Date(note.created_at), "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")) {
            return false
        }

        // Filter by search term
        if (
            searchTerm &&
            !(
                note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
            )
        ) {
            return false
        }

        return true
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Catatan Medis</CardTitle>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? "bg-muted" : ""}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-4">
                                <h4 className="font-medium">Filter Catatan</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="category-filter">Kategori</Label>
                                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                                        <SelectTrigger id="category-filter">
                                            <SelectValue placeholder="Semua kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua kategori</SelectItem>
                                            <SelectItem value="Konsultasi">Konsultasi</SelectItem>
                                            <SelectItem value="Diagnosis">Diagnosis</SelectItem>
                                            <SelectItem value="Pemeriksaan">Pemeriksaan</SelectItem>
                                            <SelectItem value="Pengobatan">Pengobatan</SelectItem>
                                            <SelectItem value="Penting">Penting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Tanggal</Label>
                                    <div className="flex gap-2">
                                        <CalendarComponent
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="border rounded-md p-2"
                                        />
                                    </div>
                                    {selectedDate && (
                                        <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)} className="mt-2">
                                            <X className="mr-2 h-4 w-4" />
                                            Hapus filter tanggal
                                        </Button>
                                    )}
                       
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="search">Cari</Label>
                                    <Input
                                        id="search"
                                        placeholder="Cari di judul, isi, atau tag"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setFilterCategory("all")
                                            setSelectedDate(undefined)
                                            setSearchTerm("")
                                        }}
                                    >
                                        Reset Filter
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Catatan
                            </Button>
                        </DialogTrigger>
                        <AddNotes setRefreshData={setRefreshData} patientUUID={patientUUID} notes={notes} setNotes={setNotes} isEditMode={isEditMode} setIsEditMode={setIsEditMode} setCurrentNote={setCurrentNote} currentNote={currentNote} setIsOpen={setIsOpen}/>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredNotes.length === 0 ? (
                        <p className="text-center text-muted-foreground py-4">
                            {notes.length === 0
                                ? "Belum ada catatan untuk pasien ini"
                                : "Tidak ada catatan yang sesuai dengan filter"}
                        </p>
                    ) : (
                        filteredNotes.map((note) => (
                            <div key={note.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-medium">{note.title}</h3>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-xs text-muted-foreground">{format(new Date(note.created_at), "yyyy-MM-dd")}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(note.category)}`}>
                                                {note.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(note)} className="h-8 w-8">
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Dialog open={isConfirmationDelete} onOpenChange={setIsConfirmationDelete}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleConfirmationDeleteDialog()} className="h-8 w-8">
                                                    <Trash className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </DialogTrigger>
                                            <DeleteNote setIsConfirmationDelete={setIsConfirmationDelete} noteId={note.id} setNotes={setNotes} notes={notes}/>
                                        </Dialog>
                                    </div>
                                </div>
                                <p className="text-sm mt-2 whitespace-pre-line">{note.content}</p>

                                {note.tags && note.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {note.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                #{tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default PatientNotes;