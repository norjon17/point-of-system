<?php

namespace Database\Seeders;

use App\Models\Customer\Customer;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductLocation;
use App\Models\Product\ProductUOM;
use App\Models\Supplier;
use App\Models\Vehicle;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SampleData extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Customer::create([
            'company' => 'Google',
            'address' => 'Laguna lake',
            'contact_person' => 'Mr Krabs'
        ]);
        Customer::create([
            'company' => 'Jollibee',
            'address' => 'Taal lake',
            'contact_person' => 'Mr Puff'
        ]);
        Customer::create([
            'company' => 'KFC',
            'address' => 'Doon sa lake',
            'contact_person' => 'Mrs Patric'
        ]);

        Supplier::create(['company' => 'Microsoft', 'contact_person' => 'Manong Teddy']);
        Supplier::create(['company' => 'Apple', 'contact_person' => 'Mang Juan']);

        ProductUOM::create(['name' => 'Piece', 'abbr' => 'pc']);
        ProductUOM::create(['name' => 'Kilogram', 'abbr' => 'kg']);
        ProductUOM::create(['name' => 'Meter', 'abbr' => 'm']);
        ProductUOM::create(['name' => 'Liter', 'abbr' => 'L']);
        ProductUOM::create(['name' => 'Box', 'abbr' => 'box']);

        ProductLocation::create(['name' => 'Rack 1', 'description' => 'General hardware storage.']);
        ProductLocation::create(['name' => 'Rack 2', 'description' => 'Electrical components storage.']);
        ProductLocation::create(['name' => 'Shelf A', 'description' => 'Small tools and accessories.']);
        ProductLocation::create(['name' => 'Shelf B', 'description' => 'Plumbing fittings storage.']);
        ProductLocation::create(['name' => 'Warehouse', 'description' => 'Bulk product storage.']);

        ProductCategory::create(['name' => 'Lighting', 'description' => 'Includes light bulbs, lamps, and fixtures.']);
        ProductCategory::create(['name' => 'Electrical', 'description' => 'Includes wiring, outlets, and switches.']);
        ProductCategory::create(['name' => 'Woodworks', 'description' => 'Includes wood, plywood, and timber products.']);
        ProductCategory::create(['name' => 'Plumbing', 'description' => 'Includes pipes, faucets, and water fittings.']);
        ProductCategory::create(['name' => 'Tools', 'description' => 'Includes hammers, nails, power tools, and fasteners.']);

        Vehicle::create([
            'type' => 'box truck',
            'plate_num' => '123-456'
        ]);
        Vehicle::create([
            'type' => 'dump truck',
            'plate_num' => '789-101'
        ]);

    }
}
