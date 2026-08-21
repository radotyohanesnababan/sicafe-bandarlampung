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
     * List semua cafe di kota tertentu dengan filter.
     */
    public function index(Request $request, City $city): JsonResponse
    {
        $query = $city->cafes()
            ->with(['photos:id,cafe_id,path']) // Tetap eager load photos untuk hindari N+1 query
            ->select([
                'id', 'city_id', 'name', 'slug', 'lat', 'lng',
                'address', 'category', 'price_level', 'avg_rating',
                'review_count', 'source', 'amenities', 'opening_hours', 'phone',
            ]);

        // Filter Keyword
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;
            $query->where(function($q) use ($keyword) {
                $q->where('name', 'like', "%{$keyword}%")
                  ->orWhere('address', 'like', "%{$keyword}%");
            });
        }

        // Filter Kategori
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter Kecamatan
        if ($request->filled('kecamatan')) {
            $query->where('address', 'like', "%{$request->kecamatan}%");
        }

        // Filter Tingkat Harga
        if ($request->filled('price_level')) {
            $query->where('price_level', $request->price_level);
        }

        // Sortir
        $sortBy = $request->input('sort_by', 'popular');
        if ($sortBy === 'rating') {
            $query->orderBy('avg_rating', 'desc')->orderBy('review_count', 'desc');
        } else {
            // Default: popular
            $query->orderBy('review_count', 'desc');
        }

        $cafes = $query->paginate(15);

        // Tambahkan query parameter ke link pagination agar tidak hilang saat load page 2
        $cafes->appends($request->all());

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