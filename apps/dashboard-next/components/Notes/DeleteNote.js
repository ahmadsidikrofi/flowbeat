import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

const DeleteNote = ({ setIsConfirmationDelete, noteId, setNotes, notes }) => {
    const handleDeleteNote = (id) => {
        setNotes(notes.filter((note) => note.id !== id))
        setIsConfirmationDelete(false)
    }
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    <div className="flex gap-2">
                        <Trash className="h-4 w-4" /> 
                        <p>Yakin dengan tindakanmu?</p> 
                        <Trash className="h-4 w-4" />
                    </div>
                </DialogTitle>
                <DialogDescription>Aksi ini akan menghapus catatan ini secara permanen.
                    Dan apabila dirasa ada yang ingin diperbaiki, maka bisa menggunakan menu edit
                    and remove your data from our servers.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsConfirmationDelete(false)}>
                    Batal
                </Button>
                <Button type="submit" variant="destructive" onClick={() => handleDeleteNote(noteId)}>
                    <Trash className="h-4 w-4" />
                    Hapus
                </Button>
            </DialogFooter>
        </DialogContent>
    );
}

export default DeleteNote;