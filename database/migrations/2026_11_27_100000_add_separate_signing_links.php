<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // New status between 'sent' and 'signed'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE contracts MODIFY status ENUM('draft','sent','partially_signed','signed') NOT NULL DEFAULT 'draft'");
        }

        Schema::table('contracts', function (Blueprint $table) {
            // When true, EVERY recipient must sign via their own link before the contract is signed.
            $table->boolean('require_all_signatures')->default(false)->after('status');
        });

        Schema::table('contract_sign_tokens', function (Blueprint $table) {
            $table->string('signer_name')->nullable()->after('used_at');
            $table->string('signer_email')->nullable()->after('signer_name');
            $table->string('signer_company')->nullable()->after('signer_email');
            $table->text('signer_address')->nullable()->after('signer_company');
            $table->string('signature_path')->nullable()->after('signer_address');
            $table->string('signer_ip', 45)->nullable()->after('signature_path');
            $table->text('signer_user_agent')->nullable()->after('signer_ip');
        });
    }

    public function down(): void
    {
        Schema::table('contract_sign_tokens', function (Blueprint $table) {
            $table->dropColumn(['signer_name', 'signer_email', 'signer_company', 'signer_address', 'signature_path', 'signer_ip', 'signer_user_agent']);
        });

        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn('require_all_signatures');
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE contracts SET status = 'sent' WHERE status = 'partially_signed'");
            DB::statement("ALTER TABLE contracts MODIFY status ENUM('draft','sent','signed') NOT NULL DEFAULT 'draft'");
        }
    }
};
