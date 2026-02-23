<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function bandMembers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inquiry_user')->withTimestamps();
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

    /**
     * Accessor for form convenience — returns array of member IDs.
     */
    public function getBandMemberIdsAttribute(): array
    {
        return $this->bandMembers->pluck('id')->toArray();
    }

    /**
     * Get band size label based on number of assigned members.
     */
    public function getBandSizeLabelAttribute(): string
    {
        $count = $this->bandMembers()->count();
        if ($count === 1) return 'Solo';
        return $count . ' people';
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

    /**
     * Scope to only show inquiries visible to the given user.
     * Admin and BandBoss see all; band members only see their assigned inquiries.
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->hasRole(['Admin', 'BandBoss'])) {
            return $query;
        }

        return $query->whereHas('bandMembers', function ($q) use ($user) {
            $q->where('users.id', $user->id);
        });
    }
}
