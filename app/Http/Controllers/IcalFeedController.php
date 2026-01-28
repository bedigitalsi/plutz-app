<?php

namespace App\Http\Controllers;

use App\Models\IcalFeed;
use App\Models\Inquiry;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class IcalFeedController extends Controller
{
    public function index(): Response
    {
        $feeds = IcalFeed::with('creator')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('IcalFeeds/Index', [
            'feeds' => $feeds,
            'baseUrl' => url('/ical'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $tokenData = IcalFeed::generateToken();

        $feed = IcalFeed::create([
            'name' => $validated['name'],
            'token_hash' => $tokenData['hash'],
            'filters' => [], // Can be extended later
            'is_active' => true,
            'created_by' => Auth::id(),
        ]);

        return Redirect::route('ical-feeds.index')
            ->with('success', 'Feed created successfully.')
            ->with('plainToken', $tokenData['plain']); // Show token only once
    }

    public function destroy(IcalFeed $icalFeed)
    {
        $icalFeed->delete();

        return Redirect::route('ical-feeds.index')
            ->with('success', 'Feed deleted successfully.');
    }

    /**
     * Public ICS feed endpoint
     */
    public function show(string $token)
    {
        $feed = IcalFeed::findByToken($token);

        if (!$feed) {
            abort(404, 'Feed not found or inactive');
        }

        // Get confirmed inquiries only
        $inquiries = Inquiry::confirmed()
            ->with(['performanceType'])
            ->orderBy('performance_date', 'asc')
            ->get();

        // Get timezone from settings
        $timezone = Setting::where('key', 'app_timezone')->value('value') ?? 'Europe/Ljubljana';

        // Generate ICS content
        $ics = $this->generateICS($inquiries, $timezone);

        return response($ics)
            ->header('Content-Type', 'text/calendar; charset=utf-8')
            ->header('Content-Disposition', 'inline; filename="plutz-calendar.ics"')
            ->header('Cache-Control', 'max-age=300'); // Cache for 5 minutes
    }

    private function generateICS($inquiries, string $timezone): string
    {
        $lines = [];
        $lines[] = 'BEGIN:VCALENDAR';
        $lines[] = 'VERSION:2.0';
        $lines[] = 'PRODID:-//Plutz//Calendar//EN';
        $lines[] = 'CALSCALE:GREGORIAN';
        $lines[] = 'METHOD:PUBLISH';
        $lines[] = 'X-WR-CALNAME:Plutz Gigs';
        $lines[] = 'X-WR-TIMEZONE:' . $timezone;

        foreach ($inquiries as $inquiry) {
            $uid = 'inquiry-' . $inquiry->id . '@plutz.app';
            $summary = $inquiry->location_name ?? 'Unnamed Event';
            
            if ($inquiry->performanceType) {
                $summary = $inquiry->performanceType->name . ' - ' . $summary;
            }

            $description = '';
            if ($inquiry->contact_person) {
                $description .= 'Contact: ' . $inquiry->contact_person;
            }
            if ($inquiry->price_amount) {
                $description .= '\\nPrice: ' . $inquiry->price_amount . ' ' . $inquiry->currency;
            }

            $location = $inquiry->location_name;
            if ($inquiry->location_address) {
                $location .= ', ' . $inquiry->location_address;
            }

            $lines[] = 'BEGIN:VEVENT';
            $lines[] = 'UID:' . $uid;
            $lines[] = 'DTSTAMP:' . gmdate('Ymd\THis\Z');

            // Handle date/time
            if ($inquiry->performance_time_mode === 'exact_time' && $inquiry->performance_time_exact) {
                // Timed event
                $startDateTime = \Carbon\Carbon::parse($inquiry->performance_date->format('Y-m-d') . ' ' . $inquiry->performance_time_exact, $timezone);
                $lines[] = 'DTSTART;TZID=' . $timezone . ':' . $startDateTime->format('Ymd\THis');
                
                // Calculate end time
                $duration = $inquiry->duration_minutes ?? 120;
                $endDateTime = $startDateTime->copy()->addMinutes($duration);
                $lines[] = 'DTEND;TZID=' . $timezone . ':' . $endDateTime->format('Ymd\THis');
            } else {
                // All-day event
                $lines[] = 'DTSTART;VALUE=DATE:' . $inquiry->performance_date->format('Ymd');
                $lines[] = 'DTEND;VALUE=DATE:' . $inquiry->performance_date->addDay()->format('Ymd');
            }

            $lines[] = 'SUMMARY:' . $this->escapeICS($summary);
            if ($description) {
                $lines[] = 'DESCRIPTION:' . $this->escapeICS($description);
            }
            if ($location) {
                $lines[] = 'LOCATION:' . $this->escapeICS($location);
            }
            $lines[] = 'STATUS:CONFIRMED';
            $lines[] = 'END:VEVENT';
        }

        $lines[] = 'END:VCALENDAR';

        return implode("\r\n", $lines);
    }

    private function escapeICS(string $text): string
    {
        return str_replace([',', ';', "\n"], ['\\,', '\\;', '\\n'], $text);
    }
}
