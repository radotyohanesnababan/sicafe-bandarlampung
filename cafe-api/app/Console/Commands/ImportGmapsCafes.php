<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Cafe;
use Illuminate\Support\Facades\File;

class ImportGmapsCafes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cafes:import-gmaps {file? : Path to the JSON file}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import scraped Google Maps cafes from JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $file = $this->argument('file');
        
        if (!$file) {
            // Default path di dalam database/scraper
            $file = database_path('scraper/cafes_gmaps_v2.json');
        }

        if (!File::exists($file)) {
            $this->error("File not found: {$file}");
            return;
        }

        $this->info("Reading data from {$file}");
        
        try {
            $json = File::get($file);
        } catch (\Exception $e) {
            $this->error("Error membaca file: " . $e->getMessage());
            return;
        }

        $data = json_decode($json, true);

        if (!$data) {
            $this->error("Invalid JSON or empty file.");
            return;
        }

        $this->info("Found " . count($data) . " cafes in file. Importing...");

        $imported = 0;
        $updated = 0;

        // Ensure Bandar Lampung exists
        $city = \App\Models\City::firstOrCreate(
            ['name' => 'Bandar Lampung'],
            ['name' => 'Bandar Lampung', 'slug' => 'bandar-lampung', 'lat' => -5.4254, 'lng' => 105.2580] // Provide default fields if needed
        );

        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $city, &$imported, &$updated) {
            foreach ($data as $item) {
                $name = $item['name'] ?? null;
                $lat = $item['lat'] ?? null;
            $lng = $item['lng'] ?? null;
            
            if (!$name || !$lat || !$lng) {
                $this->warn("Skipping invalid item (missing name/lat/lng)");
                continue;
            }

            // Map category
            $raw_cat = strtolower($item['category'] ?? '');
            $category = 'cafe';
            
            if (str_contains($raw_cat, 'kopi') || str_contains($raw_cat, 'coffee') || str_contains($raw_cat, 'kedai')) {
                $category = 'coffee_shop';
            } elseif (str_contains($raw_cat, 'coworking') || str_contains($raw_cat, 'space')) {
                $category = 'coworking';
            } elseif (str_contains($raw_cat, 'restoran') || str_contains($raw_cat, 'makan') || str_contains($raw_cat, 'ayam') || str_contains($raw_cat, 'sate') || str_contains($raw_cat, 'soto') || str_contains($raw_cat, 'bakso') || str_contains($raw_cat, 'seafood') || str_contains($raw_cat, 'pempek')) {
                $category = 'restoran';
            }

            // Slug helper
            $slug = \Illuminate\Support\Str::slug($name . '-' . $city->name);

            // Check if cafe exists by name (very basic check) or URL
            $cafe = Cafe::where('gmaps_url', $item['gmaps_url'])
                        ->orWhere('name', $name)
                        ->first();

            if ($cafe) {
                // Update existing
                $cafe->update([
                    'lat' => $lat,
                    'lng' => $lng,
                    'address' => $item['address'] ?? $cafe->address,
                    'category' => $category,
                    'review_count' => $item['review_count'] ?? $cafe->review_count,
                    'gmaps_url' => $item['gmaps_url'] ?? $cafe->gmaps_url,
                    'source' => 'gmaps',
                    'avg_rating' => $item['rating'] ?? $cafe->avg_rating,
                    'opening_hours' => $item['hours'] ?? $cafe->opening_hours,
                    'phone' => $item['phone'] ?? $cafe->phone,
                    'website' => $item['website'] ?? $cafe->website,
                    'price_level' => $item['price_level'] ?? $cafe->price_level,
                    'amenities' => $item['amenities'] ?? $cafe->amenities,
                ]);
                $updated++;
            } else {
                // Check if slug exists to avoid unique constraint error
                if (Cafe::where('slug', $slug)->exists()) {
                    $slug .= '-' . rand(1000, 9999);
                }

                // Create new
                $cafe = Cafe::create([
                    'city_id' => $city->id,
                    'name' => $name,
                    'slug' => $slug,
                    'lat' => $lat,
                    'lng' => $lng,
                    'address' => $item['address'] ?? null,
                    'category' => $category,
                    'review_count' => $item['review_count'] ?? 0,
                    'gmaps_url' => $item['gmaps_url'] ?? null,
                    'source' => 'gmaps',
                    'avg_rating' => $item['rating'] ?? null,
                    'opening_hours' => $item['hours'] ?? null,
                    'phone' => $item['phone'] ?? null,
                    'website' => $item['website'] ?? null,
                    'price_level' => $item['price_level'] ?? 0,
                    'amenities' => $item['amenities'] ?? null,
                ]);
                $imported++;
            }

            // Sync photos
            if (isset($item['photos']) && is_array($item['photos'])) {
                foreach ($item['photos'] as $photo_url) {
                    \Illuminate\Support\Facades\DB::table('cafe_photos')->updateOrInsert(
                        [
                            'cafe_id' => $cafe->id,
                            'path' => $photo_url,
                        ],
                        [
                            'created_at' => now()
                        ]
                    );
                }
            }
        }
        });

        $this->info("Import finished! Created: {$imported}, Updated: {$updated}");
    }
}
