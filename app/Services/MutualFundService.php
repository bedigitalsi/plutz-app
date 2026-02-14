<?php

namespace App\Services;

use App\Models\GroupCost;
use App\Models\IncomeDistribution;
use App\Models\Setting;

class MutualFundService
{
    /**
     * Recalculate paid_amount fields using FIFO allocation.
     * 
     * Available = total pool - already allocated.
     * Distribute available amount FIFO to unpaid expenses (oldest first).
     */
    public static function recalculate(): array
    {
        $openingBalance = (float) Setting::getString('mutual_fund_opening_balance', '0');

        $inflows = (float) IncomeDistribution::where('recipient_type', 'mutual_fund')
            ->sum('amount');

        $totalPool = $openingBalance + $inflows;
        $alreadyAllocated = (float) GroupCost::sum('paid_amount');
        $available = $totalPool - $alreadyAllocated;

        if ($available > 0) {
            // Distribute available amount FIFO to unpaid expenses
            $remaining = $available;
            $expenses = GroupCost::where('is_paid', false)
                ->orderBy('cost_date')
                ->orderBy('id')
                ->get();

            foreach ($expenses as $expense) {
                if ($remaining <= 0) break;

                $needed = (float) $expense->amount - (float) $expense->paid_amount;
                if ($needed <= 0) continue;

                if ($remaining >= $needed) {
                    $expense->paid_amount = $expense->amount;
                    $expense->is_paid = true;
                    $remaining -= $needed;
                } else {
                    $expense->paid_amount = round((float) $expense->paid_amount + $remaining, 2);
                    $remaining = 0;
                }

                $expense->save();
            }
        }

        $totalCosts = (float) GroupCost::sum('amount');
        $balance = $totalPool - $totalCosts;

        return [
            'opening_balance' => $openingBalance,
            'total_inflows' => $inflows,
            'total_pool' => $totalPool,
            'total_costs' => $totalCosts,
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
