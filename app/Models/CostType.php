<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CostType extends Model
{
    protected $fillable = [
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function groupCosts(): HasMany
    {
        return $this->hasMany(GroupCost::class);
    }

    // Scope for active cost types
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
