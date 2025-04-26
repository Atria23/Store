<?php

// namespace Database\Seeders;

// use App\Models\User;
// use Illuminate\Database\Seeder;
// use Spatie\Permission\Models\Role;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

// class UserTableSeeder extends Seeder
// {
//     /**
//      * Run the database seeds.
//      */
//     public function run(): void
//     {
//         // get admin role
//         $role = Role::where('name', 'super-admin')->first();

//         // create new admin
//         $user = User::create([
//             'name' => 'Iwak Darat',
//             'email' => 'muvausastore1@gmail.com',
//             'password' => bcrypt('5yaaslinyaduwa'),
//         ]);

//         // assign a role to user
//         $user->assignRole($role);
//     }
// }



namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class UserTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert(
            collect(range(1, 50))->map(function ($i) {
                $name = 'User ' . $i;
                $username = 'user' . $i;
                $email = 'user' . $i . '@example.com';
                return [
                    'name' => $name,
                    'email' => $email,
                    'email_verified_at' => now(),
                    'password' => Hash::make('password'), // default password
                    'avatar' => null,
                    'remember_token' => Str::random(10),
                    'created_at' => Carbon::now()->subDays(rand(0, 30)),
                    'updated_at' => Carbon::now(),
                    'username' => $username,
                    'phone_number' => '08' . rand(1000000000, 9999999999),
                    'profile_image' => null,
                    'pin' => rand(100000, 999999),
                    'balance' => rand(5000, 500000),
                    'membership_status' => collect(['reguler', 'bronze'])->random(),
                    'points' => rand(0, 100),
                    'referral_code' => strtoupper(Str::random(8)),
                ];
            })->toArray()
        );
    }
}
