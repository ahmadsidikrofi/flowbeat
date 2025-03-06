import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Save, X } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import axios from "axios";

const AddNotes = ({ notes, setNotes, isEditMode, setIsEditMode, currentNote, setCurrentNote, setIsOpen, patientUUID }) => {
    const StoreNoteToDB = async (note) => {
        try {
            const response = await axios.post(`http://127.0.0.1:8000/api/notes/${patientUUID}`, note, {
                headers: {'Accept': 'application/json'}
            })
            return response.data
        } catch (error) {
            console.error("Error saving note:", error)
            return null
        }
    }
    
    const resetForm = () => {
        setCurrentNote(null)
        setIsEditMode(false)
    }
    const handleSaveNote = async () => {
        if (!currentNote) return
        const now = new Date()

        let newNote = {
            ...currentNote,
            date: format(now, "yyyy-MM-dd")
        }
        if (!isEditMode) {
            newNote = {
                ...newNote,
                id: Math.max(0, ...notes.map((n) => n.id)) + 1 
            }
        }

        const savedNote = await StoreNoteToDB(newNote)
        if (savedNote) {
            if (isEditMode) setNotes(notes.map((note) => note.id === currentNote.id ? savedNote : note))
            else {
                [savedNote, ...notes]
            }
            setIsOpen(false)
            resetForm()
        }
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
    return (
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
                                <SelectItem value="Diagnosis">Diagnosis</SelectItem>
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

    );
}

export default AddNotes;