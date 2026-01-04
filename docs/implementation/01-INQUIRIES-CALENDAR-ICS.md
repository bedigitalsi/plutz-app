# Implementation Guide: Inquiries + Calendar + ICS Feed

## Overview
This module handles gig inquiries with status management (pending/confirmed/rejected), calendar views, and Apple Calendar sync via ICS feeds.

## Prerequisites
- Database migrations already run
- Models scaffolded
- Permissions configured

---

## STEP 1: Complete the Inquiry Model

**File:** `app/Models/Inquiry.php`

The model is partially complete. Add these relationships at the end of the class:

```php
// Add to existing Inquiry model
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
```

---

## STEP 2: Create InquiryController

**File:** `app/Http/Controllers/InquiryController.php` (already exists)

Replace contents with:

```php
<?php

namespace App\Http\Controllers;

use App\Models\BandSize;
use App\Models\Inquiry;
use App\Models\PerformanceType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Inquiry::with(['performanceType', 'bandSize', 'creator'])
            ->orderBy('performance_date', 'desc');

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('date_from')) {
            $query->where('performance_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('performance_date', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('location_name', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_person', 'like', '%' . $request->search . '%');
            });
        }

        return Inertia::render('Inquiries/Index', [
            'inquiries' => $query->paginate(20)->withQueryString(),
            'filters' => $request->only(['status', 'date_from', 'date_to', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Inquiries/Create', [
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'bandSizes' => BandSize::orderBy('order')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'performance_date' => 'required|date',
            'performance_time_mode' => 'required|in:exact_time,text_time',
            'performance_time_exact' => 'nullable|date_format:H:i',
            'performance_time_text' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'location_name' => 'required|string|max:255',
            'location_address' => 'nullable|string',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'performance_type_id' => 'required|exists:performance_types,id',
            'status' => 'required|in:pending,confirmed,rejected',
            'band_size_id' => 'required|exists:band_sizes,id',
            'notes' => 'nullable|string',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['received_at'] = now();

        Inquiry::create($validated);

        return redirect()->route('inquiries.index')
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
            'performance_time_exact' => 'nullable|date_format:H:i',
            'performance_time_text' => 'nullable|string',
            'duration_minutes' => 'nullable|integer|min:0',
            'location_name' => 'required|string|max:255',
            'location_address' => 'nullable|string',
            'contact_person' => 'required|string|max:255',
            'contact_email' => 'nullable|email',
            'contact_phone' => 'nullable|string',
            'performance_type_id' => 'required|exists:performance_types,id',
            'status' => 'required|in:pending,confirmed,rejected',
            'band_size_id' => 'required|exists:band_sizes,id',
            'notes' => 'nullable|string',
            'price_amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
        ]);

        $inquiry->update($validated);

        return redirect()->route('inquiries.index')
            ->with('success', 'Inquiry updated successfully.');
    }

    public function destroy(Inquiry $inquiry)
    {
        $inquiry->delete();

        return redirect()->route('inquiries.index')
            ->with('success', 'Inquiry deleted successfully.');
    }

    public function updateStatus(Request $request, Inquiry $inquiry)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,rejected',
        ]);

        $inquiry->update($validated);

        return back()->with('success', 'Status updated successfully.');
    }
}
```

---

## STEP 3: Create Calendar Controller

**File:** `app/Http/Controllers/CalendarController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CalendarController extends Controller
{
    public function index()
    {
        return Inertia::render('Calendar/Index');
    }

    public function events(Request $request)
    {
        $start = $request->input('start');
        $end = $request->input('end');

        $inquiries = Inquiry::with(['performanceType', 'bandSize'])
            ->whereBetween('performance_date', [$start, $end])
            ->get();

        $events = $inquiries->map(function ($inquiry) {
            $color = match($inquiry->status) {
                'confirmed' => '#10b981', // green
                'pending' => '#f59e0b',   // orange
                'rejected' => '#ef4444',  // red
            };

            return [
                'id' => $inquiry->id,
                'title' => $inquiry->performanceType->name . ' - ' . $inquiry->contact_person,
                'start' => $inquiry->performance_date->format('Y-m-d'),
                'backgroundColor' => $color,
                'borderColor' => $color,
                'extendedProps' => [
                    'inquiry_id' => $inquiry->id,
                    'status' => $inquiry->status,
                    'location' => $inquiry->location_name,
                    'band_size' => $inquiry->bandSize->label,
                    'price' => $inquiry->price_amount,
                ],
            ];
        });

        return response()->json($events);
    }
}
```

