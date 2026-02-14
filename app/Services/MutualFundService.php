<?php

namespace App\Services;

use App\Models\GroupCost;
use App\Models\IncomeDistribution;
use App\Models\Setting;

class MutualFundService
{
    /**
     * Recalculate all paid_amount fields using FIFO allocation.
     * 
     * Total pool = opening_balance + all income distributions to mutual_fund
     * Allocate from oldest expense to newest.
     */
    public static function recalculate(): array
    {
        // Get opening balance
        $openingBalance = (float) Setting::getString('mutual_fund_opening_balance', '0');

        // Get all income distributions to mutual fund, ordered by income date
        $inflows = IncomeDistribution::where('recipient_type', 'mutual_fund')
            ->join('incomes', 'income_distributions.income_id', '=', 'incomes.id')
            ->orderBy('incomes.income_date')
            ->orderBy('income_distributions.id')
            ->sum('income_distributions.amount');

        $totalPool = $openingBalance + (float) $inflows;

        // Get all expenses ordered oldest to newest
        $expenses = GroupCost::orderBy('cost_date')->orderBy('id')->get();

        $remaining = $totalPool;
        $totalAllocated = 0;
        $totalCosts = 0;

        foreach ($expenses as $expense) {
            $totalCosts += (float) $expense->amount;

            if ($remaining <= 0) {
                // No money left
                $expense->paid_amount = 0;
                $expense->is_paid = false;
            } elseif ($remaining >= (float) $expense->amount) {
                // Fully covered
                $expense->paid_amount = $expense->amount;
                $expense->is_paid = true;
                $remaining -= (float) $expense->amount;
                $totalAllocated += (float) $expense->amount;
            } else {
                // Partially covered
                $expense->paid_amount = round($remaining, 2);
                $expense->is_paid = false;
                $totalAllocated += $remaining;
                $remaining = 0;
            }

            $expense->save();
        }

        $balance = $totalPool - $totalCosts;
        $surplus = max(0, $balance);
        $deficit = min(0, $balance);

        return [
            'opening_balance' => $openingBalance,
            'total_inflows' => (float) $inflows,
            'total_pool' => $totalPool,
            'total_costs' => $totalCosts,
            'total_allocated' => $totalAllocated,
            'balance' => $balance,
            'surplus' => $surplus,
            'deficit' => $deficit,
        ];
    }

    /**
     * Get current fund stats without recalculating.
     */
    public static function getStats(): array
    {
        $openingBalance = (float) Setting::getString('mutual_fund_opening_balance', '0');

        $inflows = (float) IncomeDistribution::where('recipient_type', 'mutual_fund')
            ->sum('amount');

        $totalPool = $openingBalance + $inflows;

        $totalCosts = (float) GroupCost::sum('amount');
        $totalPaid = (float) GroupCost::sum('paid_amount');
        $totalUnpaid = $totalCosts - $totalPaid;
        $balance = $totalPool - $totalCosts;

        return [
            'opening_balance' => $openingBalance,
            'total_inflows' => $inflows,
            'total_pool' => $totalPool,
            'total_costs' => $totalCosts,
            'total_paid' => $totalPaid,
            'total_unpaid' => $totalUnpaid,
            'balance' => $balance,
            'surplus' => max(0, $balance),
            'deficit' => min(0, $balance),
        ];
    }
}
