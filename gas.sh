#!/bin/bash


npx concurrently \
  -n "LARAVEL" \
  -c "magenta" \
  "cd cafe-api && php artisan serve --host 0.0.0.0 --port 8000"