import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFavoritesStore } from '../favoritesStore'

vi.mock('../../composables/apiCall', () => ({
    default: vi.fn(),
}))

vi.mock('../userStore', () => ({
    useUserStore: () => ({
        userId: null,
        authenticated: false,
    }),
}))

describe('favoritesStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('initializes with empty favorites', () => {
        const store = useFavoritesStore()
        expect(store.favorites).toEqual([])
        expect(store.isLoading).toBe(false)
    })

    it('isFavorite returns false for unknown location', () => {
        const store = useFavoritesStore()
        expect(store.isFavorite('unknown-id')).toBe(false)
    })

    it('isFavorite returns true for favorited location', () => {
        const store = useFavoritesStore()
        store.favorites = [
            { id: 'fav1', location: { id: 'loc1' } },
        ]
        expect(store.isFavorite('loc1')).toBe(true)
        expect(store.isFavorite('loc2')).toBe(false)
    })

    it('getFavoriteByLocationId returns correct favorite', () => {
        const store = useFavoritesStore()
        store.favorites = [
            { id: 'fav1', location: { id: 'loc1' } },
            { id: 'fav2', location: { id: 'loc2' } },
        ]
        expect(store.getFavoriteByLocationId('loc1').id).toBe('fav1')
        expect(store.getFavoriteByLocationId('loc3')).toBeUndefined()
    })

    it('favoriteLocationIds returns array of location IDs', () => {
        const store = useFavoritesStore()
        store.favorites = [
            { id: 'fav1', location: { id: 'loc1' } },
            { id: 'fav2', location: { id: 'loc2' } },
        ]
        expect(store.favoriteLocationIds).toEqual(['loc1', 'loc2'])
    })

    it('fetchFavorites clears favorites when not authenticated', async () => {
        const store = useFavoritesStore()
        store.favorites = [{ id: 'old' }]
        await store.fetchFavorites()
        expect(store.favorites).toEqual([])
    })
})
