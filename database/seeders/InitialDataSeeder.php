<?php

namespace Database\Seeders;

use App\Models\BandSize;
use App\Models\ContractTemplate;
use App\Models\CostType;
use App\Models\PerformanceType;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InitialDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
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
            'settings.manage',
            'users.manage',
            'calendar.integrations.manage',
            'contracts.manage',
            'contracts.send',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $bandBossRole = Role::firstOrCreate(['name' => 'BandBoss', 'guard_name' => 'web']);
        $bandMemberRole = Role::firstOrCreate(['name' => 'BandMember', 'guard_name' => 'web']);
        $viewerRole = Role::firstOrCreate(['name' => 'Viewer', 'guard_name' => 'web']);

        // Assign all permissions to Admin
        $adminRole->givePermissionTo(Permission::all());

        // BandBoss permissions - same as Admin (all permissions)
        $bandBossRole->givePermissionTo(Permission::all());

        // Band member permissions
        $bandMemberRole->givePermissionTo([
            'inquiries.view',
            'inquiries.create',
            'inquiries.edit',
            'income.view',
            'expenses.view',
            'expenses.create',
            'group_costs.view',
        ]);

        // Viewer permissions
        $viewerRole->givePermissionTo([
            'inquiries.view',
            'income.view',
            'expenses.view',
            'group_costs.view',
        ]);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@plutz.app'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'is_band_member' => false,
            ]
        );
        $admin->assignRole('Admin');

        // Create settings
        Setting::firstOrCreate(['key' => 'app_timezone'], [
            'value' => 'Europe/Ljubljana',
            'type' => 'string',
        ]);

        Setting::firstOrCreate(['key' => 'default_duration_minutes'], [
            'value' => '120',
            'type' => 'integer',
        ]);

        // Email settings (with default values matching screenshot)
        Setting::firstOrCreate(['key' => 'mail_from_address'], [
            'value' => 'info@plutzband.com',
            'type' => 'string',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_from_name'], [
            'value' => 'Plutz',
            'type' => 'string',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_force_from'], [
            'value' => '1',
            'type' => 'boolean',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_force_from_name'], [
            'value' => '1',
            'type' => 'boolean',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_set_return_path'], [
            'value' => '1',
            'type' => 'boolean',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_host'], [
            'value' => 'mail.plutzband.com',
            'type' => 'string',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_port'], [
            'value' => '465',
            'type' => 'integer',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_encryption'], [
            'value' => 'ssl',
            'type' => 'string',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_auto_tls'], [
            'value' => '1',
            'type' => 'boolean',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_auth_enabled'], [
            'value' => '1',
            'type' => 'boolean',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_username'], [
            'value' => 'info@plutzband.com',
            'type' => 'string',
        ]);
        
        // Password will be set manually via settings page
        Setting::firstOrCreate(['key' => 'mail_password'], [
            'value' => '',
            'type' => 'string',
        ]);
        
        Setting::firstOrCreate(['key' => 'mail_admin_recipient'], [
            'value' => 'admin@plutz.app',
            'type' => 'string',
        ]);

        Setting::firstOrCreate(['key' => 'plutz_address'], [
            'value' => 'Plutz Band, Example Street 123, 1000 Ljubljana, Slovenia',
            'type' => 'string',
        ]);

        // Create performance types
        $performanceTypes = ['Wedding', 'Concert', 'Birthday Party', 'Corporate Event', 'Private Event'];
        foreach ($performanceTypes as $type) {
            PerformanceType::firstOrCreate(['name' => $type]);
        }

        // Create band sizes
        $bandSizes = [
            ['label' => 'Solo', 'order' => 1],
            ['label' => '2 people', 'order' => 2],
            ['label' => '3 people', 'order' => 3],
            ['label' => '4 people', 'order' => 4],
            ['label' => '5 people', 'order' => 5],
        ];
        foreach ($bandSizes as $size) {
            BandSize::firstOrCreate($size);
        }

        // Create cost types
        $costTypes = ['Fuel', 'Equipment', 'Marketing', 'Rehearsal Room', 'Maintenance'];
        foreach ($costTypes as $type) {
            CostType::firstOrCreate(['name' => $type]);
        }

        // Create default contract template
        ContractTemplate::firstOrCreate(
            ['name' => 'Default Contract'],
            [
                'markdown' => $this->getDefaultContractMarkdown(),
                'is_active' => true,
            ]
        );
    }

    private function getDefaultContractMarkdown(): string
    {
        return <<<'MD'
# POGODBA O NAJEMU GLASBENE SKUPINE

## Naročnik
**Ime:** [NAROČNIK]  
**Email:** [EMAIL]  
**Podjetje:** [PODJETJE]  
**Naslov:** [NASLOV]

## Izvajalec
**Ime:** Plutz  
**Naslov:** [PLUTZ_ADDRESS]

## Pogoji nastopa
**Datum nastopa:** [DATUM_NASTOPA]  
**Skupni znesek:** [SKUPNI_ZNESEK] EUR  
**Avans:** [AVANS] EUR

## Splošni pogoji
1. Naročnik se zavezuje plačati skupni znesek najpozneje do datuma nastopa.
2. Avans se plača ob podpisu pogodbe.
3. Izvajalec zagotavlja profesionalno izvedbo storitve.
4. V primeru odpovedi s strani naročnika manj kot 14 dni pred nastopom, se avans ne vrne.

## Podpis
S podpisom te pogodbe se naročnik strinja z vsemi zgoraj navedenimi pogoji.
MD;
    }
}
