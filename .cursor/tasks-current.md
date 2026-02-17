# ShareApp – Aktuelle Task-Liste (Projektstand)

Basiert auf dem Verifizierungsbericht (`.cursor/verification-report.md`).  
Begriffe im Code: **Location** (nicht Resource). Stand: Februar 2025.

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
  - Route öffnen, Favorit (lokal), Melden, Teilen – teils vorhanden

- [x] **6. Kategorien-Seite**
  - CategoriesPage mit Grid; Kategorien aus Locations abgeleitet; Klick filtert/navigiert

- [x] **7. Backend Auth**
  - Payload Users mit auth; userStore (login, logout, getUserData, Token) vorhanden

---

## Phase 2: Platzhalter bereinigen & anbinden (nächste Schritte)

### 2.1 FavoritesPage an echte Daten anbinden

- [x] **2.1.1** Favorites-API im Frontend nutzen
  - GET Favoriten des eingeloggten Users (Payload REST oder eigenes Endpoint)
  - locationsStore.favorites mit API synchronisieren (oder eigener favoritesStore)
- [x] **2.1.2** FavoritesPage umbauen
  - Dummy-Liste (Café Central, etc.) entfernen
  - Liste aus Store/API anzeigen; leeren Zustand („Keine Favoriten“) beibehalten
- [x] **2.1.3** Favorit hinzufügen/entfernen
  - In LocationDetail: Favorit-Button mit POST/DELETE zu `/api/favorites` (oder Payload REST)
  - FavoritesPage und Store nach Aktion aktualisieren

### 2.2 ProfilPage an userStore/API anbinden

- [x] **2.2.1** Profil-Daten aus userStore/API
  - Beim Laden: userStore.getUserData() aufrufen (wenn eingeloggt)
  - Anzeige: user.name, user.email, user.avatar (echte Daten); Gast-Zustand wenn nicht eingeloggt
- [x] **2.2.2** Dummy-Daten entfernen
  - „Max Mustermann“, feste Stats (12/45/8) entfernen
  - Stats aus API/Store (z. B. Favoriten-Anzahl, besuchte Locations, Bewertungen) sofern vorhanden
- [x] **2.2.3** Aktionen anbinden
  - Abmelden → userStore.logout() + Redirect/Navigation
  - Einstellungen/Datenschutz/Hilfe/Über: entweder echte Routen/Modals oder klar „In Entwicklung“

### 2.3 LocationDetail: Dummy-Inhalte entfernen

- [x] **2.3.1** Bewertungs-Block
  - Entweder echte Reviews-Daten anzeigen (sobald Reviews-API genutzt wird) oder Block ausblenden / „Bewertungen kommen bald“ anzeigen
  - Feste „4.9 (67 Bewertungen)“ entfernen
- [x] **2.3.2** Beschreibung
  - Nur echte `popupLocation.description` (richText) anzeigen; Lorem-ipsum-Text entfernen

### 2.4 Kategorien optional verbessern

- [ ] **2.4.1** (Optional) GET `/api/categories` für CategoriesPage nutzen
  - Sortierung nach sortOrder, Berücksichtigung isActive
  - Kategorien nicht nur aus Locations ableiten

---

## Phase 3: Fehlende Kernfeatures (nach Phase 2)

### 3.1 Add-Location-Flow (Ressource hinzufügen)

- [ ] **3.1.1** AddLocationFlow / AddResourceFlow-Komponente
  - Step-by-Step-Wizard (Karte → Kategorie → Beschreibung → Bilder)
  - Map-Picker für Koordinaten, Kategorie-Auswahl, Pflichtfelder-Validierung
- [ ] **3.1.2** Bild-Upload & Absenden
  - Upload-Komponente mit Vorschau; POST zu `/api/locations` (Payload REST)
  - Success-Anzeige (z. B. Animation); Fehlerbehandlung

### 3.2 Auth-UI (Login/Register)

- [x] **3.2.1** Login-/Register-Seiten oder Modals
  - Anbindung an bestehende Payload-Auth (userStore.login)
  - Nach Login: Redirect, Profil/Favoriten nutzbar
- [ ] **3.2.2** Passwort zurücksetzen
  - Sofern in Payload/Backend vorgesehen, Flow im Frontend anbieten

### 3.3 Reviews & Bewertungen

- [ ] **3.3.1** Reviews-Collection im Frontend nutzen
  - Anzeige in LocationDetail (sofern 2.3.1 noch nicht erledigt)
  - Bewertung abgeben (eingeloggt)
- [ ] **3.3.2** Moderation/Reporting
  - „Standort melden“ mit Reports-API verbinden; ggf. Moderation im Admin

---

## Phase 4: Erweiterungen & Qualität

### 4.1 Kategorie-Filter & UX

- [ ] „Beliebte in deiner Nähe“ auf Kategorien-Seite (nearby-Locations pro Kategorie)
- [ ] Barrierefreiheits-Filter (accessibility) in LocationFilter
- [ ] Öffnungszeiten-Filter („Jetzt geöffnet“, 24/7)
- [ ] Breadcrumb-Navigation für aktive Filter

### 4.2 Onboarding & Hilfe

- [ ] Onboarding (max. 3 Screens, Privacy, Standort-Erklärung)
- [ ] „So funktioniert die Karte“ / kontextuelle Tooltips
- [ ] Persistenz: Onboarding erledigt, Benachrichtigungs-/Privacy-Einstellungen

### 4.3 Offline & Performance

- [ ] IndexedDB-Caching für Locations; Sync-Strategie
- [ ] Offline-Indikator; ggf. Offline-Queue für Aktionen
- [ ] Lazy Loading (Marker/Bilder), Service Worker für statische Assets

### 4.4 Tests & Absicherung

- [ ] Unit-Tests: Marker/Clustering, Store-Actions, Composables
- [ ] Integration: API-Calls, Filter/Suche
- [ ] E2E: Karte laden → Suche → Detail → Favorit (kritische Flows)
- [ ] WCAG AA prüfen; Loading-/Fehlerzustände konsistent

---

## Kurz: Nächste Schritte (Priorität)

1. **FavoritesPage** – Dummy raus, Anbindung an Favorites-API und Store.
2. **ProfilPage** – Dummy raus, userStore + echte User-Daten; Logout anbinden.
3. **LocationDetail** – Lorem ipsum und feste Bewertung entfernen; nur echte Daten oder „Coming soon“.
4. Danach: **Add-Location-Flow**, **Auth-UI** (Login/Register), **Reviews** in LocationDetail.
5. Optional: **Kategorien** über GET `/api/categories`, **Onboarding**, **Offline**, **Tests**.

---

## Referenzen

- Verifizierungsbericht: `.cursor/verification-report.md`
- Ursprünglicher Plan: `.kiro/specs/location-app-enhancement/tasks.md`
- Requirements: `.kiro/specs/location-app-enhancement/requirements.md`
