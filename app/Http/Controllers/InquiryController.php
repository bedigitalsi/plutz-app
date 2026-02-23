<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\PerformanceType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $hasAnyFilter = $request->filled('date_from')
            || $request->filled('date_to')
            || ($request->has('status') && $request->status !== '')
            || ($request->has('search') && $request->search !== '');

        $query = Inquiry::with(['performanceType', 'bandMembers:id,name', 'creator'])
            ->visibleTo($user);

        if ($hasAnyFilter) {
            $query->orderBy('performance_date', 'desc');

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
                $query->where(function($q) use ($request) {
                    $q->where('location_name', 'like', '%' . $request->search . '%')
                      ->orWhere('contact_person', 'like', '%' . $request->search . '%')
                      ->orWhere('contact_email', 'like', '%' . $request->search . '%');
                });
            }
        } else {
            $upcomingCount = Inquiry::visibleTo($user)
                ->whereDate('performance_date', '>=', now()->toDateString())
                ->count();

            if ($upcomingCount > 0) {
                $query->whereDate('performance_date', '>=', now()->toDateString())
                    ->orderBy('performance_date', 'asc');
            } else {
                $query->orderBy('performance_date', 'desc');
            }
        }

        return Inertia::render('Inquiries/Index', [
            'inquiries' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Inquiries/Create', [
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'bandMembers' => User::where('is_band_member', true)->orderBy('name')->get(['id', 'name']),
            'date' => $request->query('date'),
        ]);
    }

    public function store(Request $request)
    {
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
        $validated['created_by'] = Auth::id();
        $validated['received_at'] = now();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        if (empty($validated['duration_minutes'])) {
            $validated['duration_minutes'] = \App\Models\Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry = Inquiry::create($validated);
        $inquiry->bandMembers()->sync($memberIds);

        return Redirect::route('inquiries.show', $inquiry->id)
            ->with('success', 'Inquiry created successfully.');
    }

    public function show(Inquiry $inquiry): Response
    {
        $inquiry->load(['performanceType', 'bandMembers:id,name', 'creator', 'income']);

        return Inertia::render('Inquiries/Show', [
            'inquiry' => $inquiry,
        ]);
    }

    public function edit(Inquiry $inquiry): Response
    {
        $inquiry->load('bandMembers:id,name');

        return Inertia::render('Inquiries/Edit', [
            'inquiry' => $inquiry->append('band_member_ids'),
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'bandMembers' => User::where('is_band_member', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Inquiry $inquiry)
    {
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
            $validated['duration_minutes'] = \App\Models\Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry->update($validated);
        $inquiry->bandMembers()->sync($memberIds);

        return Redirect::route('inquiries.show', $inquiry->id)
            ->with('success', 'Inquiry updated successfully.');
    }

    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();

        return Redirect::route('inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }

    public function updateStatus(Request $request, Inquiry $inquiry)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,rejected',
        ]);

        $oldStatus = $inquiry->status;

        $inquiry->update(['status' => $validated['status']]);

        if ($validated['status'] === 'confirmed' && $oldStatus !== 'confirmed') {
            \App\Jobs\SendInquiryConfirmedNotification::dispatch($inquiry)
                ->delay(now()->addMinutes(2));
        }

        return Redirect::back()
            ->with('success', 'Inquiry status updated to ' . $validated['status'] . '.');
    }
}
