<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\GroupCost;
use App\Models\Income;
use App\Models\IncomeDistribution;
use App\Models\Inquiry;
use App\Models\User;
use App\Services\MutualFundService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Default to all inquiries (no date filter), or use user-provided filters
        // This ensures we don't miss inquiries from previous year boundaries
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Build inquiry query with optional date filters
        $inquiryQuery = Inquiry::query();
        if ($dateFrom) {
            $inquiryQuery->whereDate('performance_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $inquiryQuery->whereDate('performance_date', '<=', $dateTo);
        }

        // Inquiry stats
        $inquiryStats = [
            'total' => (clone $inquiryQuery)->count(),
            'pending' => (clone $inquiryQuery)->pending()->count(),
            'confirmed' => (clone $inquiryQuery)->confirmed()->count(),
            'rejected' => (clone $inquiryQuery)->rejected()->count(),
        ];

        $inquiryTotals = [
            'total' => (clone $inquiryQuery)->sum('price_amount'),
            'pending' => (clone $inquiryQuery)->pending()->sum('price_amount'),
            'confirmed' => (clone $inquiryQuery)->confirmed()->sum('price_amount'),
            'rejected' => (clone $inquiryQuery)->rejected()->sum('price_amount'),
        ];

        // Income stats (only for users with income.view permission)
        $canViewIncome = Auth::user()->can('income.view');
        $incomeStats = ['total' => 0, 'with_invoice' => 0, 'without_invoice' => 0, 'count' => 0];

        if ($canViewIncome) {
            $incomeQuery = Income::query();
            if ($dateFrom) {
                $incomeQuery->whereDate('income_date', '>=', $dateFrom);
            }
            if ($dateTo) {
                $incomeQuery->whereDate('income_date', '<=', $dateTo);
            }

            $incomeStats = [
                'total' => (clone $incomeQuery)->sum('amount'),
                'with_invoice' => (clone $incomeQuery)->where('invoice_issued', true)->sum('amount'),
                'without_invoice' => (clone $incomeQuery)->where('invoice_issued', false)->sum('amount'),
                'count' => (clone $incomeQuery)->count(),
            ];
        }

        // Build expense query with optional date filters
        $expenseQuery = Expense::query();
        if ($dateFrom) {
            $expenseQuery->whereDate('invoice_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $expenseQuery->whereDate('invoice_date', '<=', $dateTo);
        }

        // Expense stats
        $expenseStats = [
            'total' => (clone $expenseQuery)->sum('amount'),
            'count' => (clone $expenseQuery)->count(),
        ];

        // Mutual fund calculation (uses FIFO service)
        $fundStats = MutualFundService::getStats();
        $mutualFundBalance = $fundStats['balance'];

        // Build group cost query with optional date filters
        $groupCostQuery = GroupCost::query();
        if ($dateFrom) {
            $groupCostQuery->whereDate('cost_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $groupCostQuery->whereDate('cost_date', '<=', $dateTo);
        }

        // Group costs stats
        $groupCostStats = [
            'paid' => (clone $groupCostQuery)->paid()->sum('amount'),
            'unpaid' => (clone $groupCostQuery)->unpaid()->sum('amount'),
            'count' => (clone $groupCostQuery)->count(),
        ];

        // User-specific stats (if band member)
        $userStats = null;
        if (Auth::user()->is_band_member) {
            $userDistributionQuery = IncomeDistribution::where('recipient_type', 'user')
                ->where('recipient_user_id', Auth::id())
                ->whereHas('income', function ($query) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $query->whereDate('income_date', '>=', $dateFrom);
                    }
                    if ($dateTo) {
                        $query->whereDate('income_date', '<=', $dateTo);
                    }
                });

            $userStats = [
                'total_received' => (clone $userDistributionQuery)->sum('amount'),
            ];

            // Monthly breakdown for user
            // Use database-agnostic date formatting
            $dateFormatSql = DB::getDriverName() === 'sqlite' 
                ? "strftime('%Y-%m', incomes.income_date)"
                : "DATE_FORMAT(incomes.income_date, '%Y-%m')";
            
            $monthlyQuery = IncomeDistribution::where('recipient_type', 'user')
                ->where('recipient_user_id', Auth::id())
                ->whereHas('income', function ($query) use ($dateFrom, $dateTo) {
                    if ($dateFrom) {
                        $query->whereDate('income_date', '>=', $dateFrom);
                    }
                    if ($dateTo) {
                        $query->whereDate('income_date', '<=', $dateTo);
                    }
                })
                ->join('incomes', 'income_distributions.income_id', '=', 'incomes.id')
                ->select(
                    DB::raw($dateFormatSql . ' as month'),
                    DB::raw('SUM(income_distributions.amount) as total')
                )
                ->groupBy('month')
                ->orderBy('month');

            $userStats['monthly'] = $monthlyQuery->get();
        }

        // Member breakdown (BandBoss only)
        $memberBreakdown = null;
        if (Auth::user()->hasRole('BandBoss') || Auth::user()->hasRole('Admin')) {
            $bandMembers = User::where('is_band_member', true)->get();
            $memberBreakdown = $bandMembers->map(function ($member) use ($dateFrom, $dateTo) {
                // Total distributed to this user
                $distQuery = IncomeDistribution::where('recipient_type', 'user')
                    ->where('recipient_user_id', $member->id)
                    ->whereHas('income', function ($q) use ($dateFrom, $dateTo) {
                        if ($dateFrom) $q->whereDate('income_date', '>=', $dateFrom);
                        if ($dateTo) $q->whereDate('income_date', '<=', $dateTo);
                    });

                // Distributed from invoiced incomes only
                $invoicedDistQuery = IncomeDistribution::where('recipient_type', 'user')
                    ->where('recipient_user_id', $member->id)
                    ->whereHas('income', function ($q) use ($dateFrom, $dateTo) {
                        $q->where('invoice_issued', true);
                        if ($dateFrom) $q->whereDate('income_date', '>=', $dateFrom);
                        if ($dateTo) $q->whereDate('income_date', '<=', $dateTo);
                    });

                // Expenses added by this user
                $expQuery = Expense::where('created_by', $member->id);
                if ($dateFrom) $expQuery->whereDate('invoice_date', '>=', $dateFrom);
                if ($dateTo) $expQuery->whereDate('invoice_date', '<=', $dateTo);

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'total_distributed' => (float) (clone $distQuery)->sum('amount'),
                    'invoiced_distributed' => (float) (clone $invoicedDistQuery)->sum('amount'),
                    'total_expenses' => (float) $expQuery->sum('amount'),
                ];
            })->values()->toArray();
        }

        // Upcoming gigs (confirmed inquiries with future performance dates)
        $upcomingGigs = Inquiry::with(['performanceType', 'bandMembers:id,name'])
            ->visibleTo(auth()->user())
            ->where('status', '!=', 'rejected')
            ->where('performance_date', '>=', now()->toDateString())
            ->orderBy('performance_date', 'asc')
            ->limit(8)
            ->get();

        // Recent activities
        $recentInquiries = Inquiry::with(['performanceType', 'bandMembers:id,name'])
            ->visibleTo(auth()->user())
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recentIncomes = Income::with(['performanceType', 'inquiry'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Dashboard', [
            'inquiryStats' => $inquiryStats,
            'inquiryTotals' => $inquiryTotals,
            'incomeStats' => $incomeStats,
            'expenseStats' => $expenseStats,
            'mutualFund' => [
                'inflow' => $fundStats['total_pool'],
                'outflow' => $fundStats['total_costs'],
                'balance' => $mutualFundBalance,
                'total_paid' => $fundStats['total_paid'],
                'total_unpaid' => $fundStats['total_unpaid'],
            ],
            'groupCostStats' => $groupCostStats,
            'userStats' => $userStats,
            'memberBreakdown' => $memberBreakdown,
            'upcomingGigs' => $upcomingGigs,
            'recentInquiries' => $recentInquiries,
            'recentIncomes' => $recentIncomes,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }
}
