<?php

namespace App\Services;

use App\Models\GroupCost;
use App\Models\IncomeDistribution;
use App\Models\Setting;

class MutualFundService
{
    /**
     * Recalculate paid_amount fields using FIFO allocation on unpaid expenses.
     * 
     * Opening balance covers historical items (already set on each expense).
     * New income (from IncomeDistribution) gets allocated FIFO to remaining unpaid expenses.
     */
    public static function recalculate(): array
    {
        $openingBalance = (float) Setting::getString('mutual_fund_opening_balance', '0');

        // Get all income distributions to mutual fund
        $inflows = (float) IncomeDistribution::where('recipient_type', 'mutual_fund')
            ->sum('amount');

        $totalPool = $openingBalance + $inflows;

        // Get all expenses ordered oldest to newest
        $expenses = GroupCost::orderBy('cost_date')->orderBy('id')->get();

        // First pass: figure out what's covered by opening balance
        // (items that were historically marked as paid keep their paid_amount)
        // The opening balance = sum of all historically paid amounts
        
        // For new income, allocate FIFO to expenses not fully covered
        $remaining = $inflows; // Only distribute new income
        $totalAllocated = $openingBalance;
        $totalCosts = 0;

        foreach ($expenses as $expense) {
            $totalCosts += (float) $expense->amount;
            $currentPaid = (float) $expense->paid_amount;
            $needed = (float) $expense->amount - $currentPaid;

            if ($needed <= 0 || $remaining <= 0) {
                continue; // Already fully paid or no money left
            }

            if ($remaining >= $needed) {
                // Fully cover the remaining
                $expense->paid_amount = $expense->amount;
                $expense->is_paid = true;
                $remaining -= $needed;
                $totalAllocated += $needed;
            } else {
                // Partially cover
                $expense->paid_amount = round($currentPaid + $remaining, 2);
                $expense->is_paid = false;
                $totalAllocated += $remaining;
                $remaining = 0;
            }

            $expense->save();
        }

        $balance = $totalPool - $totalCosts;

        return [
            'opening_balance' => $openingBalance,
            'total_inflows' => $inflows,
            'total_pool' => $totalPool,
            'total_costs' => $totalCosts,
            'total_allocated' => $totalAllocated,
            'balance' => $balance,
            'surplus' => max(0, $balance),
            'deficit' => min(0, $balance),
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
