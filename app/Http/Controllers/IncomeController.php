<?php

namespace App\Http\Controllers;

use App\Models\Income;
use App\Models\IncomeDistribution;
use App\Models\Inquiry;
use App\Models\PerformanceType;
use App\Models\User;
use App\Services\MutualFundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class IncomeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Income::with(['performanceType', 'inquiry', 'creator', 'distributions'])
            ->orderBy('income_date', 'desc');

        if ($request->has('date_from')) {
            $query->where('income_date', '>=', $request->date_from);
        }
        
        if ($request->has('date_to')) {
            $query->where('income_date', '<=', $request->date_to);
        }

        if ($request->has('performance_type_id') && $request->performance_type_id !== '') {
            $query->where('performance_type_id', $request->performance_type_id);
        }

        if ($request->has('has_inquiry')) {
            if ($request->has_inquiry === 'yes') {
                $query->whereNotNull('inquiry_id');
            } elseif ($request->has_inquiry === 'no') {
                $query->whereNull('inquiry_id');
            }
        }

        if ($request->has('invoice_issued')) {
            $query->where('invoice_issued', $request->invoice_issued === 'yes');
        }

        return Inertia::render('Incomes/Index', [
            'incomes' => $query->paginate(20)->withQueryString(),
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'filters' => $request->only(['date_from', 'date_to', 'performance_type_id', 'has_inquiry', 'invoice_issued']),
        ]);
    }

    public function create(Request $request): Response
    {
        $inquiry = null;
        
        // Pre-fill from inquiry if provided
        if ($request->has('inquiry_id')) {
            $inquiry = Inquiry::with(['performanceType', 'bandSize'])->find($request->inquiry_id);
        }

        return Inertia::render('Incomes/Create', [
            'performanceTypes' => PerformanceType::where('is_active', true)->get(),
            'inquiry' => $inquiry,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'income_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'invoice_issued' => 'required|boolean',
            'performance_type_id' => 'required|exists:performance_types,id',
            'contact_person' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'inquiry_id' => 'nullable|exists:inquiries,id',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['currency'] = $validated['currency'] ?? 'EUR';

        $income = Income::create($validated);

        return Redirect::route('incomes.show', $income->id)
            ->with('success', 'Income created successfully. Now distribute it to band members.');
    }

    public function show(Income $income): Response
    {
        $income->load(['performanceType', 'inquiry', 'creator', 'distributions.recipientUser']);

        // Get all band members for distribution
        $bandMembers = User::where('is_band_member', true)->get();

        return Inertia::render('Incomes/Show', [
            'income' => $income,
            'bandMembers' => $bandMembers,
            'totalDistributed' => $income->getTotalDistributed(),
            'remaining' => $income->getRemainingToDistribute(),
        ]);
    }

    public function destroy(Income $income)
    {
        $hadFundDistribution = $income->distributions()
            ->where('recipient_type', 'mutual_fund')->exists();

        // Delete distributions first
        $income->distributions()->delete();
        $income->delete();

        // Recalculate mutual fund if it was affected
        if ($hadFundDistribution) {
            MutualFundService::recalculate();
        }

        return Redirect::route('incomes.index')
            ->with('success', 'Income deleted successfully.');
    }

    public function distribute(Request $request, Income $income)
    {
        $validated = $request->validate([
            'distributions' => 'required|array|min:1',
            'distributions.*.recipient_type' => 'required|in:user,mutual_fund',
            'distributions.*.recipient_user_id' => 'nullable|required_if:distributions.*.recipient_type,user|exists:users,id',
            'distributions.*.amount' => 'required|numeric|min:0',
            'distributions.*.note' => 'nullable|string|max:255',
        ]);

        // Validate total doesn't exceed income amount
        $total = collect($validated['distributions'])->sum('amount');
        if ($total > $income->amount) {
            return Redirect::back()->withErrors([
                'distributions' => 'Total distribution amount cannot exceed income amount.'
            ]);
        }

        DB::transaction(function () use ($income, $validated) {
            // Delete existing distributions
            $income->distributions()->delete();

            // Create new distributions
            foreach ($validated['distributions'] as $distribution) {
                IncomeDistribution::create([
                    'income_id' => $income->id,
                    'recipient_type' => $distribution['recipient_type'],
                    'recipient_user_id' => $distribution['recipient_user_id'] ?? null,
                    'amount' => $distribution['amount'],
                    'note' => $distribution['note'] ?? null,
                ]);
            }
        });

        // Recalculate mutual fund if any distribution goes to the fund
        $hasFundDistribution = collect($validated['distributions'])
            ->contains('recipient_type', 'mutual_fund');
        if ($hasFundDistribution) {
            MutualFundService::recalculate();
        }

        return Redirect::route('incomes.show', $income->id)
            ->with('success', 'Income distributed successfully.');
    }
}
