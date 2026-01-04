<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncomeDistribution extends Model
{
    use HasFactory;

    protected $fillable = [
        'income_id',
        'recipient_type',
        'recipient_user_id',
        'amount',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function income(): BelongsTo
    {
        return $this->belongsTo(Income::class);
    }

    public function recipientUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    // Check if this is a mutual fund distribution
    public function isMutualFund(): bool
    {
        return $this->recipient_type === 'mutual_fund';
    }

    // Check if this is a user distribution
    public function isUser(): bool
    {
        return $this->recipient_type === 'user';
    }
}
