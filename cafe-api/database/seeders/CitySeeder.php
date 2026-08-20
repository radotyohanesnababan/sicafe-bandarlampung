<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            [
                'name' => 'Bandar Lampung',
                'slug' => 'bandar-lampung',
                'osm_relation_id' => '103387',
                'lat' => -5.4294,
                'lng' => 105.2628,
            ],
            [
                'name' => 'Bandung',
                'slug' => 'bandung',
                'osm_relation_id' => '103388',
                'lat' => -6.9175,
                'lng' => 107.6191,
            ],
            [
                'name' => 'Jakarta',
                'slug' => 'jakarta',
                'osm_relation_id' => '43848',
                'lat' => -6.2088,
                'lng' => 106.8456,
            ],
            [
                'name' => 'Yogyakarta',
                'slug' => 'yogyakarta',
                'osm_relation_id' => '214349',
                'lat' => -7.7956,
                'lng' => 110.3695,
            ],
            [
                'name' => 'Surabaya',
                'slug' => 'surabaya',
                'osm_relation_id' => '103385',
                'lat' => -7.2575,
                'lng' => 112.7521,
            ],
            [
                'name' => 'Malang',
                'slug' => 'malang',
                'osm_relation_id' => '103401',
                'lat' => -7.9666,
                'lng' => 112.6326,
            ],
            [
                'name' => 'Semarang',
                'slug' => 'semarang',
                'osm_relation_id' => '103386',
                'lat' => -6.9666,
                'lng' => 110.4196,
            ],
            [
                'name' => 'Bali',
                'slug' => 'bali',
                'osm_relation_id' => '114689',
                'lat' => -8.3405,
                'lng' => 115.0920,
            ],
            [
                'name' => 'Solo',
                'slug' => 'solo',
                'osm_relation_id' => '103403',
                'lat' => -7.5755,
                'lng' => 110.8243,
            ],
            [
                'name' => 'Bogor',
                'slug' => 'bogor',
                'osm_relation_id' => '103390',
                'lat' => -6.5944,
                'lng' => 106.7892,
            ],
            [
                'name' => 'Cimahi',
                'slug' => 'cimahi',
                'osm_relation_id' => '80439',
                'lat' => -6.8841,
                'lng' => 107.5348,
            ],
        ];

        foreach ($cities as $city) {
            DB::table('cities')->updateOrInsert(
                ['slug' => $city['slug']],
                array_merge($city, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }
    }
}