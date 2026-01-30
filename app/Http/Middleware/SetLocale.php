<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = 'en';

        try {
            if ($request->user() && $request->user()->locale) {
                $locale = $request->user()->locale;
            } else {
                $locale = Setting::getString('default_locale', 'en') ?? 'en';
            }
        } catch (\Exception $e) {
            $locale = 'en';
        }

        // Only allow supported locales
        if (!in_array($locale, ['en', 'sl'])) {
            $locale = 'en';
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
