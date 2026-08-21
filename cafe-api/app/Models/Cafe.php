<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cafe extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_id',
        'osm_id',
        'osm_type',
        'name',
        'slug',
        'lat',
        'lng',
        'address',
        'phone',
        'opening_hours',
        'website',
        'category',
        'price_level',
        'avg_rating',
        'review_count',
        'description',
        'source',
        'gmaps_url',
        'last_synced_at',
        'amenities',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'last_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'lat'          => 'decimal:7',
            'lng'          => 'decimal:7',
            'price_level'  => 'integer',
            'avg_rating'   => 'decimal:2',
            'last_synced_at' => 'datetime',
            'amenities'    => 'array',
        ];
    }

    // ── Relations ──────────────────────────────────
    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function photos()
    {
        return $this->hasMany(CafePhoto::class);
    }

    public function favorites()
    {
        return $this->hasMany(Favorite::class);
    }

    public function notes()
    {
        return $this->hasMany(CafeNote::class);
    }

    // ── Route Key ──────────────────────────────────
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}