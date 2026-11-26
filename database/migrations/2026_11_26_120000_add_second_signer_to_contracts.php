<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->string('signer2_name')->nullable()->after('signer_address');
            $table->string('signer2_email')->nullable()->after('signer2_name');
            $table->string('signer2_signature_path')->nullable()->after('signer2_email');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['signer2_name', 'signer2_email', 'signer2_signature_path']);
        });
    }
};
