<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CafeNote;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CafeNoteController extends Controller
{
   
    /**
     * GET /api/cafe-notes
     * List semua catatan milik user.
     */
    public function index(Request $request): JsonResponse
    {
        $notes = CafeNote::where('user_id', $request->user()->id)
            ->with(['cafe:id,name,slug,category'])
            ->latest()
            ->get();

        return response()->json([
            'notes' => $notes,
        ]);
    }

    /**
     * POST /api/cafe-notes
     * Tambah catatan baru untuk sebuah cafe.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cafe_id'    => ['required', 'exists:cafes,id'],
            'note'       => ['required', 'string'],
            'rating'     => ['nullable', 'integer', 'between:1,5'],
            'visited_at' => ['nullable', 'date'],
        ]);

        $note = CafeNote::create([
            'user_id'    => $request->user()->id,
            'cafe_id'    => $validated['cafe_id'],
            'note'       => $validated['note'],
            'rating'     => $validated['rating'] ?? null,
            'visited_at' => $validated['visited_at'] ?? null,
        ]);

        // Update avg_rating cafe
        $this->recalcAvgRating($validated['cafe_id']);

        return response()->json($note->load('cafe:id,name,slug'), 201);
    }

    /**
     * PUT /api/cafe-notes/{cafeNote}
     * Update catatan (hanya milik user sendiri).
     */

    public function update(Request $request, CafeNote $cafeNote): JsonResponse
    {
        // Pastikan user hanya bisa edit catatan miliknya sendiri
        if ($cafeNote->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Tidak memiliki akses.',
            ], 403);
        }

        $validated = $request->validate([
            'note'       => ['sometimes', 'string'],
            'rating'     => ['sometimes', 'nullable', 'integer', 'between:1,5'],
            'visited_at' => ['sometimes', 'nullable', 'date'],
        ]);

        $cafeNote->update($validated);

        // Update avg_rating cafe
        $this->recalcAvgRating($cafeNote->cafe_id);

        return response()->json($cafeNote->fresh('cafe:id,name,slug'));
    }

    /**
     * DELETE /api/cafe-notes/{cafeNote}
     * Hapus catatan (hanya milik user sendiri).
     */
    public function destroy(Request $request, CafeNote $cafeNote): JsonResponse
    {
        if ($cafeNote->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Tidak memiliki akses.',
            ], 403);
        }

        $cafeId = $cafeNote->cafe_id;
        $cafeNote->delete();

        // Update avg_rating cafe
        $this->recalcAvgRating($cafeId);

        return response()->json([
            'message' => 'Catatan berhasil dihapus.',
        ]);
    }

    // Update avg_rating cafe
    private function recalcAvgRating(int $cafeId): void
    {
        $avg = CafeNote::where('cafe_id', $cafeId)
            ->whereNotNull('rating')
            ->avg('rating');

        \App\Models\Cafe::where('id', $cafeId)->update([
            'avg_rating' => $avg ?: null,
        ]);
    }
}