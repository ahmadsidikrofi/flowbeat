<?php

namespace App\Http\Controllers\API\Modules\NoteModule;

use App\Http\Controllers\Controller;
use App\Models\NoteModel;
use App\Models\PatientModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotesController extends Controller
{
    public function GetNotesByUUID($uuid)
    {
        $patient = PatientModel::where('uuid', $uuid)->first();
        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found',
            ], 404);
        }
        $notes = NoteModel::where('patient_id', $patient->id)->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $notes
        ], 200);
    }

    public function StoreNote(Request $request, $uuid)
    {
        $patient = PatientModel::where('uuid', $uuid)->first();
        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Patient not found',
            ], 404);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category' => 'required|in:Konsultasi,Diagnosis,Pemeriksaan,Pengobatan,Penting',
            'tags' => 'nullable|array'
        ]);

        $patient->notes()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'category' => $validated['category'],
            'tags' => $validated['tags'] ?? [],
            'patient_id' => $patient->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Note successfully created',
        ], 201);
    }

    public function EditNote(Request $request, $id)
    {
        $note = NoteModel::where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:Konsultasi,Diagnosis,Pemeriksaan,Pengobatan,Penting',
            'tags' => 'sometimes|nullable|array'
        ]);

        $note->update($validated);
        if ($note) {
            if ($note->wasChanged()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Note successfully changed',
                    'note' => $note
                ], 200);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No data changed',
                ], 200);
            }
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Catatan tidak ditemukan',
            ], 404);
        }
    }

    public function DeleteNote($id)
    {
        $note = NoteModel::find($id);
        if (!$note) {
            return response()->json([
                'success' => false,
                'message' => 'Note 404',
            ], 404);
        }

        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Note successfully deleted',
        ], 200);
    }

    public function ReadHistoryNotes()
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            $notes = $patient->notes()->orderBy('created_at', 'desc')->get();
            if ($patient) {
                return response()->json([
                    'success' => true,
                    'message' => 'All notes from doctor',
                    'data' => $notes
                ], 200);
            }
        }
    }
    public function ReadNoteByID($id)
    {
        if (Auth::check()) {
            $patient = PatientModel::find(Auth::user()->id);
            try {
                $note = NoteModel::where('id', $id)->firstOrFail();
                if ($patient && $note) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Data catatan berhasil diambil',
                        'data' => $note
                    ], 200);
                }
            } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Catatan tidak ditemukan',
                ], 404);
            }
        }
    }
}
