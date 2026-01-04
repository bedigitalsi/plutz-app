<?php

namespace App\Http\Controllers;

use App\Models\CostType;
use App\Models\GroupCost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class GroupCostController extends Controller
{
    public function index(Request $request): Response
    {
        $query = GroupCost::with(['costType', 'creator'])
            ->orderBy('cost_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('cost_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('cost_date', '<=', $request->date_to);
        }

        if ($request->has('cost_type_id') && $request->cost_type_id !== '') {
            $query->where('cost_type_id', $request->cost_type_id);
        }

        if ($request->has('is_paid')) {
            if ($request->is_paid === 'yes') {
                $query->paid();
            } elseif ($request->is_paid === 'no') {
                $query->unpaid();
            }
        }

        return Inertia::render('GroupCosts/Index', [
            'groupCosts' => $query->paginate(20)->withQueryString(),
            'costTypes' => CostType::where('is_active', true)->get(),
            'filters' => $request->only(['date_from', 'date_to', 'cost_type_id', 'is_paid']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('GroupCosts/Create', [
            'costTypes' => CostType::where('is_active', true)->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'cost_date' => 'nullable|date',
            'cost_type_id' => 'required|exists:cost_types,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'is_paid' => 'required|boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';
        $validated['cost_date'] = $validated['cost_date'] ?? today();

        $groupCost = GroupCost::create($validated);

        return Redirect::route('group-costs.index')
            ->with('success', 'Group cost created successfully.');
    }

    public function edit(GroupCost $groupCost): Response
    {
        return Inertia::render('GroupCosts/Edit', [
            'groupCost' => $groupCost->load(['costType', 'creator']),
            'costTypes' => CostType::where('is_active', true)->get(),
        ]);
    }

    public function update(Request $request, GroupCost $groupCost)
    {
        $validated = $request->validate([
            'cost_date' => 'nullable|date',
            'cost_type_id' => 'required|exists:cost_types,id',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'is_paid' => 'required|boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['currency'] = $validated['currency'] ?? 'EUR';
        $validated['cost_date'] = $validated['cost_date'] ?? today();

        $groupCost->update($validated);

        return Redirect::route('group-costs.index')
            ->with('success', 'Group cost updated successfully.');
    }

    public function destroy(GroupCost $groupCost)
    {
        $groupCost->delete();

        return Redirect::route('group-costs.index')
            ->with('success', 'Group cost deleted successfully.');
    }
}
