<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CityController;
use App\Http\Controllers\Api\CafeController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\CafeNoteController;
use Illuminate\Support\Facades\Route;

// Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public — read only
Route::get('/cities', [CityController::class, 'index']);
Route::get('/cities/{city:slug}', [CityController::class, 'show']);
Route::get('/cities/{city:slug}/cafes', [CafeController::class, 'index']);
Route::get('/cafes/{cafe:slug}', [CafeController::class, 'show']);

// Protected — butuh token
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/cafes', [CafeController::class, 'store']);
    Route::put('/cafes/{cafe:slug}', [CafeController::class, 'update']);
    Route::delete('/cafes/{cafe:slug}', [CafeController::class, 'destroy']);

    Route::apiResource('favorites', FavoriteController::class)->only(['index', 'store', 'destroy']);
    Route::apiResource('cafe-notes', CafeNoteController::class)->only(['index', 'store', 'update', 'destroy']);
});