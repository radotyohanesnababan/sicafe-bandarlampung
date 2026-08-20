<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cafe_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('cafe_id')->constrained('cafes')->cascadeOnDelete();
            $table->text('note');
            $table->tinyInteger('rating')->unsigned()->nullable()->comment('1-5');
            $table->date('visited_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'cafe_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cafe_notes');
    }
};