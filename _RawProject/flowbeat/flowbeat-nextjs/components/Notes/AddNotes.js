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
import apiClient from "@/lib/api-client";

const AddNotes = ({ setRefreshData, notes, setNotes, isEditMode, setIsEditMode, currentNote, setCurrentNote, setIsOpen, patientUUID }) => {
    const StoreNoteToDB = async (note) => {
        try {
            const response = await apiClient.post(`/patients/${patientUUID}/notes`, note, {
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
            created_at: format(now, "yyyy-MM-dd")
        }

        const savedNote = await StoreNoteToDB(newNote)
        if (savedNote) {
            setRefreshData((prev) => !prev)
            setIsOpen(false);
            resetForm();
        }
    }

    const handleUpdateNoteToDB = async () => {
        if (!currentNote || !currentNote.id) return
        const updatedNote = {
            title: currentNote.title,
            content: currentNote.content,
            category: currentNote.category,
            tags: currentNote.tags, 
        }
        await apiClient.put(`/notes/${currentNote.id}`, updatedNote)
        .then((res) => {
            console.log("Note updated:", res.data)
            setRefreshData((prev) => !prev)
            setIsOpen(false)
            resetForm()
        }).catch((error) => {console.log("Terjadi error: ", error)})
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
                <Button type="submit" onClick={isEditMode ? handleUpdateNoteToDB : handleSaveNote}>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? "Perbarui Catatan" : "Simpan Catatan"}
                </Button>
            </DialogFooter>
        </DialogContent>

    );
}

export default AddNotes;