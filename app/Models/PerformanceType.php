<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceType extends Model
{
    protected $fillable = [
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function incomes(): HasMany
    {
        return $this->hasMany(Income::class);
    }

    // Scope for active performance types
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
