<?php

namespace App\Console\Commands;

use App\Models\Cafe;
use App\Models\City;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class FetchOsmCafes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'osm:fetch-cafes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch cafes from OpenStreetMap for Bandar Lampung';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Focus on Bandar Lampung
        $city = City::where('slug', 'bandar-lampung')->first();

        if (!$city) {
            $this->error('Kota Bandar Lampung tidak ditemukan di database.');
            return;
        }

        $this->info("Mengambil data cafe untuk {$city->name}...");

        // Bandar Lampung coordinates from DB or hardcoded
        $lat = $city->lat ?? -5.4290;
        $lng = $city->lng ?? 105.2620;
        $radius = 15000; // 15km to include surrounding areas like Jatiagung/Karanganyar

        // Overpass API Query
        $query = "[out:json][timeout:90];(node[\"amenity\"=\"cafe\"](around:{$radius},{$lat},{$lng});node[\"amenity\"=\"coffee_shop\"](around:{$radius},{$lat},{$lng});way[\"amenity\"=\"cafe\"](around:{$radius},{$lat},{$lng});way[\"amenity\"=\"coffee_shop\"](around:{$radius},{$lat},{$lng}););out center;";

        $this->info('Mengirim request ke Overpass API (ini mungkin butuh beberapa detik)...');

        try {
            $ch = curl_init('https://overpass-api.de/api/interpreter');
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, "data=" . urlencode($query));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, 'SiCafeBot/1.0');
            curl_setopt($ch, CURLOPT_TIMEOUT, 120);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);

            if ($response === false || $httpCode !== 200) {
                $this->error("Gagal mengambil data dari Overpass API. HTTP Status: $httpCode. Error: $error");
                return;
            }

            $data = json_decode($response, true);
            $elements = $data['elements'] ?? [];

            if (empty($elements)) {
                $this->warn('Tidak ada cafe ditemukan di area ini.');
                return;
            }

            $this->info('Ditemukan ' . count($elements) . ' lokasi potensial. Memproses data...');

            $insertedCount = 0;
            $skippedCount = 0;

            foreach ($elements as $element) {
                $tags = $element['tags'] ?? [];
                $name = $tags['name'] ?? null;

                // SKIP IF NO NAME
                if (empty($name)) {
                    $skippedCount++;
                    continue;
                }

                $osmId = $element['id'];
                $osmType = $element['type']; // node or way
                
                // Get lat/lng
                $elementLat = null;
                $elementLng = null;
                
                if ($osmType === 'node') {
                    $elementLat = $element['lat'] ?? null;
                    $elementLng = $element['lon'] ?? null;
                } else {
                    $elementLat = $element['center']['lat'] ?? null;
                    $elementLng = $element['center']['lon'] ?? null;
                }
                
                // Fallback to city coordinates if somehow missing
                $elementLat = $elementLat ?: $lat;
                $elementLng = $elementLng ?: $lng;

                // Construct Address
                $addressParts = [];
                if (!empty($tags['addr:full'])) {
                    $addressParts[] = $tags['addr:full'];
                } else {
                    if (!empty($tags['addr:street'])) $addressParts[] = $tags['addr:street'];
                    if (!empty($tags['addr:housenumber'])) $addressParts[] = 'No. ' . $tags['addr:housenumber'];
                    if (!empty($tags['addr:neighbourhood'])) $addressParts[] = $tags['addr:neighbourhood'];
                    if (!empty($tags['addr:subdistrict'])) $addressParts[] = $tags['addr:subdistrict'];
                    if (!empty($tags['addr:district'])) $addressParts[] = $tags['addr:district'];
                    if (!empty($tags['addr:city'])) {
                        $addressParts[] = $tags['addr:city'];
                    } elseif (!empty($city->name)) {
                        $addressParts[] = $city->name;
                    }
                    if (!empty($tags['addr:province'])) $addressParts[] = $tags['addr:province'];
                    if (!empty($tags['addr:postcode'])) $addressParts[] = $tags['addr:postcode'];
                }
                
                $address = implode(', ', array_unique(array_filter($addressParts)));
                if (empty($address)) {
                    $address = $city->name; // fallback
                }

                // Others
                $category = ($tags['amenity'] ?? '') === 'coffee_shop' ? 'coffee_shop' : 'cafe';
                $phone = $tags['phone'] ?? $tags['contact:phone'] ?? null;
                $openingHours = $tags['opening_hours'] ?? null;
                $website = $tags['website'] ?? $tags['contact:website'] ?? null;

                // Create Slug
                $baseSlug = Str::slug($name . '-' . $city->slug);
                $slug = $baseSlug;
                
                // Check if slug exists but different OSM ID
                $existing = Cafe::where('slug', $slug)->first();
                if ($existing && ($existing->osm_id != $osmId || $existing->osm_type != $osmType)) {
                    $slug = $baseSlug . '-' . Str::random(5);
                }

                Cafe::updateOrCreate(
                    [
                        'osm_id' => $osmId,
                        'osm_type' => $osmType,
                    ],
                    [
                        'city_id' => $city->id,
                        'name' => $name,
                        'slug' => $slug,
                        'lat' => $elementLat,
                        'lng' => $elementLng,
                        'address' => $address,
                        'phone' => $phone,
                        'opening_hours' => $openingHours,
                        'website' => $website,
                        'category' => $category,
                        'source' => 'osm',
                        'last_synced_at' => now(),
                    ]
                );

                $insertedCount++;
            }

            $this->info("Selesai! $insertedCount cafe berhasil di-import/update. $skippedCount diabaikan karena tidak ada nama.");

        } catch (\Exception $e) {
            $this->error('Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
