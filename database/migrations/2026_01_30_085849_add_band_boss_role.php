<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $role = Role::firstOrCreate(['name' => 'BandBoss', 'guard_name' => 'web']);

        $permissions = [
            'inquiries.view',
            'inquiries.create',
            'inquiries.edit',
            'inquiries.change_status',
            'income.view',
            'income.create',
            'income.edit',
            'income.distribute',
            'expenses.view',
            'expenses.create',
            'group_costs.view',
            'group_costs.create',
            'group_costs.edit',
            'contracts.manage',
            'contracts.send',
            'contracts.delete',
            'calendar.integrations.manage',
        ];

        $role->syncPermissions($permissions);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $role = Role::findByName('BandBoss', 'web');
        if ($role) {
            $role->delete();
        }
    }
};
