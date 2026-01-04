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
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->date('performance_date');
            $table->enum('performance_time_mode', ['exact_time', 'text_time']);
            $table->time('performance_time_exact')->nullable();
            $table->string('performance_time_text')->nullable();
            $table->integer('duration_minutes')->default(120);
            $table->string('location_name');
            $table->string('location_address')->nullable();
            $table->string('contact_person');
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->foreignId('performance_type_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['pending', 'confirmed', 'rejected'])->default('pending');
            $table->foreignId('band_size_id')->constrained()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->decimal('price_amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('EUR');
            $table->timestamp('received_at');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes for performance
            $table->index(['performance_date', 'status']);
            $table->index('performance_type_id');
            $table->index('band_size_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
