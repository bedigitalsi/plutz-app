<?php

namespace App\Http\Controllers;

use App\Models\Attachment;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    public function download(Attachment $attachment)
    {
        $disk = Storage::disk($attachment->disk);

        // Primary location (current disk root)
        if ($disk->exists($attachment->path)) {
            return $disk->download($attachment->path, $attachment->original_name);
        }

        // Fallback: legacy location (non-private storage/app)
        $fallbackPath = storage_path('app/' . $attachment->path);
        if (file_exists($fallbackPath)) {
            return response()->download($fallbackPath, $attachment->original_name);
        }

        abort(404, 'File not found');
    }
}
