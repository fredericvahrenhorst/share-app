/**
 * Endpoint für die Suche nach Locations.
 *
 * Dieser Endpoint verarbeitet GET-Anfragen auf /search/locations und ermöglicht die Suche nach Locations
 * anhand eines Suchbegriffs (query), einer Kategorie (category) sowie Paginierung (page, limit).
 *
 * Die Suche erfolgt über mehrere Felder (Name, Adresse, Regeln, Kontaktinformationen).
 * Es werden nur aktive Locations (status: 'active') berücksichtigt.
 */
export const searchEndpoint = {
  path: '/search/locations',
  method: 'get' as const,
  handler: async (req: any) => {
    // Extrahiere Suchparameter aus der Query-URL, setze Default-Werte
    const { query = '', category = '', page = 1, limit = 20 } = req.query;
    const payload = req.payload; // Payload-Instanz für Datenbankzugriff

    // Basis-Filter: Nur aktive Locations berücksichtigen
    const baseQuery = {
      status: { equals: 'active' }
    };

    // whereQuery wird mit weiteren Filtern angereichert
    const whereQuery: any = { ...baseQuery };

    // Falls ein Suchbegriff angegeben ist, erweitere die Query um eine ODER-Suche über mehrere Felder
    if (query.trim()) {
      const searchQuery = query.trim();
      // Suche in folgenden Feldern nach dem Suchbegriff (enthält):
      // name, address.street, address.city, address.postalCode, contact.phone, contact.email, contact.website
      whereQuery.or = [
        { name: { contains: searchQuery } },
        { 'address.street': { contains: searchQuery } },
        { 'address.city': { contains: searchQuery } },
        { 'address.postalCode': { contains: searchQuery } },
        { 'contact.phone': { contains: searchQuery } },
        { 'contact.email': { contains: searchQuery } },
        { 'contact.website': { contains: searchQuery } }
      ];
    }

    // Falls eine Kategorie angegeben ist (und nicht "all"), füge einen Kategorie-Filter hinzu
    if (category && category !== 'all') {
      whereQuery.category = { equals: category };
    }

    try {
      // Führe die Suche in der "locations"-Collection aus
      // - Filter: whereQuery
      // - Paginierung: page, limit
      // - depth: 2 (holt z.B. Kategorie-Details mit)
      // - Sortierung: nach Name
      const response = await payload.find({
        collection: 'locations',
        where: whereQuery,
        page: parseInt(page),
        limit: parseInt(limit),
        depth: 2, // Für Kategorie-Details
        sort: 'name'
      });

      // Rückgabe: Trefferliste und Paginierungs-Infos
      return Response.json({
        success: true,
        data: response.docs,
        pagination: {
          page: response.page,
          totalPages: response.totalPages,
          totalDocs: response.totalDocs,
          hasNextPage: response.hasNextPage,
          hasPrevPage: response.hasPrevPage
        }
      });
    } catch (error: any) {
      // Fehlerbehandlung: Logge Fehler und gib Fehlermeldung zurück
      console.error('Search error:', error);
      return Response.json(
        { error: 'Fehler bei der Suche', details: error.message },
        { status: 500 }
      );
    }
  }
};
