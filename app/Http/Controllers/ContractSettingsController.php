<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContractSettingsController extends Controller
{
    public function show()
    {
        return Inertia::render('Settings/Contracts', [
            'settings' => [
                'plutz_address' => Setting::getString('plutz_address', ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'plutz_address' => 'nullable|string|max:2000',
        ]);

        Setting::setString('plutz_address', $validated['plutz_address'] ?? null);
        Setting::clearCache();

        return back()->with('success', 'Contract settings saved successfully.');
    }
}

