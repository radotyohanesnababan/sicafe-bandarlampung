<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cafes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('city_id')->constrained('cities')->cascadeOnDelete();
            $table->string('osm_id', 50)->nullable();
            $table->enum('osm_type', ['node', 'way', 'relation'])->nullable();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->string('address', 500)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('opening_hours')->nullable();
            $table->string('website', 500)->nullable();
            $table->enum('category', ['cafe', 'coffee_shop', 'coworking', 'restoran'])->default('cafe');
            $table->tinyInteger('price_level')->unsigned()->nullable()->comment('1-4');
            $table->decimal('avg_rating', 3, 2)->nullable()->comment('Internal rating cache');
            $table->integer('review_count')->default(0);
            $table->text('description')->nullable();
            $table->string('gmaps_url', 500)->nullable();
            $table->enum('source', ['osm', 'gmaps', 'manual'])->default('osm');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['osm_id', 'osm_type']);
            $table->index('city_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cafes');
    }
};