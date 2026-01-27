<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Inquiry extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'public_id',
        'performance_date',
        'performance_time_mode',
        'performance_time_exact',
        'performance_time_text',
        'duration_minutes',
        'location_name',
        'location_address',
        'contact_person',
        'contact_email',
        'contact_phone',
        'performance_type_id',
        'status',
        'band_size_id',
        'notes',
        'price_amount',
        'currency',
        'received_at',
        'created_by',
    ];

    protected $casts = [
        'performance_date' => 'date:Y-m-d',
        'received_at' => 'datetime',
        'price_amount' => 'decimal:2',
        'duration_minutes' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($inquiry) {
            if (empty($inquiry->public_id)) {
                $inquiry->public_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function performanceType(): BelongsTo
    {
        return $this->belongsTo(PerformanceType::class);
    }

    public function bandSize(): BelongsTo
    {
        return $this->belongsTo(BandSize::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function income(): HasOne
    {
        return $this->hasOne(Income::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    // Query scopes
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}
