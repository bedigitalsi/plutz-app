<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Restored 2026-11-26: this migration ran on production in February but its file was never committed,
 * so fresh databases (local, tests) were missing these columns. Definitions copied from production.
 * Production already has it in the migrations table, so it does not run there again.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (!Schema::hasColumn('contracts', 'performance_type_id')) {
                $table->foreignId('performance_type_id')->nullable()->constrained('performance_types')->nullOnDelete();
            }
            if (!Schema::hasColumn('contracts', 'band_size_id')) {
                $table->foreignId('band_size_id')->nullable()->constrained('band_sizes')->nullOnDelete();
            }
            if (!Schema::hasColumn('contracts', 'performance_time')) {
                $table->string('performance_time', 20)->nullable();
            }
            if (!Schema::hasColumn('contracts', 'duration_minutes')) {
                $table->integer('duration_minutes')->default(120);
            }
            if (!Schema::hasColumn('contracts', 'location_name')) {
                $table->string('location_name')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'location_address')) {
                $table->string('location_address')->nullable();
            }
            if (!Schema::hasColumn('contracts', 'special_notes')) {
                $table->text('special_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            foreach (['performance_type_id', 'band_size_id'] as $fk) {
                if (Schema::hasColumn('contracts', $fk)) {
                    $table->dropConstrainedForeignId($fk);
                }
            }
            foreach (['performance_time', 'duration_minutes', 'location_name', 'location_address', 'special_notes'] as $col) {
                if (Schema::hasColumn('contracts', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
