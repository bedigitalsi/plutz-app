<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.view');

        $user = $request->user();
        $query = Inquiry::with(['performanceType', 'bandMembers:id,name', 'creator'])
            ->visibleTo($user)
            ->orderBy('performance_date', 'desc');

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('performance_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('performance_date', '<=', $request->date_to);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where(function ($q) use ($request) {
                $q->where('location_name', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_person', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_email', 'like', '%' . $request->search . '%');
            });
        }

        return response()->json(
            $query->paginate($request->input('per_page', 20))
        );
    }

    public function show(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.view');

        $inquiry->load(['performanceType', 'bandMembers:id,name', 'creator', 'income']);

        return response()->json(['data' => $inquiry]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.create');

        $validated = $request->validate([
            'performance_date' => 'required|date',
            'performance_time_mode' => 'required|in:exact_time,text_time',
            'performance_time_exact' => ['nullable', 'required_if:performance_time_mode,exact_time', 'exclude_if:performance_time_mode,text_time', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'performance_time_text' => ['nullable', 'required_if:performance_time_mode,text_time', 'exclude_if:performance_time_mode,exact_time', 'string', 'max:255'],
            'duration_minutes' => 'nullable|integer|min:1',
            'location_name' => 'required|string|max:255',
            'location_address' => 'nullable|string|max:500',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'performance_type_id' => 'required|exists:performance_types,id',
            'band_member_ids' => 'required|array|min:1',
            'band_member_ids.*' => 'exists:users,id',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        $memberIds = $validated['band_member_ids'];
        unset($validated['band_member_ids']);

        $validated['status'] = 'pending';
        $validated['created_by'] = $request->user()->id;
        $validated['received_at'] = now();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        if (empty($validated['duration_minutes'])) {
            $validated['duration_minutes'] = Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry = Inquiry::create($validated);
        $inquiry->bandMembers()->sync($memberIds);
        $inquiry->load(['performanceType', 'bandMembers:id,name', 'creator']);

        return response()->json(['data' => $inquiry], 201);
    }

    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.edit');

        $validated = $request->validate([
            'performance_date' => 'required|date',
            'performance_time_mode' => 'required|in:exact_time,text_time',
            'performance_time_exact' => ['nullable', 'required_if:performance_time_mode,exact_time', 'exclude_if:performance_time_mode,text_time', 'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'],
            'performance_time_text' => ['nullable', 'required_if:performance_time_mode,text_time', 'exclude_if:performance_time_mode,exact_time', 'string', 'max:255'],
            'duration_minutes' => 'nullable|integer|min:1',
            'location_name' => 'required|string|max:255',
            'location_address' => 'nullable|string|max:500',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'performance_type_id' => 'required|exists:performance_types,id',
            'band_member_ids' => 'required|array|min:1',
            'band_member_ids.*' => 'exists:users,id',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        $memberIds = $validated['band_member_ids'];
        unset($validated['band_member_ids']);

        if (empty($validated['duration_minutes'])) {
            $validated['duration_minutes'] = Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry->update($validated);
        $inquiry->bandMembers()->sync($memberIds);
        $inquiry->load(['performanceType', 'bandMembers:id,name', 'creator']);

        return response()->json(['data' => $inquiry]);
    }

    public function destroy(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.edit');

        $inquiry->delete();

        return response()->json(['message' => 'Inquiry deleted successfully.']);
    }

    public function updateStatus(Request $request, Inquiry $inquiry): JsonResponse
    {
        $this->authorizeApi($request, 'inquiries.change_status');

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,rejected',
        ]);

        $oldStatus = $inquiry->status;
        $inquiry->update(['status' => $validated['status']]);

        if ($validated['status'] === 'confirmed' && $oldStatus !== 'confirmed') {
            \App\Jobs\SendInquiryConfirmedNotification::dispatch($inquiry)
                ->delay(now()->addMinutes(2));
        }

        $inquiry->load(['performanceType', 'bandMembers:id,name', 'creator']);

        return response()->json(['data' => $inquiry]);
    }

    private function authorizeApi(Request $request, string $permission): void
    {
        $user = $request->user();

        if ($user->currentAccessToken() && !$user->tokenCan($permission)) {
            abort(403, 'Token does not have the required permission: ' . $permission);
        }

        if (!$user->hasPermissionTo($permission)) {
            abort(403, 'User does not have the required permission: ' . $permission);
        }
    }
}
