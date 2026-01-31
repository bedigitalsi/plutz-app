<?php

namespace App\Http\Controllers;

use App\Models\BandSize;
use App\Models\Inquiry;
use App\Models\PerformanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Inquiry::with(['performanceType', 'bandSize', 'creator'])
            ->orderBy('performance_date', 'desc');

        // Filters
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }
        
        if ($request->filled('date_from')) {
            $query->where('performance_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('performance_date', '<=', $request->date_to);
        }

        if ($request->has('search') && $request->search !== '') {
            $query->where(function($q) use ($request) {
                $q->where('location_name', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_person', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_email', 'like', '%' . $request->search . '%');
            });
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
            'bandSizes' => BandSize::orderBy('order')->get(),
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
            'band_size_id' => 'required|exists:band_sizes,id',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        $validated['status'] = 'pending';
        $validated['created_by'] = Auth::id();
        $validated['received_at'] = now();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        // Set default duration from settings if not provided
        if (empty($validated['duration_minutes'])) {
            $validated['duration_minutes'] = \App\Models\Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry = Inquiry::create($validated);

        return Redirect::route('inquiries.show', $inquiry->id)
            ->with('success', 'Inquiry created successfully.');
    }

    public function show(Inquiry $inquiry): Response
    {
        $inquiry->load(['performanceType', 'bandSize', 'creator', 'income']);

        return Inertia::render('Inquiries/Show', [
            'inquiry' => $inquiry,
        ]);
    }

    public function edit(Inquiry $inquiry): Response
    {
        return Inertia::render('Inquiries/Edit', [
            'inquiry' => $inquiry,
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'bandSizes' => BandSize::orderBy('order')->get(),
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
            'band_size_id' => 'required|exists:band_sizes,id',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'notes' => 'nullable|string',
        ]);

        // Set default duration if not provided
        if (empty($validated['duration_minutes'])) {
            $validated['duration_minutes'] = \App\Models\Setting::where('key', 'default_duration_minutes')->value('value') ?? 120;
        }

        $inquiry->update($validated);

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
