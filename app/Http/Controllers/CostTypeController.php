<?php

namespace App\Http\Controllers;

use App\Models\CostType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class CostTypeController extends Controller
{
    public function index(): Response
    {
        $costTypes = CostType::withCount(['groupCosts'])
            ->orderBy('name')
            ->get();

        return Inertia::render('CostTypes/Index', [
            'costTypes' => $costTypes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('CostTypes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cost_types,name',
            'is_active' => 'required|boolean',
        ]);

        CostType::create($validated);

        return Redirect::route('cost-types.index')
            ->with('success', 'Cost type created successfully.');
    }

    public function edit(CostType $costType): Response
    {
        $costType->loadCount(['groupCosts']);

        return Inertia::render('CostTypes/Edit', [
            'costType' => $costType,
        ]);
    }

    public function update(Request $request, CostType $costType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cost_types,name,' . $costType->id,
            'is_active' => 'required|boolean',
        ]);

        $costType->update($validated);

        return Redirect::route('cost-types.index')
            ->with('success', 'Cost type updated successfully.');
    }

    public function destroy(CostType $costType)
    {
        // Check if cost type is in use
        if ($costType->groupCosts()->count() > 0) {
            return Redirect::back()
                ->with('error', 'Cannot delete cost type that is in use. Please deactivate it instead.');
        }

        $costType->delete();

        return Redirect::route('cost-types.index')
            ->with('success', 'Cost type deleted successfully.');
    }
}