---

## STEP 4: Create ICS Feed Controller

**File:** `app/Http/Controllers/IcalFeedController.php`

```php
<?php

namespace App\Http\Controllers;

use App\Models\IcalFeed;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class IcalFeedController extends Controller
{
    public function index()
    {
        $feeds = IcalFeed::where('created_by', auth()->id())->get();

        return Inertia::render('IcalFeeds/Index', [
            'feeds' => $feeds,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $token = Str::random(32);
        
        IcalFeed::create([
            'name' => $validated['name'],
            'token_hash' => hash('sha256', $token),
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        return back()->with([
            'success' => 'ICS feed created successfully.',
            'token' => $token, // Show only once
        ]);
    }

    public function show($token)
    {
        $tokenHash = hash('sha256', $token);
        
        $feed = IcalFeed::where('token_hash', $tokenHash)
            ->where('is_active', true)
            ->firstOrFail();

        $inquiries = Inquiry::with(['performanceType'])
            ->where('status', 'confirmed')
            ->orderBy('performance_date')
            ->get();

        $ics = $this->generateICS($inquiries);

        return response($ics)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="plutz-calendar.ics"');
    }

    public function destroy(IcalFeed $icalFeed)
    {
        $this->authorize('delete', $icalFeed);
        
        $icalFeed->delete();

        return back()->with('success', 'ICS feed deleted successfully.');
    }

    private function generateICS($inquiries)
    {
        $timezone = config('app.timezone', 'UTC');
        $appTimezone = \App\Models\Setting::where('key', 'app_timezone')->first()?->value ?? 'Europe/Ljubljana';
        
        $lines = [];
        $lines[] = 'BEGIN:VCALENDAR';
        $lines[] = 'VERSION:2.0';
        $lines[] = 'PRODID:-//Plutz//Calendar//EN';
        $lines[] = 'CALSCALE:GREGORIAN';
        $lines[] = 'X-WR-TIMEZONE:' . $appTimezone;

        foreach ($inquiries as $inquiry) {
            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:inquiry-' . $inquiry->id . '@plutz.app';
            $lines[] = 'DTSTAMP:' . now()->format('Ymd\THis\Z');
            
            // Handle start time
            if ($inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact) {
                $start = \Carbon\Carbon::parse($inquiry->performance_date->format('Y-m-d') . ' ' . $inquiry->performance_time_exact, $appTimezone);
                $lines[] = 'DTSTART;TZID=' . $appTimezone . ':' . $start->format('Ymd\THis');
                
                // Calculate end time
                $duration = $inquiry->duration_minutes ?? 120;
                $end = $start->copy()->addMinutes($duration);
                $lines[] = 'DTEND;TZID=' . $appTimezone . ':' . $end->format('Ymd\THis');
            } else {
                // All-day event
                $lines[] = 'DTSTART;VALUE=DATE:' . $inquiry->performance_date->format('Ymd');
                $lines[] = 'DTEND;VALUE=DATE:' . $inquiry->performance_date->copy()->addDay()->format('Ymd');
            }
            
            $lines[] = 'SUMMARY:Plutz - ' . $inquiry->performanceType->name;
            $lines[] = 'LOCATION:' . $this->escapeString($inquiry->location_name);
            
            $description = "Contact: " . $inquiry->contact_person;
            if ($inquiry->contact_phone) {
                $description .= "\\nPhone: " . $inquiry->contact_phone;
            }
            if ($inquiry->notes) {
                $description .= "\\nNotes: " . $this->escapeString($inquiry->notes);
            }
            $lines[] = 'DESCRIPTION:' . $description;
            
            $lines[] = 'STATUS:CONFIRMED';
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines);
    }

    private function escapeString($string)
    {
        return str_replace([',', ';', '\\', "\n"], ['\\,', '\\;', '\\\\', '\\n'], $string);
    }
}
```

---

## STEP 5: Add Routes

**File:** `routes/web.php`

Add after the existing routes (before `require __DIR__.'/auth.php';`):

