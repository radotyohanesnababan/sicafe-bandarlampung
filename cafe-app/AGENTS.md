# AGENTS.md - SiCafe Project

## Project Overview

**SiCafe** adalah aplikasi mobile React Native (Expo) untuk menemukan dan menjelajahi cafe terbaik di berbagai kota. Aplikasi ini menggunakan Expo SDK 57 dengan React 19.

## Tech Stack

- **Framework:** Expo SDK 57 (React Native 0.86)
- **Navigation:** React Navigation 7 (`@react-navigation/native-stack`)
- **HTTP Client:** Axios 1.x
- **Language:** JavaScript (functional components + hooks)
- **Styling:** `StyleSheet.create` (tanpa library UI eksternal)
- **Environment Config:** `expo-constants` + `.env` via `dotenv`

## Project Structure

```
cafe-app/
├── App.js                          # Entry point - NavigationContainer setup
├── .env                            # Environment variables (API_BASE_URL)
├── app.json                        # Expo configuration
├── package.json                    # Dependencies
├── index.js                        # registerRootComponent
└── src/
    ├── components/
    │   ├── CafeCard.js             # Card untuk menampilkan info cafe (nama, alamat, rating)
    │   ├── SearchBar.js            # Search input untuk filter cafe
    │   └── LoadingSpinner.js       # Loading indicator dengan optional message
    ├── navigation/
    │   └── AppNavigator.js         # Stack navigator (Home → CafeList → CafeDetail)
    ├── screens/
    │   ├── HomeScreen.js           # Landing page dengan CTA button
    │   ├── CafeListScreen.js       # Daftar cafe dengan FlatList + search + pull-to-refresh
    │   └── CafeDetailScreen.js     # Detail cafe (nama, rating, alamat, deskripsi)
    └── services/
        └── api.js                  # Axios instance dengan configurable base URL
```

## Coding Conventions

### Component Style
- Gunakan **functional components** dengan **hooks** (`useState`, `useEffect`, dll.)
- Hindari class components
- Gunakan `StyleSheet.create` untuk semua styling
- Component naming: PascalCase (e.g., `CafeCard.js`)

### Import Order
1. React & React Native
2. Third-party libraries (axios, navigation, dll.)
- Local components, services, utils

### File Naming
- Screens: `PascalCaseScreen.js` (e.g., `CafeListScreen.js`)
- Components: `PascalCase.js` (e.g., `CafeCard.js`)
- Services: `camelCase.js` (e.g., `api.js`)
- Navigation: `PascalCase.js` (e.g., `AppNavigator.js`)

### State Management
- Gunakan local state (`useState`) untuk UI state
- Gunakan `useEffect` untuk data fetching
- Belum ada state management global (Redux/Zustand) - bisa ditambahkan jika diperlukan

## API Configuration

Base URL dikonfigurasi melalui:
1. `app.json` → `expo.extra.apiBaseUrl`
2. Fallback: `https://10.231.76.78:8000` (dummy data)

Untuk mengganti base URL, edit file `.env`:
```
API_BASE_URL=https://your-backend-url.com
```

Atau update `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiBaseUrl": "https://your-backend-url.com"
    }
  }
}
```

## Navigation Flow

```
HomeScreen (no header)
    ↓
CafeListScreen (header: "Daftar Cafe")
    ↓ tap card
CafeDetailScreen (header: "Detail Cafe")
```

## Key Files Description

### `src/services/api.js`
Axios instance dengan base URL dari expo-constants, timeout 10s, dan request/response interceptors untuk error handling.

### `src/screens/CafeListScreen.js`
- Fetch data dari `/posts` endpoint (dummy)
- Transform data menjadi format cafe (name, address, rating, description)
- Search filter berdasarkan nama dan alamat
- Pull-to-refresh support
- Error handling dengan pesan user-friendly

### `src/components/CafeCard.js`
Card component dengan shadow, rounded corners, rating badge (kuning), nama cafe, alamat, dan deskripsi (max 2 baris).

## Dependencies

| Package | Purpose |
|---------|---------|
| expo | Core framework |
| react / react-native | UI framework |
| @react-navigation/native | Navigation core |
| @react-navigation/native-stack | Native stack navigator |
| axios | HTTP client |
| expo-constants | Access to app config (apiBaseUrl) |
| expo-status-bar | Status bar control |
| react-native-safe-area-context | Safe area support for navigation |
| react-native-screens | Native screen containers |
| dotenv | Environment variable loading |

## Development Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

## Guidelines for AI Agents

1. **Selalu gunakan functional components** dengan hooks, jangan gunakan class components.
2. **Jangan tambahkan library UI** (NativeBase, React Native Paper, dll.) kecuali diminta.
3. **Gunakan `StyleSheet.create`** untuk styling.
4. **Ikuti struktur folder** yang sudah ada: `src/screens`, `src/components`, `src/services`, `src/navigation`.
5. **Base URL API** harus selalu configurable melalui `app.json` extra atau `.env`.
6. **Handle loading dan error state** di setiap screen yang melakukan fetch data.
7. **Gunakan Indonesian** untuk text/user-facing strings (nama tombol, pesan error, placeholder).
8. **Jangan hardcode** API URL di screen/component - gunakan `api.js` instance.
9. **Format rating** sebagai number dengan 1 decimal (e.g., "4.5").
10. **Update AGENTS.md** jika ada perubahan struktur project yang signifikan.