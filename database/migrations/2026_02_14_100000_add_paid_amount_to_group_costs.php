<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_costs', function (Blueprint $table) {
            $table->decimal('paid_amount', 10, 2)->default(0)->after('amount');
        });

        // Set paid_amount = amount for all currently paid items
        DB::table('group_costs')->where('is_paid', true)->update([
            'paid_amount' => DB::raw('amount'),
        ]);
    }

    public function down(): void
    {
        Schema::table('group_costs', function (Blueprint $table) {
            $table->dropColumn('paid_amount');
        });
    }
};
