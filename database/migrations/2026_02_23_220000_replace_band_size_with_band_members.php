<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create pivot table
        Schema::create('inquiry_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inquiry_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['inquiry_id', 'user_id']);
        });

        // Migrate existing data based on band_size_id
        // User IDs: 2=Simona, 4=Leja, 5=Gašper, 6=Aljaž, 7=Jaka
        $mapping = [
            1 => [2],              // Solo → Simona
            2 => [2, 4],           // 2 people → Simona, Leja
            3 => [2, 4, 5],        // 3 people → Simona, Leja, Gašper
            4 => [2, 4, 5, 6],     // 4 people → Simona, Leja, Gašper, Aljaž
            5 => [2, 4, 5, 6, 7],  // 5 people → Simona, Leja, Gašper, Aljaž, Jaka
        ];

        $inquiries = DB::table('inquiries')->select('id', 'band_size_id')->get();
        $now = now();

        foreach ($inquiries as $inquiry) {
            $userIds = $mapping[$inquiry->band_size_id] ?? [2]; // fallback to Simona
            $rows = array_map(fn($uid) => [
                'inquiry_id' => $inquiry->id,
                'user_id' => $uid,
                'created_at' => $now,
                'updated_at' => $now,
            ], $userIds);
            DB::table('inquiry_user')->insert($rows);
        }

        // Drop the old band_size_id column
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropForeign(['band_size_id']);
            $table->dropColumn('band_size_id');
        });
    }

    public function down(): void
    {
        // Re-add band_size_id
        Schema::table('inquiries', function (Blueprint $table) {
            $table->foreignId('band_size_id')->default(3)->constrained()->cascadeOnDelete();
        });

        // Reverse: count pivot entries to determine band_size_id
        $inquiries = DB::table('inquiry_user')
            ->select('inquiry_id', DB::raw('COUNT(*) as member_count'))
            ->groupBy('inquiry_id')
            ->get();

        foreach ($inquiries as $row) {
            $sizeId = min($row->member_count, 5);
            DB::table('inquiries')->where('id', $row->inquiry_id)->update(['band_size_id' => $sizeId]);
        }

        Schema::dropIfExists('inquiry_user');
    }
};
