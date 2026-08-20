<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cafe;
use App\Models\City;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CafeController extends Controller
{
    /**
     * GET /api/cities/{city:slug}/cafes
     * List semua cafe di kota tertentu.
     */
    public function index(City $city): JsonResponse
    {
        $cafes = $city->cafes()
            ->select([
                'id', 'city_id', 'name', 'slug', 'lat', 'lng',
                'address', 'category', 'price_level', 'avg_rating',
                'source',
            ])
            ->orderBy('name')
            ->get();

        return response()->json([
            'city'   => $city->only('name', 'slug'),
            'cafes'  => $cafes,
        ]);
    }

    /**
     * GET /api/cafes/{cafe:slug}
     * Detail cafe lengkap + photos.
     */
    public function show(Cafe $cafe): JsonResponse
    {
        $cafe->load(['city:name,slug', 'photos:id,cafe_id,path,created_at']);

        return response()->json($cafe);
    }

    /**
     * POST /api/cafes
     * Tambah cafe baru.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city_id'       => ['required', 'exists:cities,id'],
            'name'          => ['required', 'string', 'max:255'],
            'lat'           => ['required', 'numeric', 'between:-90,90'],
            'lng'           => ['required', 'numeric', 'between:-180,180'],
            'address'       => ['nullable', 'string', 'max:500'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'website'       => ['nullable', 'url', 'max:500'],
            'category'      => ['nullable', 'in:cafe,coffee_shop,coworking'],
            'price_level'   => ['nullable', 'integer', 'between:1,4'],
            'description'   => ['nullable', 'string'],
        ]);

        // Generate unique slug from name
        $slug = Str::slug($validated['name']);
        if (Cafe::where('slug', $slug)->exists()) {
            $slug .= '-' . Str::random(5);
        }

        $cafe = Cafe::create([
            ...$validated,
            'slug'   => $slug,
            'source' => 'manual',
        ]);

        return response()->json($cafe, 201);
    }

    /**
     * PUT /api/cafes/{cafe:slug}
     * Update data cafe.
     */
    public function update(Request $request, Cafe $cafe): JsonResponse
    {
        $validated = $request->validate([
            'city_id'       => ['sometimes', 'exists:cities,id'],
            'name'          => ['sometimes', 'string', 'max:255'],
            'lat'           => ['sometimes', 'numeric', 'between:-90,90'],
            'lng'           => ['sometimes', 'numeric', 'between:-180,180'],
            'address'       => ['nullable', 'string', 'max:500'],
            'phone'         => ['nullable', 'string', 'max:50'],
            'opening_hours' => ['nullable', 'string', 'max:255'],
            'website'       => ['nullable', 'url', 'max:500'],
            'category'      => ['nullable', 'in:cafe,coffee_shop,coworking'],
            'price_level'   => ['nullable', 'integer', 'between:1,4'],
            'description'   => ['nullable', 'string'],
        ]);

        // Update slug if name changed
        if (isset($validated['name']) && $validated['name'] !== $cafe->name) {
            $slug = Str::slug($validated['name']);
            if (Cafe::where('slug', $slug)->where('id', '!=', $cafe->id)->exists()) {
                $slug .= '-' . Str::random(5);
            }
            $validated['slug'] = $slug;
        }

        $cafe->update($validated);

        return response()->json($cafe);
    }

    /**
     * DELETE /api/cafes/{cafe:slug}
     * Hapus cafe.
     */
    public function destroy(Cafe $cafe): JsonResponse
    {
        $cafe->delete();

        return response()->json([
            'message' => 'Cafe berhasil dihapus.',
        ]);
    }
}