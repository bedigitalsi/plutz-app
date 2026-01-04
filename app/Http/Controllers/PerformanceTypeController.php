<?php

namespace App\Http\Controllers;

use App\Models\PerformanceType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceTypeController extends Controller
{
    public function index(): Response
    {
        $performanceTypes = PerformanceType::withCount(['inquiries', 'incomes'])
            ->orderBy('name')
            ->get();

        return Inertia::render('PerformanceTypes/Index', [
            'performanceTypes' => $performanceTypes,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('PerformanceTypes/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:performance_types,name',
            'is_active' => 'required|boolean',
        ]);

        PerformanceType::create($validated);

        return Redirect::route('performance-types.index')
            ->with('success', 'Performance type created successfully.');
    }

    public function edit(PerformanceType $performanceType): Response
    {
        $performanceType->loadCount(['inquiries', 'incomes']);

        return Inertia::render('PerformanceTypes/Edit', [
            'performanceType' => $performanceType,
        ]);
    }

    public function update(Request $request, PerformanceType $performanceType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:performance_types,name,' . $performanceType->id,
            'is_active' => 'required|boolean',
        ]);

        $performanceType->update($validated);

        return Redirect::route('performance-types.index')
            ->with('success', 'Performance type updated successfully.');
    }

    public function destroy(PerformanceType $performanceType)
    {
        // Check if performance type is in use
        if ($performanceType->inquiries()->count() > 0 || $performanceType->incomes()->count() > 0) {
            return Redirect::back()
                ->with('error', 'Cannot delete performance type that is in use. Please deactivate it instead.');
        }

        $performanceType->delete();

        return Redirect::route('performance-types.index')
            ->with('success', 'Performance type deleted successfully.');
    }
}
