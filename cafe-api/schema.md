# SiCafe Database Schema

> Database schema untuk API SiCafe — backend Laravel + Sanctum untuk aplikasi React Native pencari cafe berbasis OSM (OpenStreetMap).

## Overview

```
┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    cities     │       │    cafes     │
│─────────────│       │──────────────│       │──────────────│
│ id (PK)      │       │ id (PK)      │◄──┐   │ id (PK)      │
│ name         │       │ name         │   │   │ city_id (FK) │──────► cities
│ email (uniq) │       │ slug (uniq)  │   │   │ osm_id       │
│ password     │       │ osm_rel_id   │   │   │ osm_type     │
│ timestamps   │       │ lat, lng     │   │   │ name         │
└──────┬──────┘       │ timestamps   │   │   │ slug (uniq)  │
       │              └──────────────┘   │   │ lat, lng     │
       │                                 │   │ address      │
       │  ┌──────────────────────┐       │   │ phone        │
       │  │ personal_access_tokens│      │   │ opening_hours│
       │  │──────────────────────│       │   │ website      │
       └─►│ id (PK)              │       │   │ category     │
          │ tokenable (morph)    │       │   │ price_level  │
          │ name, token, ...     │       │   │ avg_rating   │
          └──────────────────────┘       │   │ description  │
                                         │   │ source       │
       ┌──────────────┐                  │   │ last_synced  │
       │   favorites   │                 │   │ timestamps   │
       │──────────────│                  │   └──────┬───────┘
       │ id (PK)      │                  │          │
       │ user_id (FK) │──────► users     │          │
       │ cafe_id (FK) │──────► cafes ────┘          │
       │ unique(u,c)  │                             │
       │ created_at   │                             │
       └──────────────┘                             │
                                                    │
       ┌──────────────┐    ┌──────────────────┐     │
       │  cafe_notes   │    │   cafe_photos     │    │
       │──────────────│    │──────────────────│     │
       │ id (PK)      │    │ id (PK)          │    │
       │ user_id (FK) │───►│ cafe_id (FK)     │◄───┘
       │ cafe_id (FK) │───►│ uploaded_by (FK) │──────► users (nullable)
       │ note         │    │ path             │
       │ rating       │    │ created_at       │
       │ visited_at   │    └──────────────────┘
       │ timestamps   │
       └──────────────┘
```

## Tables

### 1. `users`

Laravel default authentication table, diintegrasikan dengan **Sanctum** untuk token-based auth (React Native).

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `name` | varchar(255) | |
| `email` | varchar(255) | unique |
| `password` | varchar(255) | hashed via Hash::make() |
| `remember_token` | varchar(100) | nullable |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Auth Strategy:** Sanctum (bukan Passport). Cukup token-based untuk mobile app. Client mengirim `Authorization: Bearer {token}` di header request.

### 2. `personal_access_tokens`

Tabel bawaan Sanctum. Auto-generated saat package dipublish.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `tokenable_type` | varchar(255) | morph type (App\Models\User) |
| `tokenable_id` | bigint | morph id |
| `name` | varchar(255) | token name (e.g. "react-native-app") |
| `token` | varchar(64) | unique, hashed |
| `abilities` | text | JSON array of allowed abilities |
| `last_used_at` | timestamp | nullable |
| `expires_at` | timestamp | nullable |

### 3. `cities`

Kota/kabupaten tempat cafe berada. Memudahkan query hierarkal: `/api/cities/{slug}/cafes`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `name` | varchar(255) | e.g. "Bandung", "Yogyakarta" |
| `slug` | varchar(255) | unique, URL-friendly (e.g. "bandung") |
| `osm_relation_id` | varchar(50) | OSM relation ID untuk area kota |
| `lat` | decimal(10,7) | latitude center kota |
| `lng` | decimal(10,7) | longitude center kota |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Relations:** hasMany → `cafes`

### 4. `cafes`

Tabel utama. Setiap cafe bisa berasal dari OSM (scrape) atau ditambahkan manual.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `city_id` | bigint (FK) | → `cities.id` |
| `osm_id` | varchar(50) | ID dari OSM, null untuk data manual |
| `osm_type` | enum('node','way','relation') | tipe OSM object |
| `name` | varchar(255) | nama cafe |
| `slug` | varchar(255) | unique, URL-friendly |
| `lat` | decimal(10,7) | latitude |
| `lng` | decimal(10,7) | longitude |
| `address` | varchar(500) | nullable, alamat lengkap |
| `phone` | varchar(50) | nullable |
| `opening_hours` | varchar(255) | nullable, raw OSM syntax (e.g. "Mo-Fr 08:00-22:00") |
| `website` | varchar(500) | nullable |
| `category` | enum('cafe','coffee_shop','coworking') | default 'cafe' |
| `price_level` | tinyint | nullable, 1-4 (1=murah, 4=sangat mahal) |
| `avg_rating` | decimal(3,2) | nullable, cache dari internal ratings |
| `description` | text | nullable, catatan/manual override |
| `source` | enum('osm','manual') | sumber data |
| `last_synced_at` | timestamp | nullable, kapan terakhir di-sync dari OSM |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Indexes:**
- unique(`osm_id`, `osm_type`) — mencegah duplikat OSM
- index(`city_id`)
- index(`slug`)

