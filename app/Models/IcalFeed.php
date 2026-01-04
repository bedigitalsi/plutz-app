<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class IcalFeed extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'token_hash',
        'filters',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'filters' => 'array',
        'is_active' => 'boolean',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Generate a new random token and return both the plain token and its hash
     */
    public static function generateToken(): array
    {
        $plainToken = Str::random(32);
        $hashedToken = hash('sha256', $plainToken);
        
        return [
            'plain' => $plainToken,
            'hash' => $hashedToken,
        ];
    }

    /**
     * Hash a plain token for lookup
     */
    public static function hashToken(string $plainToken): string
    {
        return hash('sha256', $plainToken);
    }

    /**
     * Find feed by plain token
     */
    public static function findByToken(string $plainToken): ?self
    {
        $hash = self::hashToken($plainToken);
        return self::where('token_hash', $hash)
            ->where('is_active', true)
            ->first();
    }
}
