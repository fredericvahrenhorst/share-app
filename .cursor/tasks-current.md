# ShareApp – Aktuelle Task-Liste (Projektstand)

Basiert auf dem Verifizierungsbericht (`.cursor/verification-report.md`) und Code-Analyse.
Begriffe im Code: **Location** (nicht Resource). Stand: **25. Februar 2026**.

**Status:** Phase 1–3 abgeschlossen. Phase 4 offen. Phase 5 (neue Vorschläge) offen.

---

## Legende

- **[x]** Erledigt und angebunden
- **[~]** Teilweise / Platzhalter (muss angebunden oder bereinigt werden)
- **[ ]** Offen

---

## Phase 1: Bereits umgesetzt (kein Handlungsbedarf)

- [x] **1. Projektstruktur & Shared**
  - Shared Types, Pinia-Stores, Tailwind-Design-System

- [x] **2. Karte & Marker**
  - LocationMap mit Mapbox, kategoriebasierte Marker, User-Position, Radius-Kreis
  - Suchleiste → SearchModal, Filter-Button → LocationFilter
  - Marker-Klick → LocationDetail-Modal

- [x] **3. Backend Locations & API**
  - Payload Collections: Locations, Categories, Users, Media, Favorites, Reviews, Reports
  - GET/POST `/api/locations`, GET `/api/categories`
  - Custom: GET `/api/search/locations` (Suche, Pagination, Kategorie), GET `/api/search/locations/nearby` (Radius, Kategorie)

- [x] **4. Frontend Daten & Suche**
  - locationsStore: getAllLocations, searchLocations, getNearbyLocations, Filter-State (localStorage)
  - SearchModal: lokale Suche + Geocoding-Tab
  - LocationFilter: Kategorien + Radius

- [x] **5. Location-Detail (Modal)**
  - LocationDetail zeigt echte Daten (name, category, address, openingHours, rules, contact)
  - Route öffnen, Favorit, Melden, Teilen – alles angebunden

- [x] **6. Kategorien-Seite**
  - CategoriesPage mit Grid; Kategorien aus `/api/categories`; Klick filtert/navigiert

- [x] **7. Backend Auth**
  - Payload Users mit auth; userStore (login, logout, getUserData, Token) vorhanden

---

## Phase 2: Platzhalter bereinigen & anbinden (abgeschlossen)

### 2.1 FavoritesPage an echte Daten anbinden

- [x] **2.1.1** Favorites-API im Frontend nutzen
  - eigener `favoritesStore` mit CRUD, verbunden mit `/api/favorites`
- [x] **2.1.2** FavoritesPage umbauen
  - Dummy-Daten entfernt; echte Liste aus Store/API; Leer-Zustand vorhanden
- [x] **2.1.3** Favorit hinzufügen/entfernen
  - LocationDetail: Favorit-Button mit POST/DELETE; Store-Sync funktioniert

### 2.2 ProfilPage an userStore/API anbinden

- [x] **2.2.1** Profil-Daten aus userStore/API
  - Echte Daten (name, email, avatar); Gast-Zustand wenn nicht eingeloggt
