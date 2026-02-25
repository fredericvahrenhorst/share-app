# Verifizierungsbericht: Tasks vs. Projektstand

Stand: Februar 2025. Abgleich der `tasks.md` mit der tatsächlichen Codebasis und API.

---

## 1. Naming: „Resource“ vs. „Location“

In den **Requirements/Tasks** heißt das zentrale Konzept **Resource** (Ressourcen-Entdeckung, ResourceDetailModal, AddResourceFlow).  
In der **Implementierung** wird durchgängig **Location** verwendet:

| Tasks/Requirements | Codebase |
|--------------------|----------|
| Resource, resources | Location, locations |
| resourcesStore | locationsStore.js |
| ResourceMarker / ResourceDetailModal | LocationMap (Marker), LocationDetail.vue (Modal) |
| GET /api/resources | GET /api/locations (Payload REST) + GET /api/search/locations (custom) |

**Fazit:** Konzept identisch; Bezeichnung im Code einheitlich „Location“. Tasks weiterhin mit „Resource“ lesbar; bei neuen Tickets „Location“ verwenden.

---

## 2. Backend – Was existiert

### Collections (Payload CMS)

- **Locations** – Vollständig: name, description (richText), category (relation), coordinates (point), address (group), images (array/upload), openingHours (24/7 + schedule), rules, tags, accessibility, contact, status, createdBy, verified.
- **Categories** – name, description, icon, color, isActive, sortOrder.
- **Users** – Auth, name, avatar, bio, location (group), badges, preferences, stats.
- **Media** – Standard-Upload.
- **Favorites** – user (relation), location (relation), createdAt.
- **Reviews** – Vorhanden (nicht im Detail geprüft).
- **Reports** – Vorhanden (nicht im Detail geprüft).

### API-Endpunkte

| Endpunkt | Typ | Status | Verwendung Frontend |
|----------|-----|--------|---------------------|
| GET/POST …/api/locations | Payload REST | ✅ 200 | locationsStore.getAllLocations() (limit 9999, select) |
| GET …/api/categories | Payload REST | ✅ 200 | Nicht direkt; Kategorien aus Locations abgeleitet |
| GET …/api/search/locations | Custom (search.ts) | ✅ 200 | locationsStore.searchLocations() (query, category, page, limit) |
| GET …/api/search/locations/nearby | Custom (locations.ts) | ✅ 200 | locationsStore.getNearbyLocations(radius, category) |

Alle vier getesteten Endpunkte antworten mit **HTTP 200**. Seed-Daten vorhanden (seed-rest.ts): Users, Categories (Café, Restaurant, Bar, Museum, Park, …), Locations („Deutschland Location 1 …“, Koordinaten, Kategorien).

---

## 3. Frontend – Bereiche: Real vs. Platzhalter

### Vollständig angebunden (echte Daten/API)

- **StartPage / Karte**
  - Lädt Locations via `locationsStore.getAllLocations()` (Payload REST).
  - Zeigt sie in `LocationMap` mit Mapbox, kategoriebasierten Markern, User-Position, Radius-Kreis.
- **LocationMap**
  - Suchleiste → öffnet SearchModal.
  - Filter-Button → öffnet LocationFilter.
  - Marker-Klick → LocationDetail-Modal (popupLocation).
  - Echte Daten: coordinates, category (name, color, icon), openingHours, etc.
- **SearchModal**
  - Tab „Lokal“: `searchLocations()` → GET /api/search/locations (query, category, Pagination).
  - Tab „Extern“: Geocoding (Mapbox/Adresse) für Kartenzentrierung.
  - Kategorien aus Store (von Locations abgeleitet).
- **LocationFilter**
  - Filter nach Kategorien und Radius; Speicherung in localStorage; `updateFilteredLocations()`.
- **LocationDetail (Modal)**
  - Zeigt popupLocation (name, category, address, openingHours, rules, contact, …).
  - **Platzhalter/Beispiel:** Bewertung „4.9 (67 Bewertungen)“ und „Lorem ipsum“-Text fest eingetragen; Bild optional (popupLocation.image).
- **CategoriesPage**
  - Kategorien aus `locationsStore.categories` (aus geladenen Locations abgeleitet, nicht aus GET /api/categories).
  - Klick auf Kategorie → `selectCategory(category)` (Filter/Navigation).
  - „Alle Kategorien anzeigen“ → `showAllCategories()`.

### Nur Platzhalter / Beispielinhalte (keine echte Backend-Anbindung)

- **FavoritesPage**
  - **Feste Beispieldaten:** z. B. „Café Central“, „Restaurant Zum Goldenen Löwen“, „Apotheke am Markt“ (via.placeholder.com).
  - Keine Nutzung von `locationsStore.favorites`, kein GET/POST zu /api/favorites.
  - Backend: Collection `Favorites` (user, location) existiert, aber Frontend nutzt sie nicht.
