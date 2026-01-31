<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ApiKeyController extends Controller
{
    /**
     * Available abilities for API tokens.
     * Extend this array when adding new API resources.
     */
    private array $availableAbilities = [
        'inquiries.view',
        'inquiries.create',
        'inquiries.edit',
        'inquiries.change_status',
    ];

    public function index(): Response
    {
        $tokens = Auth::user()->tokens()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'abilities' => $token->abilities,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
            ]);

        return Inertia::render('Settings/ApiKeys', [
            'tokens' => $tokens,
            'availableAbilities' => $this->availableAbilities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'abilities' => 'required|array|min:1',
            'abilities.*' => 'string|in:' . implode(',', $this->availableAbilities),
        ]);

        $user = Auth::user();

        // Only allow abilities that the user actually has via Spatie
        $abilities = array_filter($validated['abilities'], fn ($ability) => $user->hasPermissionTo($ability));

        if (empty($abilities)) {
            return back()->withErrors(['abilities' => 'You do not have any of the selected permissions.']);
        }

        $token = $user->createToken($validated['name'], array_values($abilities));

        return Redirect::route('settings.api-keys')
            ->with('success', 'API key created successfully.')
            ->with('plainToken', $token->plainTextToken);
    }

    public function destroy($tokenId)
    {
        Auth::user()->tokens()->where('id', $tokenId)->delete();

        return Redirect::route('settings.api-keys')
            ->with('success', 'API key revoked successfully.');
    }
}
