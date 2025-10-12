<?php

namespace Database\Seeders;

use App\Models\Cash\CashDenomination;
use App\Models\Cash\CashTransaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CashInSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $cashTransaction = CashTransaction::create([
            'user_id' => 1, //default to admin
            'type_id' => 1, // Cash In
        ]);

        $denominations = [1000, 500, 200, 100, 50, 20, 10, 5, 1];
        $randomDenominations = collect($denominations)->random(rand(1, 5)); // Pick 1-5 random denominations

        foreach ($randomDenominations as $denomination) {
            CashDenomination::create([
                'ct_id' => $cashTransaction->id,
                'denomination' => $denomination,
                'quantity' => rand(1, 20), // Random quantity between 1 and 20
            ]);
        }
    }
}
