"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    PlusCircle,
    Save,
    Trash2,
    Edit,
    Filter,
    Bell,
    Calendar,
    X,
    LinkIcon,
    CheckCircle2,
    AlertCircle,
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

const PatientNotes = ({ patientId }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [currentNote, setCurrentNote] = useState(null)
    const [filterCategory, setFilterCategory] = useState("all")
    const [filterReminder, setFilterReminder] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedDate, setSelectedDate] = useState()
    const [showFilters, setShowFilters] = useState(false)
    const [activeTab, setActiveTab] = useState("all")

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

    const handleDeleteNote = (id) => {
        setNotes(notes.filter((note) => note.id !== id))
    }

    const handleAddTag = (tag) => {
        if (!currentNote) return
        if (!tag.trim()) return

        const updatedTags = [...(currentNote.tags || []), tag.trim()]
        setCurrentNote({
            ...currentNote,
            tags: updatedTags,
        })
    }

    const handleRemoveTag = (tagToRemove) => {
        if (!currentNote || !currentNote.tags) return

        setCurrentNote({
            ...currentNote,
            tags: currentNote.tags.filter((tag) => tag !== tagToRemove),
        })
    }

    const handleToggleReminder = (checked) => {
        if (!currentNote) return

        if (checked) {
            setCurrentNote({
                ...currentNote,
                hasReminder: true,
                reminderDate: format(new Date(), "yyyy-MM-dd"),
                reminderStatus: "pending",
            })
        } else {
            const { hasReminder, reminderDate, reminderStatus, ...rest } = currentNote
            setCurrentNote(rest)
        }
    }

    const [notes, setNotes] = useState([
        {
            id: 1,
            date: "2023-06-15",
            title: "Konsultasi Awal",
            content:
                "Pasien mengeluhkan sakit kepala ringan. Tekanan darah normal. Disarankan untuk mengurangi konsumsi garam dan melakukan olahraga ringan secara teratur.",
            category: "Konsultasi",
            tags: ["sakit kepala", "diet"],
        },
    ])

    const resetForm = () => {
        setCurrentNote(null)
        setIsEditMode(false)
    }

    const handleSaveNote = () => {
        if (!currentNote) return

        const now = new Date()

        if (isEditMode) {
            setNotes(notes.map((note) => (note.id === currentNote.id ? currentNote : note)))
        } else {
            const newNoteWithId = {
                ...currentNote,
                id: Math.max(0, ...notes.map((n) => n.id)) + 1,
                date: format(now, "yyyy-MM-dd"),
            }
            setNotes([newNoteWithId, ...notes])
        }

        setIsOpen(false)
        resetForm()
    }

    const getCategoryColor = (category) => {
        switch (category) {
            case "Konsultasi":
                return "bg-blue-100 text-blue-800"
            case "Pemeriksaan":
                return "bg-green-100 text-green-800"
            case "Pengobatan":
                return "bg-purple-100 text-purple-800"
            case "Penting":
                return "bg-red-100 text-red-800"
            default:
                return "bg-gray-100 text-gray-800"
        }
    }

    const getVisitById = (id) => {
        if (!id) return null
        return visits.find((visit) => visit.id === id)
    }

    const filteredNotes = notes.filter((note) => {
        // Filter by category
        if (filterCategory !== "all" && note.category !== filterCategory) {
            return false
        }

        // Filter by reminder status
        if (filterReminder === "with-reminder" && !note.hasReminder) {
            return false
        }
        if (filterReminder === "pending" && (!note.hasReminder || note.reminderStatus !== "pending")) {
            return false
        }
        if (filterReminder === "completed" && (!note.hasReminder || note.reminderStatus !== "completed")) {
            return false
        }

        // Filter by date
        if (selectedDate && note.date !== format(selectedDate, "yyyy-MM-dd")) {
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
    const groupedByDate = filteredNotes.reduce(
        (acc, note) => {
            if (!acc[note.date]) {
                acc[note.date] = []
            }
            acc[note.date].push(note)
            return acc
        },
        {},
    )
    const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

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
                                            setFilterReminder("all")
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
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{isEditMode ? "Edit Catatan" : "Tambah Catatan Baru"}</DialogTitle>
                                <DialogDescription>
                                    {isEditMode
                                        ? "Edit catatan medis untuk pasien ini."
                                        : "Tambahkan catatan medis untuk pasien ini. Catatan akan disimpan dengan tanggal hari ini."}
                                </DialogDescription>
                            </DialogHeader>
                            {currentNote && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="title" className="text-right">
                                            Judul
                                        </Label>
                                        <Input
                                            id="title"
                                            value={currentNote.title}
                                            onChange={(e) => setCurrentNote({ ...currentNote, title: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="category" className="text-right">
                                            Kategori
                                        </Label>
                                        <Select
                                            value={currentNote.category}
                                            onValueChange={(value) => setCurrentNote({ ...currentNote, category: value })}
                                        >
                                            <SelectTrigger className="col-span-3">
                                                <SelectValue placeholder="Pilih kategori" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Konsultasi">Konsultasi</SelectItem>
                                                <SelectItem value="Pemeriksaan">Pemeriksaan</SelectItem>
                                                <SelectItem value="Pengobatan">Pengobatan</SelectItem>
                                                <SelectItem value="Penting">Penting</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="content" className="text-right">
                                            Catatan
                                        </Label>
                                        <Textarea
                                            id="content"
                                            value={currentNote.content}
                                            onChange={(e) => setCurrentNote({ ...currentNote, content: e.target.value })}
                                            className="col-span-3"
                                            rows={5}
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label className="text-right">Tag</Label>
                                        <div className="col-span-3">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {currentNote.tags &&
                                                    currentNote.tags.map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                                            {tag}
                                                            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                                                        </Badge>
                                                    ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="tag"
                                                    placeholder="Tambahkan tag"
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault()
                                                            handleAddTag((e.target).value)
                                                                ; (e.target).value = ""
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        const input = e.currentTarget.previousElementSibling
                                                        handleAddTag(input.value)
                                                        input.value = ""
                                                    }}
                                                >
                                                    Tambah
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsOpen(false)
                                        resetForm()
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" onClick={handleSaveNote}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditMode ? "Perbarui Catatan" : "Simpan Catatan"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
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
                                            <span className="text-xs text-muted-foreground">{note.date}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(note.category)}`}>
                                                {note.category}
                                            </span>
                                            {note.hasReminder && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full flex items-center ${getReminderStatusColor(note.reminderStatus)}`}
                                                >
                                                    <Bell className="mr-1 h-3 w-3" />
                                                    {note.reminderStatus === "completed" ? "Selesai" : "Pengingat"}
                                                </span>
                                            )}
                                            {note.linkedVisitId && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 flex items-center">
                                                    <LinkIcon className="mr-1 h-3 w-3" />
                                                    Kunjungan {note.linkedVisitId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(note)} className="h-8 w-8">
                                            <Edit className="h-4 w-4 text-blue-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} className="h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
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

                                {note.linkedVisitId && (
                                    <div className="mt-3 p-2 bg-blue-50 rounded-md text-sm">
                                        <p className="font-medium">Kunjungan Terkait:</p>
                                        {(() => {
                                            const visit = getVisitById(note.linkedVisitId)
                                            return visit ? (
                                                <div className="mt-1">
                                                    <p>Tanggal: {visit.date}</p>
                                                    <p>Tekanan Darah: {visit.bp}</p>
                                                    <p>Catatan: {visit.notes}</p>
                                                </div>
                                            ) : (
                                                <p>Kunjungan tidak ditemukan</p>
                                            )
                                        })()}
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