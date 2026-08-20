# AGENTS.md - SiCafe API

## Project Overview

**SiCafe API** adalah backend RESTful API untuk aplikasi SiCafe — aplikasi mobile pencari cafe berbasis OpenStreetMap (OSM). API ini dibangun dengan **Laravel 12** + **Sanctum** (token-based auth) dan melayani frontend React Native (expo).

## Tech Stack

- **Framework:** Laravel 12 (PHP 8.2+)
- **Auth:** Laravel Sanctum 4 (token-based, single-device strategy)
- **Database:** MySQL / SQLite (via Laravel)
- **Language:** PHP (typed returns, Request classes / inline validation)
- **Testing:** PHPUnit 11 + Mockery
- **Code Style:** Laravel Pint

## Project Structure

```
cafe-api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       └── Api/
│   │           ├── AuthController.php        # Register, login, logout
│   │           ├── CityController.php        # List & detail kota
│   │           ├── CafeController.php        # CRUD cafe (read publik, write auth)
│   │           ├── FavoriteController.php    # Toggle & list favorit user
│   │           └── CafeNoteController.php    # CRUD catatan/review user
│   ├── Models/
│   │   ├── User.php                          # Sanctum auth (HasApiTokens)
│   │   ├── City.php                          # Kota (slug-based routing)
│   │   ├── Cafe.php                          # Cafe utama (belongsTo City)
│   │   ├── CafePhoto.php                     # Foto cafe
│   │   ├── Favorite.php                      # Bookmark cafe per user
│   │   └── CafeNote.php                      # Catatan/review per user
│   └── Providers/
├── database/
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── CitySeeder.php                    # Seed kota-kota Indonesia
│   │   └── CafeSeeder.php                    # Seed cafe dari OSM
│   └── migrations/
├── routes/
│   ├── api.php                               # API routes (prefix: /api)
│   └── web.php                               # Web routes (unused for API)
├── config/
├── bootstrap/
├── schema.md                                 # Database schema reference
├── composer.json
├── .env.example
└── phpunit.xml
```

## Database Schema (6 tables)

```
users → personal_access_tokens (Sanctum)
  ↓
cities → cafes → cafe_photos
         cafes → favorites (unique user+cafe)
         cafes → cafe_notes  (user review + rating)
```

### Key Tables

| Table | Description |
|-------|-------------|
| `users` | Auth users (Laravel default + Sanctum) |
| `cities` | Kota, slug-based routing (`/api/cities/{slug}`) |
| `cafes` | Cafe utama. Route key = `slug`. FK → cities |
| `cafe_photos` | Foto cafe. `uploaded_by` nullable (system/scrape) |
| `favorites` | Bookmark. Unique constraint: `(user_id, cafe_id)` |
| `cafe_notes` | Review + rating (1-5) + visited_at. Auto-recalc `cafes.avg_rating` |

Full schema reference: `schema.md`

## API Endpoints

### Public (no auth)

```
POST   /api/register              — registrasi (return token)
POST   /api/login                 — login (return token, revoke old tokens)
GET    /api/cities                — list semua kota
GET    /api/cities/{slug}         — detail kota + cafe_count
GET    /api/cities/{slug}/cafes   — cafes di kota tertentu
GET    /api/cafes/{slug}          — detail cafe + photos + city
```

### Protected (auth:sanctum — header: `Authorization: Bearer {token}`)

```
POST   /api/logout                — revoke token
POST   /api/cafes                 — tambah cafe baru
PUT    /api/cafes/{slug}          — update cafe
DELETE /api/cafes/{slug}          — hapus cafe
GET    /api/favorites             — list favorit user
POST   /api/favorites             — toggle favorit (add/remove)
DELETE /api/favorites/{id}        — hapus favorit
GET    /api/cafe-notes            — list catatan user
POST   /api/cafe-notes            — tambah catatan (auto-recalc avg_rating)
PUT    /api/cafe-notes/{id}       — update catatan
DELETE /api/cafe-notes/{id}       — hapus catatan
```

## Coding Conventions

