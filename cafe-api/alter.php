<?php
DB::statement("ALTER TABLE cafes MODIFY COLUMN category ENUM('cafe', 'coffee_shop', 'coworking', 'restoran') DEFAULT 'cafe'");
echo "Table altered successfully.\n";
