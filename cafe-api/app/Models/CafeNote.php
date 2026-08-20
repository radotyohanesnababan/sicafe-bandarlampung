<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CafeNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'cafe_id',
        'note',
        'rating',
        'visited_at',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected function casts(): array
    {
        return [
            'rating'     => 'integer',
            'visited_at' => 'date',
        ];
    }

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