- **ProfilPage**
  - **Fester Nutzer:** „Max Mustermann“, max.mustermann@example.com, Platzhalter-Avatar.
  - **Feste Statistiken:** favoriten: 12, besucht: 45, bewertungen: 8.
  - Einstellungen/Benachrichtigungen/Datenschutz/Hilfe/Über/Abmelden nur `console.log` – keine echte Logik.
  - userStore (login/logout/getUserData) existiert, wird auf ProfilPage nicht angebunden.
- **LocationDetail**
  - Wie oben: Bewertungs-Block und Beschreibungstext teilweise Dummy (Lorem ipsum, feste 4.9/67).

### Teilweise umgesetzt

- **Kategorien**
  - Kategorien-Übersicht und -Auswahl funktionieren, aber Kategorien kommen nur indirekt aus Locations (nicht aus eigener Categories-API). Dedizierter GET /api/categories würde z. B. Sortierung und inaktive Kategorien sauber abbilden.
- **Favoriten**
  - Store hat `favorites`-State und Persistenz (laut Code z. B. visitedlocations in localStorage), aber FavoritesPage ignoriert den Store und zeigt nur Dummy-Liste.
- **Auth/Profil**
  - userStore: login, logout, getUserData, Token; Backend Users mit auth. Profil-Seite nutzt das nicht.

---

## 4. Abgleich mit tasks.md (Kurz)

- **Task 1–4, 6.1, 7:** Als erledigt markiert – passend: Struktur, Map, Marker, Tooltip, Ressourcen-Daten (Locations), Detail-Modal, Suche, Filter, Kategorien-Grid.
- **Task 3.2:** „GET /api/resources“ → real: Payload `/api/locations` + custom `/api/search/locations` und `/api/search/locations/nearby`.
- **Task 4.2:** Route öffnen, Favorit, Melden, Teilen – im LocationDetail/Map teils vorhanden; Favoriten-Liste (FavoritesPage) ist nur Dummy.
- **Task 5 (Add Resource Flow):** Nicht umgesetzt – korrekt als offen markiert.
- **Task 6.2 (Kategorie-Filter-Integration):** Kategorie-Filter im Store und Filter-Modal vorhanden; „Beliebte in deiner Nähe“, Breadcrumbs, Accessibility-Filter fehlen oder sind offen.
- **Task 8 (Auth/Profil):** Backend Auth vorhanden; Frontend Profil und Favoriten-Seiten sind Platzhalter.
- **Task 9–12:** Offen – keine Community-Features (Reviews/Badges), kein Onboarding, kein Offline/IndexedDB, keine umfassenden Tests.

---

## 5. API-Test (lokal)

Voraussetzung: Backend läuft (z. B. Port 3000).

```bash
# Payload REST
curl -s "http://localhost:3000/api/locations?limit=2"       # 200, docs[] mit Seed-Daten
curl -s "http://localhost:3000/api/categories?limit=5"      # 200, docs[] (Café, Restaurant, Bar, …)

# Custom Endpoints
curl -s "http://localhost:3000/api/search/locations?query=&page=1&limit=5"   # 200, success, data[], pagination
curl -s "http://localhost:3000/api/search/locations/nearby?latitude=52.52&longitude=13.405&radius=10"  # 200, success, data[]
```

Alle vier Aufrufe lieferten **HTTP 200** und passende JSON-Struktur.

---

## 6. Empfehlungen (kurz)

1. **FavoritesPage** an `locationsStore.favorites` und API `Favorites` (Lese-/Schreibzugriff) anbinden; Platzhalter-Liste entfernen.
2. **ProfilPage** an userStore und echte User-/Profil-API anbinden; Dummy user/stats entfernen.
3. **LocationDetail** Bewertungs-Block und Beschreibung nur aus echten Daten (z. B. Reviews) oder klar als „Coming soon“ kennzeichnen; Lorem ipsum entfernen.
4. **Kategorien:** Optional GET /api/categories für Kategorien-Seite nutzen (sortOrder, isActive), statt nur aus Locations abzuleiten.
5. **Tasks.md** bei Bedarf um Hinweis ergänzen: „Im Code: Location (nicht Resource)“ und „FavoritesPage/ProfilPage derzeit Platzhalter“.

---

## 7. Projektstruktur (Kern)

- **Frontend:** `apps/frontend` – Ionic Vue 8, Vite, Pinia, Mapbox, Tailwind. Einstieg: StartPage → LocationMap; Router: home, kategorien, favoriten, profil.
- **Backend:** `apps/backend` – Payload CMS (Next.js), MongoDB. Collections unter `src/collections/`, Custom Endpoints unter `src/endpoints/`.
- **Shared:** `packages/shared` – Typen/Utils.

Alle genannten Befunde beziehen sich auf den Stand der bereitgestellten Dateien und der durchgeführten API-Tests.
