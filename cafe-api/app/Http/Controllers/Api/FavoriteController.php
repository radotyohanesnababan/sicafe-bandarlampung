<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cafe;
use App\Models\Favorite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * GET /api/favorites
     * List semua favorit user.
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with(['cafe:id,name,slug,lat,lng,address,category,price_level,avg_rating'])
            ->latest('created_at')
            ->get();

        return response()->json([
            'favorites' => $favorites,
        ]);
    }

    /**
     * POST /api/favorites
     * Tambah atau hapus favorit untuk sebuah cafe.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'cafe_id' => ['required', 'exists:cafes,id'],
        ]);

        $userId = $request->user()->id;
        $cafeId = $validated['cafe_id'];

        $existing = Favorite::where('user_id', $userId)
            ->where('cafe_id', $cafeId)
            ->first();

        if ($existing) {
            $existing->delete();

            return response()->json([
                'favorited' => false,
                'message'   => 'Dihapus dari favorit.',
            ]);
        }

        Favorite::create([
            'user_id' => $userId,
            'cafe_id' => $cafeId,
        ]);

        return response()->json([
            'favorited' => true,
            'message'   => 'Ditambahkan ke favorit.',
        ], 201);
    }

    /**
     * DELETE /api/favorites/{favorite}
     * Hapus favorit (hanya milik user sendiri).
     */
    public function destroy(Request $request, Favorite $favorite): JsonResponse
    {
        // Pastikan user hanya bisa hapus favorit miliknya sendiri
        if ($favorite->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Tidak memiliki akses.',
            ], 403);
        }

        $favorite->delete();

        return response()->json([
            'message' => 'Dihapus dari favorit.',
        ]);
    }
}