<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class EmailLog extends Model
{
    protected $fillable = [
        'to_email',
        'from_email',
        'from_name',
        'subject',
        'body',
        'type',
        'related_type',
        'related_id',
        'status',
        'error_message',
    ];

    public function related(): MorphTo
    {
        return $this->morphTo();
    }
}
