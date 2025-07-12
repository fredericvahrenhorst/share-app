import * as turf from '@turf/turf'

export const locationsEndpoint = {
  path: '/search/locations/nearby',
  method: 'get' as const,
  handler: async (req: any) => {
    const { latitude, longitude, radius = 10, category } = req.query;
    if (!latitude || !longitude) {
      return Response.json({ error: 'Latitude und Longitude sind erforderlich' }, { status: 400 });
    }

    const payload = req.payload;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const r = parseFloat(radius); // Radius in km

    // Alle Locations holen
    const locations = await payload.find({
      collection: 'locations',
      limit: 1000, // ggf. anpassen, falls mehr erwartet werden
      where: category
        ? { category: { equals: category } }
        : {},
    });

    // Zielpunkt als GeoJSON-Point
    const from = turf.point([lat, lng]);
    const options = { units: 'kilometers' as const };

    // Filtere und berechne die Distanz für jede Location
    const locationsWithDistance = locations.docs
      .map((location: any) => {
        console.log(location.coordinates);
        if (
          location.coordinates &&
          Array.isArray(location.coordinates) &&
          location.coordinates.length === 2
        ) {
          const to = turf.point(location.coordinates);
          const distance = turf.distance(from, to, options);

          console.log(distance);
          return { ...location, distance };
        }
        return null;
      })
      .filter((loc: any) => loc && loc.distance <= r)
      .sort((a: any, b: any) => a.distance - b.distance);


    return Response.json({
      success: true,
      data: locationsWithDistance,
      total: locationsWithDistance.length
    });
  }
};
