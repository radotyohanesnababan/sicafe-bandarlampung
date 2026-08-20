<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Favorite extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'cafe_id',
    ];

    protected $hidden = [
        'created_at',
    ];

    // ── Relations ──────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function cafe()
    {
        return $this->belongsTo(Cafe::class);
    }
}