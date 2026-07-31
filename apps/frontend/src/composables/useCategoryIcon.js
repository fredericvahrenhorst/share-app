import {
    bookOutline,
    constructOutline,
    cubeOutline,
    giftOutline,
    gridOutline,
    hammerOutline,
    leafOutline,
    libraryOutline,
    nutritionOutline,
    restaurantOutline,
    shirtOutline,
    waterOutline,
} from 'ionicons/icons'

const ICON_MAP = {
    'book-outline': bookOutline,
    'library-outline': libraryOutline,
    'construct-outline': constructOutline,
    'leaf-outline': leafOutline,
    'restaurant-outline': restaurantOutline,
    'nutrition-outline': nutritionOutline,
    'shirt-outline': shirtOutline,
    'cube-outline': cubeOutline,
    'gift-outline': giftOutline,
    'water-outline': waterOutline,
    'hammer-outline': hammerOutline,
    'grid-outline': gridOutline,
    // Legacy-Emoji-Fallbacks (ältere Seed-Daten)
    '🥗': nutritionOutline,
    '📦': cubeOutline,
    '📚': bookOutline,
    '👕': shirtOutline,
    '💧': waterOutline,
    '🔧': constructOutline,
    '🛠️': hammerOutline,
    '🌱': leafOutline,
}

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u

/**
 * Resolves a category icon value (Ionicon name or emoji) for display.
 * @param {string|null|undefined} iconValue
 * @returns {{ type: 'ion', icon: string } | { type: 'emoji', emoji: string }}
 */
export function resolveCategoryIcon(iconValue) {
    if (!iconValue || typeof iconValue !== 'string') {
        return { type: 'ion', icon: gridOutline }
    }

    const mapped = ICON_MAP[iconValue]
    if (mapped) {
        return { type: 'ion', icon: mapped }
    }

    if (EMOJI_PATTERN.test(iconValue)) {
        return { type: 'emoji', emoji: iconValue }
    }

    return { type: 'ion', icon: gridOutline }
}

export function useCategoryIcon() {
    return { resolveCategoryIcon }
}
