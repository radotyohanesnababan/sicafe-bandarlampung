<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DATABASE VERIFICATION ===" . PHP_EOL . PHP_EOL;

$cityCount = DB::table('cities')->count();
$cafeCount = DB::table('cafes')->count();

echo "Cities: {$cityCount}" . PHP_EOL;
echo "Cafes: {$cafeCount}" . PHP_EOL . PHP_EOL;

echo "=== CITIES ===" . PHP_EOL;
foreach (DB::table('cities')->get() as $c) {
    $cafePerCity = DB::table('cafes')->where('city_id', $c->id)->count();
    echo "  [{$c->id}] {$c->name} ({$c->slug}) - {$cafePerCity} cafes" . PHP_EOL;
}

echo PHP_EOL . "=== CAFES ===" . PHP_EOL;
foreach (DB::table('cafes')->get() as $f) {
    echo "  [{$f->id}] {$f->name} | city_id:{$f->city_id} | cat:{$f->category} | src:{$f->source}" . PHP_EOL;
}

echo PHP_EOL . "=== TABLE STATUS ===" . PHP_EOL;
$tables = ['users', 'personal_access_tokens', 'cities', 'cafes', 'cafe_photos', 'favorites', 'cafe_notes'];
foreach ($tables as $table) {
    $exists = DB::getSchemaBuilder()->hasTable($table);
    $count = $exists ? DB::table($table)->count() : 'N/A';
    echo "  {$table}: " . ($exists ? "OK ({$count} rows)" : "MISSING") . PHP_EOL;
}

echo PHP_EOL . "Done." . PHP_EOL;