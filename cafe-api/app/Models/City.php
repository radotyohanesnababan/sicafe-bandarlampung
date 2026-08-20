<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'osm_relation_id',
        'lat',
        'lng',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    // ── Relations ──────────────────────────────────
    public function cafes()
    {
        return $this->hasMany(Cafe::class);
    }

    // ── Route Key ──────────────────────────────────
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}