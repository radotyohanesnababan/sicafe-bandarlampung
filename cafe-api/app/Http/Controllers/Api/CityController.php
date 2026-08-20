<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\City;
use Illuminate\Http\JsonResponse;

class CityController extends Controller
{
    /**
     * GET /api/cities
     * List semua kota.
     */
    public function index(): JsonResponse
    {
        $cities = City::select('id', 'name', 'slug', 'lat', 'lng')
            ->orderBy('name')
            ->get();

        return response()->json(['cities' => $cities]);
    }

    /**
     * GET /api/cities/{city:slug}
     * Detail kota.
     */
    public function show(City $city): JsonResponse
    {
        $city->loadCount('cafes');

        return response()->json($city);
    }
}