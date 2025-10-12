<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer\Customer;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Customer::insert([
            [
                'id' => 1,
                'company' => 'Tech Solutions Inc.',
                'contact_person' => 'John Doe',
                'address' => '123 Tech Street, Silicon Valley, CA',
            ],
            [
                'id' => 2,
                'company' => 'Innovatech Ltd.',
                'contact_person' => 'Jane Smith',
                'address' => '456 Innovation Road, Austin, TX',
            ],
            [
                'id' => 3,
                'company' => 'Future Enterprises',
                'contact_person' => 'Alice Johnson',
                'address' => '789 Future Lane, Seattle, WA',
            ],
        ]);
    }
}
