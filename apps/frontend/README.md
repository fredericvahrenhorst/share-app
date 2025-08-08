# Frontend Setup

## 🚀 Installation

Das Frontend ist bereits mit folgenden Technologien konfiguriert:

- **Ionic Vue 8** - Mobile-first Framework
- **Vue 3** - Progressive JavaScript Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Utility-first CSS Framework
- **Pinia** - State Management
- **Mapbox GL** - Interactive Maps

## 📦 Abhängigkeiten

Alle notwendigen Pakete sind bereits installiert:

```bash
# Core Dependencies
@ionic/vue
vue
vue-router
pinia

# Styling
tailwindcss: {},
@tailwindcss/forms
@tailwindcss/typography
autoprefixer
postcss

# Maps
mapbox-gl
@types/mapbox-gl
```

## 🎨 Tailwind CSS Konfiguration

Die Tailwind-Konfiguration ist vollständig eingerichtet mit:

- **Benutzerdefinierte Farben**: Primary, Secondary, Accent, Neutral, Status
- **Schriftarten**: Inter, Poppins, JetBrains Mono
- **Animationen**: Fade-in, Slide-up, Scale-in, Bounce-soft
- **Komponenten-Klassen**: Buttons, Cards, Inputs, Map-Container
- **Dark Mode Support**: Automatische Theme-Umschaltung

## 🗺️ Mapbox Integration

Die Mapbox-Integration ist vorbereitet, aber es fehlt noch ein gültiger API-Token.

### Mapbox Token Setup

1. Gehe zu [Mapbox](https://account.mapbox.com/)
2. Erstelle ein kostenloses Konto
3. Kopiere deinen Access Token
4. Ersetze den Token in `src/components/MapView.vue`:

```typescript
const MAPBOX_TOKEN = 'dein-mapbox-token-hier'
```

## 📱 Pinia Stores

Drei Stores sind implementiert:

### App Store (`src/stores/app.ts`)
- App-weite Zustände
- Location Management
- Theme & Language
- Map Controls

### Locations Store (`src/stores/locations.ts`)
- Standort-Daten
- API Integration
- Filter & Search
- Favorites Management

### User Store (`src/stores/user.ts`)
- Authentifizierung
- User Profile
- Preferences
- Session Management

## 🔧 Entwicklung

### Start Development Server

```bash
pnpm dev
```

### Build für Production

```bash
pnpm build
```

### Tests

```bash
pnpm test:unit
pnpm test:e2e
```

## 🎯 Nächste Schritte

1. **Mapbox Token hinzufügen** - Für funktionierende Karten
2. **Backend Integration** - API-Endpoints testen
3. **Testdaten laden** - Backend Seed-Script ausführen
4. **Komponenten erweitern** - Weitere UI-Komponenten
5. **Offline Support** - IndexedDB Integration
6. **PWA Setup** - Service Worker & Manifest

## 🐛 Bekannte Issues

- Mapbox Token fehlt (Karten funktionieren nicht)
- Vue-Komponenten Import-Fehler (TypeScript Konfiguration)
- Backend CORS-Einstellungen prüfen

## 🧩 Coding Conventions

- Projektweite Regeln: siehe Root-Datei `.cursor/rules/coding-conventions.mdc`.
- Vue-spezifisch: Composition API mit `script setup`, typisierte Props/Emits, Pinia für Shared State.
- Style/Format: `pnpm format`, `pnpm lint`, `pnpm check-types`.

## 📚 Dokumentation

- [Ionic Vue Docs](https://ionicframework.com/docs/vue/overview)
- [Vue 3 Docs](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Pinia](https://pinia.vuejs.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) 