```php
// Inquiries
Route::middleware(['auth', 'permission:inquiries.view'])->group(function () {
    Route::resource('inquiries', \App\Http\Controllers\InquiryController::class);
    Route::patch('inquiries/{inquiry}/status', [\App\Http\Controllers\InquiryController::class, 'updateStatus'])
        ->name('inquiries.update-status')
        ->middleware('permission:inquiries.change_status');
});

// Calendar
Route::middleware(['auth', 'permission:inquiries.view'])->group(function () {
    Route::get('/calendar', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar.index');
    Route::get('/calendar/events', [\App\Http\Controllers\CalendarController::class, 'events'])->name('calendar.events');
});

// ICS Feeds (admin only)
Route::middleware(['auth', 'permission:calendar.integrations.manage'])->group(function () {
    Route::get('/ical-feeds', [\App\Http\Controllers\IcalFeedController::class, 'index'])->name('ical-feeds.index');
    Route::post('/ical-feeds', [\App\Http\Controllers\IcalFeedController::class, 'store'])->name('ical-feeds.store');
    Route::delete('/ical-feeds/{icalFeed}', [\App\Http\Controllers\IcalFeedController::class, 'destroy'])->name('ical-feeds.destroy');
});

// Public ICS feed
Route::get('/ical/{token}.ics', [\App\Http\Controllers\IcalFeedController::class, 'show'])->name('ical-feeds.show');
```

---

## STEP 6: Install FullCalendar

```bash
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/interaction
```

---

## STEP 7: Create React Pages

### A. Inquiries Index Page

**File:** `resources/js/Pages/Inquiries/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Inquiry {
    id: number;
    public_id: string;
    performance_date: string;
    location_name: string;
    contact_person: string;
    status: 'pending' | 'confirmed' | 'rejected';
    price_amount: number;
    currency: string;
    performance_type: { name: string };
    band_size: { label: string };
}

interface Props extends PageProps {
    inquiries: {
        data: Inquiry[];
        links: any[];
        meta: any;
    };
    filters: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

export default function Index({ auth, inquiries, filters }: Props) {
    const statusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl">Inquiries</h2>}>
            <Head title="Inquiries" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex justify-between mb-6">
                                <h3 className="text-lg font-medium">All Inquiries</h3>
                                <Link
                                    href={route('inquiries.create')}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Add Inquiry
                                </Link>
                            </div>

                            {/* Add filters here */}

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {inquiries.data.map((inquiry) => (
                                            <tr key={inquiry.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.performance_date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.performance_type.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.location_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{inquiry.contact_person}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColor(inquiry.status)}`}>
                                                        {inquiry.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {inquiry.price_amount ? `${inquiry.price_amount} ${inquiry.currency}` : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={route('inquiries.show', inquiry.id)} className="text-blue-600 hover:text-blue-900 mr-3">
                                                        View
                                                    </Link>
                                                    <Link href={route('inquiries.edit', inquiry.id)} className="text-indigo-600 hover:text-indigo-900">
                                                        Edit
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

### B. Calendar Page

**File:** `resources/js/Pages/Calendar/Index.tsx`

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useRef } from 'react';

export default function Index({ auth }: PageProps) {
    const calendarRef = useRef<any>(null);

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl">Calendar</h2>}>
            <Head title="Calendar" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={(info, successCallback) => {
                                fetch(`/calendar/events?start=${info.startStr}&end=${info.endStr}`)
                                    .then(res => res.json())
                                    .then(data => successCallback(data));
                            }}
                            eventClick={(info) => {
                                const inquiryId = info.event.extendedProps.inquiry_id;
                                router.visit(route('inquiries.show', inquiryId));
                            }}
                            height="auto"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## STEP 8: Create Form Pages

Create these additional pages (simplified structure):
- `resources/js/Pages/Inquiries/Create.tsx` - Form for creating inquiries
- `resources/js/Pages/Inquiries/Edit.tsx` - Form for editing inquiries
- `resources/js/Pages/Inquiries/Show.tsx` - Detail view with status change buttons
- `resources/js/Pages/IcalFeeds/Index.tsx` - Manage ICS feeds

---

## STEP 9: Test

1. Start dev server: `npm run dev`
2. Start Laravel: `php artisan serve`
3. Login as admin (admin@plutz.app / password)
4. Navigate to `/inquiries`
5. Create a test inquiry
6. View calendar at `/calendar`
7. Create ICS feed at `/ical-feeds`

---

## Next Steps

After completing this module:
- Move to `02-MONEY-MODULES.md`
- Add proper form validation
- Implement mobile-responsive tables
- Add bulk actions
- Implement filters UI

---

## Troubleshooting

**FullCalendar not showing?**
- Make sure `npm install` completed
- Rebuild: `npm run build`

**ICS feed not working?**
- Check that token is hashed correctly
- Verify route is public (not behind auth middleware)

**Calendar events not loading?**
- Check `/calendar/events` returns valid JSON
- Verify date range is correct

