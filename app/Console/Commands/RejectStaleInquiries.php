<?php

namespace App\Console\Commands;

use App\Models\Inquiry;
use Illuminate\Console\Command;

class RejectStaleInquiries extends Command
{
    protected $signature = 'inquiries:reject-stale';

    protected $description = 'Reject pending inquiries whose performance date was more than 2 days ago';

    public function handle(): int
    {
        $count = Inquiry::pending()
            ->where('performance_date', '<', now()->subDays(2))
            ->update(['status' => 'rejected']);

        $this->info("Rejected {$count} stale pending inquiries.");

        return Command::SUCCESS;
    }
}
