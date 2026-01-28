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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_company')->nullable();
            $table->text('client_address')->nullable();
            $table->date('performance_date');
            $table->decimal('total_price', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->enum('status', ['draft', 'sent', 'signed'])->default('draft');
            $table->longText('markdown_snapshot')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('signed_at')->nullable();
            // Audit fields
            $table->string('signer_name')->nullable();
            $table->string('signer_email')->nullable();
            $table->string('signer_company')->nullable();
            $table->text('signer_address')->nullable();
            $table->string('signer_ip')->nullable();
            $table->text('signer_user_agent')->nullable();
            $table->timestamp('consented_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
