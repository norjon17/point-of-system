<?php

namespace Database\Seeders;

use App\Models\Product\ProductCategory;
use App\Models\Product\ProductCategorySub;
use Faker\Factory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CatSubSample extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $run = 0;
        while ($run < 10) {

            $cat = ProductCategory::inRandomOrder()->first();

            $faker = Factory::create();

            $name = $faker->word();
            $desc = $faker->paragraph();
            ProductCategorySub::create([
                'cat_id' => $cat->id,
                'name' => $name,
                'description' => $desc
            ]);

            $run++;
        }
    }
}
