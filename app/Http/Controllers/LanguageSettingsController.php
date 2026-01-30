<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LanguageSettingsController extends Controller
{
    public function show()
    {
        return Inertia::render('Settings/Language', [
            'settings' => [
                'default_locale' => Setting::getString('default_locale', 'en'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'default_locale' => 'required|string|in:en,sl',
        ]);

        Setting::setString('default_locale', $validated['default_locale']);
        Setting::clearCache();

        return back()->with('success', 'Language settings saved successfully.');
    }
}
