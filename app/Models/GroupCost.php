<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupCost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'cost_date',
        'cost_type_id',
        'amount',
        'currency',
        'is_paid',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'cost_date' => 'date',
        'amount' => 'decimal:2',
        'is_paid' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($groupCost) {
            if (empty($groupCost->cost_date)) {
                $groupCost->cost_date = today();
            }
        });
    }

    public function costType(): BelongsTo
    {
        return $this->belongsTo(CostType::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Query scope for paid costs
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    // Query scope for unpaid costs
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }
}
