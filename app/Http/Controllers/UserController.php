<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with('roles')
            ->orderBy('name')
            ->paginate(20);

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        $roles = Role::all();

        return Inertia::render('Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'is_band_member' => 'required|boolean',
            'hide_prices' => 'boolean',
            'role' => 'required|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_band_member' => $validated['is_band_member'],
            'hide_prices' => $validated['hide_prices'] ?? false,
        ]);

        $user->assignRole($validated['role']);

        return Redirect::route('users.index')
            ->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        $roles = Role::all();

        return Inertia::render('Users/Edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'is_band_member' => 'required|boolean',
            'hide_prices' => 'boolean',
            'role' => 'required|exists:roles,name',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'is_band_member' => $validated['is_band_member'],
            'hide_prices' => $validated['hide_prices'] ?? false,
        ]);

        if (!empty($validated['password'])) {
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);
        }

        // Sync role
        $user->syncRoles([$validated['role']]);

        return Redirect::route('users.index')
            ->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return Redirect::back()
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return Redirect::route('users.index')
            ->with('success', 'User deleted successfully.');
    }
}
