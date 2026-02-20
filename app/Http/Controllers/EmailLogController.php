<?php

namespace App\Http\Controllers;

use App\Models\EmailLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class EmailLogController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:255',
            'type' => 'nullable|in:contract_invitation,contract_signed,inquiry_confirmed,test,other',
        ]);

        $emailLogs = EmailLog::query()
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                $query->where(function ($q) use ($filters) {
                    $q->where('to_email', 'like', '%' . $filters['search'] . '%')
                        ->orWhere('subject', 'like', '%' . $filters['search'] . '%');
                });
            })
            ->when(!empty($filters['type']), function ($query) use ($filters) {
                $query->where('type', $filters['type']);
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Settings/EmailHistory', [
            'emailLogs' => $emailLogs,
            'filters' => [
                'search' => $filters['search'] ?? '',
                'type' => $filters['type'] ?? '',
            ],
        ]);
    }

    public function show(EmailLog $emailLog)
    {
        return response()->json($emailLog);
    }

    public function destroy(EmailLog $emailLog)
    {
        $emailLog->delete();

        return Redirect::back()->with('success', 'Email log deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'older_than_days' => 'required|in:7,30,90,365,all',
        ]);

        $query = EmailLog::query();

        if ($validated['older_than_days'] !== 'all') {
            $query->where('created_at', '<', now()->subDays((int) $validated['older_than_days']));
        }

        $deleted = $query->delete();

        return Redirect::back()->with('success', "Deleted {$deleted} email logs.");
    }
}