### PHP Style
- Gunakan **PHP 8.2+** features: typed properties, enums, readonly, match expressions
- Gunakan `JsonResponse` sebagai return type di semua controller methods
- Validation inline di controller (`$request->validate([...])`)
- Gunakan **Eloquent Model** untuk semua database interactions
- Gunakan **route model binding** dengan slug (`{cafe:slug}`, `{city:slug}`)

### Controller Style
- Method names: HTTP verb (`index`, `show`, `store`, `update`, `destroy`)
- Return `response()->json()` — semua response berupa JSON
- Error messages dalam **Bahasa Indonesia** (e.g., "Email atau password salah.")
- Ownership check manual: `$model->user_id !== $request->user()->id` → 403

### Model Style
- `$fillable` untuk mass assignment
- `$hidden` untuk sensitive fields (password, timestamps)
- `casts()` method (bukan property `$casts`)
- Route key name: `slug` (bukan `id`) — via `getRouteKeyName()`
- Relations: `belongsTo`, `hasMany` — didefinisikan di model

### File Naming
- Controllers: `PascalCase.php` dalam namespace `App\Http\Controllers\Api\`
- Models: `PascalCase.php` dalam namespace `App\Models\`
- Migrations: `snake_case_create_tablename.php`
- Seeders: `PascalCaseSeeder.php`

## Auth Strategy

- **Sanctum token-based** (bukan session/cookie)
- Token name: `"react-native-app"`
- **Single-device strategy**: login baru revoke token lama (`$user->tokens()->delete()`)
- Client kirim header: `Authorization: Bearer {plainTextToken}`
- `password` field auto-hashed via model cast `'password' => 'hashed'`

## Key Business Logic

### Favorite Toggle
`POST /api/favorites` bersifat **toggle**: jika sudah ada → hapus, jika belum → tambah. Response include `favorited: true/false`.

### avg_rating Cache
`cafes.avg_rating` adalah **cache** dari rata-rata `cafe_notes.rating` per cafe. Auto-update saat catatan ditambah/diubah/dihapus via `CafeNoteController::recalcAvgRating()`.

### Slug Generation
- Cafe slug di-generate dari name via `Str::slug()`
- Jika slug sudah ada → append random string (`-{random5}`)
- Slug auto-update saat cafe di-rename

## Development Commands

```bash
# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Start development server
php artisan serve

# Run full dev stack (server + queue + logs + vite)
composer dev

# Run tests
php artisan test

# Code formatting
./vendor/bin/pint
```

## Dependencies

| Package | Purpose |
|---------|---------|
| laravel/framework | Core framework (v12) |
| laravel/sanctum | Token-based API auth (v4) |
| laravel/tinker | REPL / debugging |
| fakerphp/faker | Test data generation |
| laravel/pint | Code formatting |
| phpunit/phpunit | Testing framework |

## Guidelines for AI Agents

1. **Semua response harus JSON** — gunakan `response()->json()`. Jangan return view/redirect.
2. **Gunakan route model binding** dengan slug: `{cafe:slug}`, `{city:slug}` — bukan `{id}`.
3. **Auth = Sanctum** — protected routes pakai middleware `auth:sanctum`. Client kirim `Authorization: Bearer {token}`.
4. **Ownership check** untuk resources milik user (favorites, notes): bandingkan `$model->user_id !== $request->user()->id` → return 403.
5. **Error messages Bahasa Indonesia** — e.g., "Email atau password salah.", "Tidak memiliki akses."
6. **Jangan hardcode** response format — ikuti format yang sudah ada (lihat controller sebagai referensi).
7. **Update `avg_rating`** saat menambah/mengubah/menghapus cafe_notes (panggil method `recalcAvgRating`).
8. **Slug-based routing** — model Cafe dan City menggunakan `slug` sebagai route key, bukan `id`.
9. **Hidden fields** — `created_at`, `updated_at`, `last_synced_at` di-hide dari Cafe model output.
10. **Validasi input** di controller menggunakan `$request->validate()` — jangan bypass validasi.
11. **Ikuti struktur folder** yang sudah ada: `app/Http/Controllers/Api/`, `app/Models/`, `database/seeders/`.
12. **Update AGENTS.md** jika ada perubahan struktur project yang signifikan.