**Relations:**
- belongsTo → `cities`
- hasMany → `cafe_photos`
- hasMany → `favorites`
- hasMany → `cafe_notes`

### 5. `cafe_photos`

Foto-foto cafe. Bisa dari upload user atau dari scrape system.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `cafe_id` | bigint (FK) | → `cafes.id` |
| `uploaded_by` | bigint (FK) | → `users.id`, nullable (null = system/scrape) |
| `path` | varchar(500) | path file foto (relative atau URL) |
| `created_at` | timestamp | |

**Relations:**
- belongsTo → `cafes`
- belongsTo → `users` (via `uploaded_by`, nullable)

### 6. `favorites`

Bookmark cafe oleh user. Setiap user hanya bisa favorite 1x per cafe.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `user_id` | bigint (FK) | → `users.id` |
| `cafe_id` | bigint (FK) | → `cafes.id` |
| `created_at` | timestamp | |

**Constraints:**
- unique(`user_id`, `cafe_id`) — satu user, satu cafe
- composite index(`user_id`, `cafe_id`)

**Relations:**
- belongsTo → `users`
- belongsTo → `cafes`

### 7. `cafe_notes`

Catatan pribadi user tentang cafe. Bisa berisi review, rating, dan tanggal kunjungan.

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (PK) | auto-increment |
| `user_id` | bigint (FK) | → `users.id` |
| `cafe_id` | bigint (FK) | → `cafes.id` |
| `note` | text | isi catatan/review |
| `rating` | tinyint | nullable, 1-5 (rating pribadi user) |
| `visited_at` | date | nullable, kapan user mengunjungi |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

**Indexes:**
- index(`user_id`, `cafe_id`)

**Relations:**
- belongsTo → `users`
- belongsTo → `cafes`

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Sanctum bukan Passport** | RN app cukup token-based auth. Sanctum lebih ringan, built-in Laravel, tidak perlu OAuth complexity. |
| **`slug` di cities & cafes** | URL-friendly identifiers. `/api/cities/bandung/cafes` lebih readable dari `/api/cities/1/cafes`. |
| **`category` enum** | Memudahkan filter & konsistensi data. OSM `amenity=cafe` + `cuisine=coffee` → `coffee_shop`. |
| **`price_level` nullable** | OSM jarang isi data harga. Bisa diisi manual nanti. Skala 1-4 (mirip Google Maps). |
| **`avg_rating` sebagai cache** | Menghindari hitung rating dari `cafe_notes` di setiap request. Update saat ada note baru. |
| **`favorites` bukan `user_favorites`** | Nama lebih pendek. Has "user" implisit karena per-user scope. |
| **`cafe_notes` personal** | Setiap user bisa punya catatan berbeda untuk cafe yang sama (mirip Google Maps review). |
| **`uploaded_by` nullable** | Foto dari scrape/scraping system tidak punya user. Null = system-generated. |
| **`osm_id` + `osm_type` unique** | Prevent duplikat. OSM ID tidak unik antar tipe (node vs way bisa punya ID sama). |

## API Endpoints (Reference)

```
GET    /api/cities                    — list semua kota
GET    /api/cities/{slug}             — detail kota + stats
GET    /api/cities/{slug}/cafes       — cafes di kota tertentu

GET    /api/cafes                     — search/filter cafes (global)
GET    /api/cafes/{slug}              — detail cafe

GET    /api/cafes/{id}/photos         — list foto cafe
POST   /api/cafes/{id}/photos         — upload foto (auth required)

POST   /api/favorites                 — toggle favorite (auth required)
GET    /api/favorites                 — list favorit user (auth required)

GET    /api/cafes/{id}/notes          — list notes cafe
POST   /api/cafes/{id}/notes          — tambah note (auth required)
PUT    /api/notes/{id}                — edit note (auth required)
DELETE /api/notes/{id}                — hapus note (auth required)

POST   /api/register                  — registrasi
POST   /api/login                     — login (return Sanctum token)
POST   /api/logout                    — logout (revoke token)
GET    /api/user                      — current user info (auth required)
```

## Seeding Strategy

1. **cities** — Seed kota-kota besar di Indonesia (prioritas: Bandar Lampung, Bandung, Jakarta, Yogyakarta, Bali)
2. **cafes** — Initial seed dari OSM Overpass API scrape. Format existing `import_cities_from_osm.py` sudah ada.
3. **users** — Buat seeding awal.