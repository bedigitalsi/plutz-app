<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Income extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'income_date',
        'amount',
        'currency',
        'invoice_issued',
        'performance_type_id',
        'contact_person',
        'notes',
        'inquiry_id',
        'created_by',
    ];

    protected $casts = [
        'income_date' => 'date',
        'amount' => 'decimal:2',
        'invoice_issued' => 'boolean',
    ];

    public function performanceType(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class);
    }

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function distributions(): HasMany
    {
        return $this->hasMany(IncomeDistribution::class);
    }

    // Helper to check if distributed
    public function isDistributed(): bool
    {
        return $this->distributions()->exists();
    }

    // Get total distributed amount
    public function getTotalDistributed(): float
    {
        return (float) $this->distributions()->sum('amount');
    }

    // Get remaining amount to distribute
    public function getRemainingToDistribute(): float
    {
        return (float) $this->amount - $this->getTotalDistributed();
    }
}
