<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'public_id',
        'client_name',
        'client_email',
        'client_company',
        'client_address',
        'performance_date',
        'total_price',
        'deposit_amount',
        'currency',
        'status',
        'markdown_snapshot',
        'sent_at',
        'signed_at',
        'signer_name',
        'signer_email',
        'signer_company',
        'signer_address',
        'signer_ip',
        'signer_user_agent',
        'consented_at',
        'created_by',
        'contract_template_id',
    ];

    protected $casts = [
        'performance_date' => 'date',
        'total_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'sent_at' => 'datetime',
        'signed_at' => 'datetime',
        'consented_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($contract) {
            if (empty($contract->public_id)) {
                $contract->public_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }

    public function signTokens(): HasMany
    {
        return $this->hasMany(ContractSignToken::class);
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    public function getSignedPdfPathAttribute()
    {
        return $this->attachments()
            ->where('original_name', 'like', '%signed.pdf')
            ->first()?->path;
    }
}