- [x] **2.2.2** Dummy-Daten entfernt
  - Stats aus API (Favoriten-Anzahl funktioniert, Besucht/Reviews zeigen „–")
- [x] **2.2.3** Aktionen angebunden
  - Abmelden funktioniert; Einstellungen/Datenschutz/Hilfe/Über zeigen „In Entwicklung" Toast
  - `EditProfileModal` für Name, Bio, Avatar-Upload implementiert

### 2.3 LocationDetail: Dummy-Inhalte entfernt

- [x] **2.3.1** Bewertungs-Block mit echten Reviews-Daten (reviewsStore)
- [x] **2.3.2** Beschreibung: Nur echte richText-Daten; Lorem-ipsum entfernt

### 2.4 Kategorien verbessert

- [x] **2.4.1** GET `/api/categories` für CategoriesPage; sortOrder, isActive berücksichtigt

---

## Phase 3: Fehlende Kernfeatures (abgeschlossen)

### 3.1 Add-Location-Flow (Ressource hinzufügen)

- [x] **3.1.1** AddLocationFlow-Komponente
  - 3-Schritt-Wizard (Karte → Kategorie → Details) in `AddLocationPage.vue` + `AddLocationModal.vue`
  - Map-Picker mit Mapbox-Suche, Kategorie-Auswahl, Pflichtfelder-Validierung
- [x] **3.1.2** Bild-Upload & Absenden
  - Upload mit Vorschau; POST an `/api/media` + `/api/locations`
  - Fehlerbehandlung vorhanden
- [~] **3.1.3** Erfolgs-Animation
  - Einfache Bestätigung, aber keine GSAP-Animation (wachsende Pflanze) wie in Spec

### 3.2 Auth-UI (Login/Register)

- [x] **3.2.1** Login-/Register-Seiten
  - `LoginPage.vue`, `RegisterPage.vue` — verbunden mit userStore, Auto-Login nach Registrierung
- [x] **3.2.2** Passwort zurücksetzen
  - `ForgotPasswordPage.vue` + `ResetPasswordPage.vue` — vollständiger Flow mit E-Mail-Template

### 3.3 Reviews & Bewertungen

- [x] **3.3.1** Reviews-Collection im Frontend
  - reviewsStore: Anzeige in LocationDetail, Bewertung abgeben (eingeloggt)
  - Backend-Hook: averageRating + reviewCount automatisch aktualisiert
- [x] **3.3.2** Moderation/Reporting
  - reportsStore: „Standort melden" mit Reason-Select, verbunden mit `/api/reports`
  - Moderation über Payload Admin-Panel

---

## Phase 4: Erweiterungen & Qualität (laut Spec — offen)

### 4.1 Kategorie-Filter & UX

- [ ] **4.1.1** „Beliebte in deiner Nähe" auf Kategorien-Seite
  - Nearby-Locations pro Kategorie via `/api/search/locations/nearby` + Category-Filter
- [x] **4.1.2** Barrierefreiheits-Filter in LocationFilter
  - 3 Checkboxen: Rollstuhlgerecht, Barrierefreies WC, Behindertenparkplatz
  - locationsStore filtert nach accessibility-Feldern; getAllLocations lädt accessibility mit
- [x] **4.1.3** Öffnungszeiten-Filter
  - Radio-Gruppe: Alle / Jetzt geöffnet / 24/7 geöffnet
  - Client-seitige Prüfung gegen openingHours.schedule + Wochentag/Uhrzeit
- [ ] **4.1.4** Breadcrumb-Navigation für aktive Filter
  - Chips/Tags über der Karte, die aktive Filter anzeigen und einzeln entfernbar sind

### 4.2 Onboarding & Hilfe

- [x] **4.2.1** Onboarding-Flow (3 animierte Screens)
  - Screen 1: Willkommen (🌱), Screen 2: Karte (🗺️), Screen 3: Datenschutz (🔒)
  - Skip/Weiter/Los-geht's Buttons, Dot-Indikator, Slide-Animationen
  - Nur beim ersten App-Start; Completion in localStorage persistiert
- [x] **4.2.2** Kontextuelle Hilfe
  - MapHelpTooltip: „So funktioniert die Karte" mit 3 Tipps (Marker, Suche, Hinzufügen)
  - Erscheint nach 1.5s, dismiss in localStorage persistiert
- [x] **4.2.3** Einstellungs-Persistenz
  - Benachrichtigungen: Toggle in ProfilPage, synct mit Backend (PATCH /api/users/:id)
  - Privacy: Select (Öffentlich/Freunde/Privat), synct mit Backend
  - Beide speichern in user.preferences

### 4.3 Offline & Performance

- [ ] **4.3.1** IndexedDB-Caching für Locations
  - Cache-First-Strategie: IndexedDB als Fallback wenn offline
  - Sync-Logik: Bei Reconnect neue Daten holen und Cache updaten
- [ ] **4.3.2** Offline-Indikator & Queue
  - Banner/Toast wenn offline; Aktionen (Favorit, Review, Report) in Queue speichern
  - Bei Reconnect Queue abarbeiten und User benachrichtigen
- [ ] **4.3.3** Service Worker & Asset-Caching
  - Statische Assets (JS, CSS, Fonts, Map-Tiles) cachen
  - Workbox oder vite-plugin-pwa für SW-Generierung
- [ ] **4.3.4** Bild-Performance
  - WebP-Auto-Konvertierung im Backend (Sharp kann das bereits)
  - Responsive Images mit mehreren Größen (Thumbnail, Medium, Full)
  - Lazy Loading für Bilder in Listen und Detail-Galerie

### 4.4 Tests & Absicherung

- [ ] **4.4.1** Unit-Tests (Vitest)
  - Stores: locationsStore, favoritesStore, reviewsStore, userStore
  - Composables: apiCall, useAvatarUrl
  - Utilities: Entfernungsberechnung, Filter-Logik
- [ ] **4.4.2** Integration-Tests
  - API-Calls: Login-Flow, Location-CRUD, Favorites-Sync
  - Store-Interaktionen: Filter → API → Store → UI
- [ ] **4.4.3** E2E-Tests (Playwright)
  - Kritische Flows: Karte laden → Suche → Detail → Favorit setzen
  - Auth-Flows: Registrieren → Login → Profil → Logout
  - Add-Location: Wizard durchlaufen → Location auf Karte sichtbar
- [ ] **4.4.4** Accessibility & Qualität
  - WCAG AA Audit: Kontraste, ARIA-Labels, Keyboard-Navigation
  - Loading-States und Fehlerzustände konsistent prüfen
  - `prefers-reduced-motion` respektieren

### 4.5 i18n-Erweiterung

- [~] **4.5.1** Bestehende Lokalisierung vervollständigen
  - Einige Strings sind noch hardcoded (z. B. in Stores, Error-Messages)
  - Alle UI-Strings durch `t('...')` ersetzen
- [x] **4.5.2** Englisch als zweite Sprache
  - `en.json` mit ~170 übersetzten Keys; Sprachauswahl-Dropdown in SettingsModal
  - Browser-Locale-Erkennung + localStorage-Persistenz; sofortiger Sprachwechsel ohne Reload
- [ ] **4.5.3** Automatische Spracherkennung
  - Browser-Locale erkennen und als Default setzen

### 4.6 Backend-Härtung

- [x] **4.6.1** Rate-Limiting aktiviert
  - Next.js `middleware.ts` für `/api/*` Routen; API: 100 req/15min, Auth: 10 req/15min
  - 429-Response mit Retry-After + X-RateLimit Headers
- [ ] **4.6.2** Geospatial-Indexing
  - MongoDB 2dsphere-Index auf `locations.coordinates` für performante Nearby-Queries
  - Aktuell nutzt `/search/locations/nearby` Turf.js client-seitig (lädt alle Locations)
- [~] **4.6.3** Admin-UI Location-Formular
  - `listSearchableFields` und `admin.step` auf coordinates gesetzt
  - Render-Loop kann Payload-Version-spezifisch sein; bei Persistenz → Payload-Update prüfen

---

## Phase 5: Zusätzliche Vorschläge (neue Features)

### 5.1 Community & Engagement

- [x] **5.1.1** Upvote/Downvote für Reviews
  - ReviewVotes Collection mit 1-Vote-pro-User; Thumbs-Up/Down Buttons in LocationDetail
  - Automatische Zähler-Aktualisierung (upvotes/downvotes auf Reviews)
- [x] **5.1.2** Reputation-System
  - Punkte: Location erstellt (+10), Review geschrieben (+5), Favorisiert (+2)
  - Level: Neuling (0-14), Aktiver Teiler (15-49), Community-Held (50-99), Legende (100+)
  - Anzeige in ProfilPage mit Fortschrittsbalken + in Reviews (Level-Badge am Autorname)
- [x] **5.1.3** Automatische Badge-Vergabe
  - Backend afterChange-Hooks: „Ersteller" (1+ Location), „Verifiziert" (10+ Reviews), „Helfer" (5+ Reviews + 3+ Locations)
  - Badges in ProfilPage mit Icons und Labels angezeigt; Activity-Feed-Eintrag bei Vergabe
- [x] **5.1.4** Community-Validierung
  - LocationConfirmations Collection; 3 Bestätigungen → auto-activate + verified
  - UI-Banner in LocationDetail für unverifizierte Standorte mit „Bestätigen"-Button
- [x] **5.1.5** Aktivitäts-Feed
  - Activities Collection + GET /api/community/feed Endpoint mit Pagination
  - ActivityFeedPage (/activity) mit Timeline, Icons pro Typ, relative Zeitangaben
  - Erreichbar über „Community-Feed"-Button in ProfilPage

### 5.2 Erweiterte Suche & Discovery

- [ ] **5.2.1** Tag-basierte Suche
  - Tags-Feld existiert im Backend; Frontend-Suche darüber ermöglichen
  - Populäre Tags als Quick-Filter-Chips anzeigen
- [ ] **5.2.2** Speicherbare Suchprofile
  - User speichert Filterkombi (z. B. „Foodsharing < 2km, 24/7") als Favoriten-Suche
- [ ] **5.2.3** „In diesem Bereich suchen"
  - Bei Karten-Move: Button einblenden, der Locations für den sichtbaren Bereich nachlädt
  - Aktuell nur Grundstruktur vorhanden
- [ ] **5.2.4** Suchverlauf
  - Letzte 10 Suchen in localStorage speichern und im SearchModal anzeigen

### 5.3 DSGVO & Datenschutz

- [x] **5.3.1** Account-Löschung
  - DELETE /api/users/delete-account mit Cascade-Löschung (Favorites, Reviews, Votes, Reports, Confirmations, Activities)
  - Locations werden anonymisiert (createdBy → null); Bestätigungsdialog in ProfilPage
- [ ] **5.3.2** Datenexport
  - Nutzer kann eigene Daten als JSON/CSV herunterladen (DSGVO Art. 20)
  - Endpoint: `/api/users/:id/export`
- [ ] **5.3.3** Cookie-/Consent-Banner
  - Derzeit kein Consent-Flow; für Mapbox-Tiles und Analytics relevant
- [x] **5.3.4** Datenschutzerklärung & Impressum
  - LegalPage.vue mit ?type=imprint/privacy; SettingsModal verlinkt korrekt
  - DSGVO-konforme Inhalte: Datenerhebung, Rechte, Mapbox-Hinweis

### 5.4 PWA & Mobile-Optimierung

- [ ] **5.4.1** Progressive Web App
  - Web App Manifest + Service Worker für Install-Prompt
  - Offline-fähige Grundfunktionalität (Karte mit gecachten Tiles, gespeicherte Locations)
- [ ] **5.4.2** Push Notifications
  - Web Push API: Benachrichtigung bei neuen Standorten in der Nähe
  - Capacitor Push für native Apps
- [ ] **5.4.3** Deep Links
  - `/location/:id` → App öffnet direkt die Location-Detail-Ansicht
  - Teilen-Link generiert öffnbaren URL
- [ ] **5.4.4** Haptic Feedback
  - `@capacitor/haptics` ist installiert aber nicht genutzt
  - Bei Favorit-Toggle, Location-Erstellen, Bewertung-Abgeben

### 5.5 Backend-Erweiterungen

- [ ] **5.5.1** Admin-Dashboard mit Statistiken
  - Custom Payload Admin View: Neue Standorte/Tag, aktive User, offene Reports
- [ ] **5.5.2** Bulk-Import für Standorte
  - CSV/JSON Upload über Admin-Panel für viele Standorte gleichzeitig
  - Nützlich für Import von OpenStreetMap-Daten oder Partnerdaten
- [ ] **5.5.3** Automatische Spam-Erkennung
  - Ähnlichkeitsprüfung bei neuen Locations (Duplikat-Warnung)
  - Keyword-Filter für Reviews/Reports
- [ ] **5.5.4** API-Dokumentation
  - OpenAPI/Swagger-Spec automatisch aus Payload-Collections generieren
- [ ] **5.5.5** Webhook-System
  - Events bei neuen Standorten, Reviews, Reports an externe Systeme senden

### 5.6 UX-Polish & Micro-Interactions

- [ ] **5.6.1** Erfolgs-Animation (Spec: „wachsende Pflanze")
  - GSAP/Lottie-Animation nach erfolgreichem Location-Erstellen
- [ ] **5.6.2** Skeleton-Loading-States
  - Einheitliche Skeleton-Screens für Listen, Karten-Overlay, Detail-Modal
- [ ] **5.6.3** Standort-Status-Kommentare
  - Schnelle Updates wie „Kühlschrank heute leer" oder „Frisch aufgefüllt"
  - Ohne Bewertung, nur Zustandsmeldung mit Timestamp
- [ ] **5.6.4** Zoom-abhängige Marker-Details
  - Bei hohem Zoom: Marker zeigen Name + Kategorie-Icon
  - Bei niedrigem Zoom: Nur Cluster-Zahl / einfacher Punkt

---

## Kurz: Nächste Schritte (Priorität)

### Prio A — Sofort umsetzbar (niedriger Aufwand, hoher Impact)

1. **4.1.2** Barrierefreiheits-Filter — Backend-Felder existieren, nur Frontend-UI fehlt
2. **4.1.3** Öffnungszeiten-Filter — Rein client-seitig machbar
3. **4.6.1** Rate-Limiting aktivieren — Code existiert, muss nur eingebunden werden
4. **4.6.3** Admin-UI Location-Formular fixen — React Render-Loop Bug
5. **5.3.4** Datenschutzerklärung & Impressum — Platzhalter-Links füllen

### Prio B — Mittlerer Aufwand, wichtig für Produktreife

6. **4.2.1** Onboarding-Flow — Erster Eindruck für neue User
7. **4.1.1** „Beliebte in deiner Nähe" — Discovery verbessern
8. **4.4.1–4.4.3** Tests — Mindestabdeckung für kritische Flows
9. **5.3.1** Account-Löschung — DSGVO-Pflicht
10. **4.5.2** Englisch als zweite Sprache — Reichweite erhöhen

### Prio C — Längerfristig, strategisch

11. **4.3.1–4.3.3** Offline-Support & PWA — Kernversprechen der Spec
12. **5.1.1–5.1.4** Community-Features — Engagement & Vertrauen
13. **5.4.1** PWA-Setup — Install-Prompt, Offline, Push
14. **5.5.1** Admin-Dashboard — Übersicht für Moderation/Betrieb

---

## Referenzen

- Verifizierungsbericht: `.cursor/verification-report.md`
- Ursprünglicher Plan: `.kiro/specs/location-app-enhancement/tasks.md`
- Requirements: `.kiro/specs/location-app-enhancement/requirements.md`
- Feature-Analyse: Stand 25. Feb. 2026 (Cursor Cloud Agent)
