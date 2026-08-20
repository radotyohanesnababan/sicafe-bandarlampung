<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CafePhoto extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'cafe_id',
        'uploaded_by',
        'path',
    ];

    protected $hidden = [
        'created_at',
    ];

    // ── Relations ──────────────────────────────────
    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}