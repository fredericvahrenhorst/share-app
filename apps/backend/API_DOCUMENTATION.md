# API-Dokumentation

## Backend-URL
- **Base URL**: `http://localhost:3000/api`
- **Admin Panel**: `http://localhost:3000/admin`

## Authentifizierung

### Registrierung
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Max Mustermann"
}
```

### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /api/users/logout
```

## Collections

### Users
```http
GET /api/users
GET /api/users/{id}
POST /api/users
PATCH /api/users/{id}
DELETE /api/users/{id}
```

### Categories
```http
GET /api/categories
GET /api/categories/{id}
POST /api/categories
PATCH /api/categories/{id}
DELETE /api/categories/{id}
```

**Filter für aktive Kategorien:**
```http
GET /api/categories?where[isActive][equals]=true
```

### Locations
```http
GET /api/locations
GET /api/locations/{id}
POST /api/locations
PATCH /api/locations/{id}
DELETE /api/locations/{id}
```

**Filter für aktive Standorte:**
```http
GET /api/locations?where[status][equals]=active
```

**Suche nach Standorten:**
```http
GET /api/locations?where[name][contains]=cafe
```

### Reviews
```http
GET /api/reviews
GET /api/reviews/{id}
POST /api/reviews
PATCH /api/reviews/{id}
DELETE /api/reviews/{id}
```

### Favorites
```http
GET /api/favorites
GET /api/favorites/{id}
POST /api/favorites
PATCH /api/favorites/{id}
DELETE /api/favorites/{id}
```

### Reports
```http
GET /api/reports
GET /api/reports/{id}
POST /api/reports
PATCH /api/reports/{id}
DELETE /api/reports/{id}
```

## Query-Parameter

### Pagination
```http
GET /api/locations?page=1&limit=20
```

### Sortierung
```http
GET /api/locations?sort=name
GET /api/locations?sort=-createdAt
```

### Filter
```http
GET /api/locations?where[category][equals]={categoryId}
GET /api/locations?where[status][equals]=active
```

### Populate (Relations)
```http
GET /api/locations?populate[category]=true&populate[images]=true
```

## Geospatial-Queries

### Standorte in der Nähe (Radius-Suche)
```http
GET /api/locations?where[coordinates][near]={latitude},{longitude},{radius}
```

### Bounding Box
```http
GET /api/locations?where[coordinates][within]={minLat},{minLng},{maxLat},{maxLng}
```

## Rate Limiting

- **Standard**: 100 Requests pro 15 Minuten
- **Auth-Endpoints**: 5 Requests pro 15 Minuten

## CORS

Das Backend ist für folgende Origins konfiguriert:
- `http://localhost:8100` (Ionic Frontend)
- `http://localhost:3000` (Admin Panel)

## Beispiel-Requests

### Kategorien abrufen
```bash
curl -X GET "http://localhost:3000/api/categories"
```

### Aktive Standorte abrufen
```bash
curl -X GET "http://localhost:3000/api/locations?where[status][equals]=active"
```

### Standort mit Kategorie erstellen
```bash
curl -X POST "http://localhost:3000/api/locations" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Café Einstein",
    "description": "Historisches Café",
    "category": "categoryId",
    "coordinates": {
      "latitude": 52.5200,
      "longitude": 13.4050
    },
    "address": {
      "street": "Unter den Linden 42",
      "city": "Berlin",
      "postalCode": "10117",
      "country": "Deutschland"
    },
    "status": "active"
  }'
```

## Admin Panel

Das Payload Admin Panel ist unter `http://localhost:3000/admin` verfügbar und bietet eine benutzerfreundliche Oberfläche für:

- Benutzerverwaltung
- Standortverwaltung
- Kategorieverwaltung
- Review-Verwaltung
- Favoriten-Verwaltung
- Report-Verwaltung
- Media-Upload

## Nächste Schritte

1. **Testdaten erstellen** über das Admin Panel
2. **Frontend-Integration** mit Ionic Vue
3. **Geospatial-Index** für MongoDB
4. **Email-Integration** für Benachrichtigungen
5. **Webhooks** für Real-time Updates 