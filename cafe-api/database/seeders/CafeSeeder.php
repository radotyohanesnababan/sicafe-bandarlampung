<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CafeSeeder extends Seeder
{
    public function run(): void
    {
        $cities = DB::table('cities')->pluck('id', 'slug');

        $cafes = [
            // Bandung
            [
                'city_slug' => 'bandung',
                'osm_id' => '4278486231',
                'osm_type' => 'node',
                'name' => 'Kopi Anji Dago',
                'slug' => 'kop-anji-dago-bandung',
                'lat' => -6.8831,
                'lng' => 107.6092,
                'address' => 'Jl. Dago No.15, Bandung',
                'phone' => '022-2531234',
                'opening_hours' => 'Mo-Su 08:00-22:00',
                'category' => 'cafe',
                'price_level' => 2,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'bandung',
                'osm_id' => '5278486232',
                'osm_type' => 'node',
                'name' => 'Java Coffee Cihampelas',
                'slug' => 'java-coffee-cihampelas-bandung',
                'lat' => -6.8910,
                'lng' => 107.6137,
                'address' => 'Jl. Cihampelas No.220, Bandung',
                'opening_hours' => 'Mo-Fr 07:00-21:00; Sa-Su 08:00-22:00',
                'category' => 'coffee_shop',
                'price_level' => 2,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'bandung',
                'osm_id' => null,
                'osm_type' => null,
                'name' => 'Common Grounds Bandung',
                'slug' => 'common-grounds-bandung',
                'lat' => -6.8925,
                'lng' => 107.6148,
                'address' => 'Jl. R.E. Martadinata No.25, Bandung',
                'category' => 'coffee_shop',
                'price_level' => 3,
                'source' => 'manual',
                'description' => 'Specialty coffee shop dengan desain industrial. Tersedia single origin dari berbagai daerah.',
            ],
            // Jakarta
            [
                'city_slug' => 'jakarta',
                'osm_id' => '6278486233',
                'osm_type' => 'node',
                'name' => 'Tanamera Coffee Thamrin',
                'slug' => 'tanamera-coffee-thamrin-jakarta',
                'lat' => -6.1891,
                'lng' => 106.8227,
                'address' => 'Jl. MH Thamrin, Jakarta Pusat',
                'opening_hours' => 'Mo-Su 07:00-22:00',
                'category' => 'coffee_shop',
                'price_level' => 3,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'jakarta',
                'osm_id' => '7278486234',
                'osm_type' => 'node',
                'name' => 'Kopi 78 Senopati',
                'slug' => 'kopi-78-senopati-jakarta',
                'lat' => -6.2448,
                'lng' => 106.7992,
                'address' => 'Jl. Senopati No.78, Jakarta Selatan',
                'opening_hours' => 'Mo-Su 10:00-23:00',
                'category' => 'cafe',
                'price_level' => 3,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'jakarta',
                'osm_id' => null,
                'osm_type' => null,
                'name' => 'Koultoura Coffee',
                'slug' => 'koultoura-coffee-jakarta',
                'lat' => -6.2380,
                'lng' => 106.8298,
                'address' => 'Jl. Cikini Raya No.45, Jakarta Pusat',
                'category' => 'coffee_shop',
                'price_level' => 3,
                'source' => 'manual',
                'description' => 'Third wave coffee dengan roastery sendiri.',
            ],
            // Yogyakarta
            [
                'city_slug' => 'yogyakarta',
                'osm_id' => '8278486235',
                'osm_type' => 'node',
                'name' => 'Kopi Jogja Tugu',
                'slug' => 'kopi-jogja-tugu',
                'lat' => -7.7927,
                'lng' => 110.3659,
                'address' => 'Jl. Jend. Sudirman, Yogyakarta',
                'opening_hours' => 'Mo-Su 08:00-22:00',
                'category' => 'cafe',
                'price_level' => 1,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'yogyakarta',
                'osm_id' => '9278486236',
                'osm_type' => 'way',
                'name' => 'Escalade Coffee',
                'slug' => 'escalade-coffee-yogyakarta',
                'lat' => -7.8015,
                'lng' => 110.3713,
                'address' => 'Jl. Prawirotaman, Yogyakarta',
                'category' => 'coffee_shop',
                'price_level' => 2,
                'source' => 'osm',
            ],
            // Surabaya
            [
                'city_slug' => 'surabaya',
                'osm_id' => '10278486237',
                'osm_type' => 'node',
                'name' => 'Kopi Aroma',
                'slug' => 'kopi-aroma-surabaya',
                'lat' => -7.2520,
                'lng' => 112.7395,
                'address' => 'Jl. Serayu No.12, Surabaya',
                'opening_hours' => 'Mo-Su 08:00-21:00',
                'category' => 'cafe',
                'price_level' => 2,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'surabaya',
                'osm_id' => null,
                'osm_type' => null,
                'name' => 'Three Fols Coffee',
                'slug' => 'three-fols-coffee-surabaya',
                'lat' => -7.2671,
                'lng' => 112.7528,
                'address' => 'Jl. Raya Darmo No.65, Surabaya',
                'category' => 'coffee_shop',
                'price_level' => 2,
                'source' => 'manual',
                'description' => 'Coffee shop dengan home roaster.',
            ],
            // Malang
            [
                'city_slug' => 'malang',
                'osm_id' => '11278486238',
                'osm_type' => 'node',
                'name' => 'Gran Caffe & Resto',
                'slug' => 'gran-caffe-resto-malang',
                'lat' => -7.9633,
                'lng' => 112.6268,
                'address' => 'Jl. Basuki Rachmat No.5, Malang',
                'opening_hours' => 'Mo-Su 09:00-22:00',
                'category' => 'cafe',
                'price_level' => 2,
                'source' => 'osm',
            ],
            // Bali
            [
                'city_slug' => 'bali',
                'osm_id' => '12278486239',
                'osm_type' => 'way',
                'name' => 'Revolver Espresso',
                'slug' => 'revolver-espresso-bali',
                'lat' => -8.5187,
                'lng' => 115.2631,
                'address' => 'Jl. Kayu Aya, Seminyak, Bali',
                'opening_hours' => 'Mo-Su 07:00-18:00',
                'category' => 'coffee_shop',
                'price_level' => 3,
                'source' => 'osm',
            ],
            [
                'city_slug' => 'bali',
                'osm_id' => '13278486240',
                'osm_type' => 'node',
                'name' => 'Zin Cafe Canggu',
                'slug' => 'zin-cafe-canggu-bali',
                'lat' => -8.6432,
                'lng' => 115.1394,
                'address' => 'Jl. Batu Bolong, Canggu, Bali',
                'opening_hours' => 'Mo-Su 08:00-20:00',
                'category' => 'cafe',
                'price_level' => 2,
                'source' => 'osm',
            ],
            // Solo
            [
                'city_slug' => 'solo',
                'osm_id' => '14278486241',
                'osm_type' => 'node',
                'name' => 'Brew & Co Solo',
                'slug' => 'brew-co-solo',
                'lat' => -7.5728,
                'lng' => 110.8192,
                'address' => 'Jl. Slamet Riyadi, Solo',
                'opening_hours' => 'Mo-Su 09:00-22:00',
                'category' => 'cafe',
                'price_level' => 2,
                'source' => 'osm',
            ],
            // Bogor
            [
                'city_slug' => 'bogor',
                'osm_id' => null,
                'osm_type' => null,
                'name' => 'Djournal Coffee Bogor',
                'slug' => 'djournal-coffee-bogor',
                'lat' => -6.5972,
                'lng' => 106.8063,
                'address' => 'Jl. Ir. H. Juanda No.30, Bogor',
                'category' => 'coffee_shop',
                'price_level' => 2,
                'source' => 'manual',
                'description' => 'Coffee shop dengan garden view dekat Kebun Raya.',
            ],
            // Bandar Lampung
            [
                'city_slug' => 'bandar-lampung',
                'osm_id' => null,
                'osm_type' => null,
                'name' => 'Kopi Lampung',
                'slug' => 'kopi-lampung',
                'lat' => -5.4290,
                'lng' => 105.2620,
                'address' => 'Jl. Raden Intan No.10, Bandar Lampung',
                'category' => 'coffee_shop',
                'price_level' => 2,
                'source' => 'manual',
                'description' => 'Coffee shop dengan kopi khas Lampung.',
            ],
        ];

        foreach ($cafes as $cafe) {
            $cityId = $cities[$cafe['city_slug']] ?? null;
            if (!$cityId) {
                continue;
            }

            DB::table('cafes')->updateOrInsert(
                ['slug' => $cafe['slug']],
                array_merge(
                    array_filter($cafe, fn ($v, $k) => !is_null($v) && $k !== 'city_slug', ARRAY_FILTER_USE_BOTH),
                    [
                        'city_id' => $cityId,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                )
            );
        }
    }
}