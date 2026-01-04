<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Calendar/Index');
    }

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

            // Determine start and end times
            $start = $inquiry->performance_date->format('Y-m-d');
            $allDay = true;

            if ($inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact) {
                // Extract just the time portion from the datetime field
                $timeStr = \Carbon\Carbon::parse($inquiry->performance_time_exact)->format('H:i:s');
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

            // Add end time if we have duration
            if (!$allDay && $inquiry->duration_minutes) {
                $startTime = \Carbon\Carbon::parse($start);
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
            'confirmed' => '#10b981', // green
            'pending' => '#f59e0b',   // amber
            'rejected' => '#6b7280',  // gray
            default => '#3b82f6',     // blue
        };
    }
}
