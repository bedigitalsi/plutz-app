<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('income_distributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('income_id')->constrained()->cascadeOnDelete();
            $table->enum('recipient_type', ['user', 'mutual_fund']);
            $table->foreignId('recipient_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->text('note')->nullable();
            $table->timestamps();
            
            // Indexes
            $table->index(['income_id', 'recipient_type', 'recipient_user_id'], 'income_distributions_composite_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('income_distributions');
    }
};
