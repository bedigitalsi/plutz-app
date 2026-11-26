<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContractSignToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id',
        'recipient_name',
        'recipient_email',
        'token_hash',
        'expires_at',
        'used_at',
        'created_by',
        'signer_name',
        'signer_email',
        'signer_company',
        'signer_address',
        'signature_path',
        'signer_ip',
        'signer_user_agent',
    ];

    protected $hidden = [
        'token_hash',
        'signer_user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return !is_null($this->used_at);
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }
}
