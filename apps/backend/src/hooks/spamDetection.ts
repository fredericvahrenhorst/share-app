const SPAM_KEYWORDS = [
    'http://',
    'https://',
    'www.',
    'buy now',
    'click here',
    'free money',
    'casino',
    'viagra',
]

const EARTH_RADIUS_M = 6371000

function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return EARTH_RADIUS_M * c
}

export async function checkDuplicateLocation(
    payload: any,
    coordinates: [number, number],
    name: string,
): Promise<{ isDuplicate: boolean; similarLocations: any[] }> {
    const locations = await payload.find({
        collection: 'locations',
        where: { status: { equals: 'active' } },
        limit: 0,
        depth: 0,
    })

    const similarLocations: any[] = []
    const nameLower = name.toLowerCase()

    for (const loc of locations.docs) {
        if (!loc.coordinates || !Array.isArray(loc.coordinates) || loc.coordinates.length < 2) {
            continue
        }

        const distance = haversineDistance(
            coordinates[1],
            coordinates[0],
            loc.coordinates[1],
            loc.coordinates[0],
        )

        const isNearby = distance <= 50
        const isNameSimilar =
            typeof loc.name === 'string' &&
            (loc.name.toLowerCase().includes(nameLower) || nameLower.includes(loc.name.toLowerCase()))

        if (isNearby && isNameSimilar) {
            similarLocations.push({
                id: loc.id,
                name: loc.name,
                distance: Math.round(distance),
            })
        }
    }

    return {
        isDuplicate: similarLocations.length > 0,
        similarLocations,
    }
}

export function checkSpamContent(text: string): { isSpam: boolean; reason: string } {
    if (!text || typeof text !== 'string') {
        return { isSpam: false, reason: '' }
    }

    const lowerText = text.toLowerCase()

    for (const keyword of SPAM_KEYWORDS) {
        if (lowerText.includes(keyword.toLowerCase())) {
            return {
                isSpam: true,
                reason: `Verdächtiger Inhalt erkannt: "${keyword}"`,
            }
        }
    }

    return { isSpam: false, reason: '' }
}
