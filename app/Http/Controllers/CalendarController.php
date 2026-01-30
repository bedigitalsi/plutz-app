<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->input('month', now()->format('Y-m'));
        $date = Carbon::createFromFormat('Y-m-d', $month . '-01')->startOfMonth();

        // Get all inquiries for the visible calendar range (includes prev/next month overflow)
        $calendarStart = $date->copy()->startOfWeek(Carbon::MONDAY);
        $calendarEnd = $date->copy()->endOfMonth()->endOfWeek(Carbon::SUNDAY);

        $events = Inquiry::with(['performanceType', 'bandSize'])
            ->whereBetween('performance_date', [$calendarStart, $calendarEnd])
            ->orderBy('performance_date')
            ->get()
            ->map(function ($inquiry) {
                return [
                    'id' => $inquiry->id,
                    'date' => $inquiry->performance_date->format('Y-m-d'),
                    'day' => (int) $inquiry->performance_date->format('j'),
                    'title' => $inquiry->location_name ?? $inquiry->contact_person ?? 'Event',
                    'location_address' => $inquiry->location_address,
                    'status' => $inquiry->status,
                    'time' => $inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact
                        ? Carbon::parse($inquiry->performance_time_exact)->format('g:i A')
                        : ($inquiry->performance_time_text ?? null),
                    'price' => $inquiry->price_amount ? (float) $inquiry->price_amount : null,
                    'currency' => $inquiry->currency ?? 'EUR',
                    'performance_type' => $inquiry->performanceType?->name,
                ];
            });

        // Upcoming events (future confirmed + pending, not rejected)
        $upcoming = Inquiry::with(['performanceType'])
            ->where('performance_date', '>=', now()->toDateString())
            ->where('status', '!=', 'rejected')
            ->orderBy('performance_date')
            ->limit(10)
            ->get()
            ->map(function ($inquiry) {
                return [
                    'id' => $inquiry->id,
                    'date' => $inquiry->performance_date->format('Y-m-d'),
                    'day_label' => $inquiry->performance_date->locale(app()->getLocale())->isoFormat('MMM DD'),
                    'day_name' => $inquiry->performance_date->locale(app()->getLocale())->isoFormat('dddd'),
                    'title' => $inquiry->location_name ?? $inquiry->contact_person ?? 'Event',
                    'location_address' => $inquiry->location_address,
                    'status' => $inquiry->status,
                    'time' => $inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact
                        ? Carbon::parse($inquiry->performance_time_exact)->format('g:i A')
                        : ($inquiry->performance_time_text ?? null),
                    'price' => $inquiry->price_amount ? (float) $inquiry->price_amount : null,
                    'currency' => $inquiry->currency ?? 'EUR',
                ];
            });

        return Inertia::render('Calendar/Index', [
            'currentMonth' => $date->format('Y-m'),
            'monthLabel' => $date->locale(app()->getLocale())->isoFormat('MMMM YYYY'),
            'events' => $events,
            'upcoming' => $upcoming,
            'calendarStart' => $calendarStart->format('Y-m-d'),
            'calendarEnd' => $calendarEnd->format('Y-m-d'),
            'today' => now()->format('Y-m-d'),
        ]);
    }

    // Keep the JSON endpoint for any AJAX needs
    public function events(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
        ]);

        $inquiries = Inquiry::with(['performanceType', 'bandSize'])
            ->whereBetween('performance_date', [$request->start, $request->end])
            ->get();

        $events = $inquiries->map(function ($inquiry) {
            $title = $inquiry->location_name ?? 'Unnamed Event';
            
            if ($inquiry->performanceType) {
                $title = $inquiry->performanceType->name . ' - ' . $title;
            }

            $start = $inquiry->performance_date->format('Y-m-d');
            $allDay = true;

            if ($inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact) {
                $timeStr = Carbon::parse($inquiry->performance_time_exact)->format('H:i:s');
                $start = $inquiry->performance_date->format('Y-m-d') . 'T' . $timeStr;
                $allDay = false;
            }

            $event = [
                'id' => $inquiry->id,
                'title' => $title,
                'start' => $start,
                'allDay' => $allDay,
                'backgroundColor' => $this->getStatusColor($inquiry->status),
                'borderColor' => $this->getStatusColor($inquiry->status),
                'extendedProps' => [
                    'inquiry_id' => $inquiry->id,
                    'status' => $inquiry->status,
                    'location' => $inquiry->location_name,
                    'contact' => $inquiry->contact_person,
                    'price' => $inquiry->price_amount,
                    'currency' => $inquiry->currency,
                ],
            ];

            if (!$allDay && $inquiry->duration_minutes) {
                $startTime = Carbon::parse($start);
                $endTime = $startTime->copy()->addMinutes($inquiry->duration_minutes);
                $event['end'] = $endTime->format('Y-m-d\TH:i:s');
            }

            return $event;
        });

        return response()->json($events);
    }

    private function getStatusColor(string $status): string
    {
        return match($status) {
            'confirmed' => '#10b981',
            'pending' => '#f59e0b',
            'rejected' => '#6b7280',
            default => '#3b82f6',
        };
    }
}
