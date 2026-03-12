import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLocationsStore } from '../locationsStore'

vi.mock('../../composables/apiCall', () => ({
    default: vi.fn(),
}))

vi.mock('../appStore', () => ({
    useAppStore: () => ({
        geo: { lat: 52.52, long: 13.405, ts: Date.now() },
        mapGeo: null,
        mapZoom: 11,
        radius: 5,
    }),
}))

describe('locationsStore', () => {
    beforeEach(() => {
        localStorage.clear()
        setActivePinia(createPinia())
    })

    it('initializes with empty state', () => {
        const store = useLocationsStore()
        expect(store.locations).toEqual([])
        expect(store.filteredLocations).toEqual([])
        expect(store.categories).toEqual([])
        expect(store.isLoading).toBe(false)
    })

    it('setPopupLocation sets and clears popup', () => {
        const store = useLocationsStore()
        const loc = { id: '1', name: 'Test', coordinates: [13.405, 52.52] }
        store.setPopupLocation(loc)
        expect(store.popupLocation).toEqual(loc)
        store.clearPopupLocation()
        expect(store.popupLocation).toBeNull()
    })

    it('applyFilters merges filter state and persists to localStorage', () => {
        const store = useLocationsStore()
        store.applyFilters({ categories: ['food'], radius: 5 })
        expect(store.filterState.categories).toEqual(['food'])
        expect(store.filterState.radius).toBe(5)
        const saved = JSON.parse(localStorage.getItem('locationFilters'))
        expect(saved.categories).toEqual(['food'])
    })

    it('clearFilters resets to defaults and removes from localStorage', () => {
        const store = useLocationsStore()
        store.applyFilters({ categories: ['food'], radius: 10 })
        store.clearFilters()
        expect(store.filterState.categories).toEqual([])
        expect(store.filterState.radius).toBe(0)
        expect(localStorage.getItem('locationFilters')).toBeNull()
    })

    it('updateFilteredLocations filters by category', () => {
        const store = useLocationsStore()
        store.locations = [
            { id: '1', name: 'A', category: { id: 'food' }, coordinates: [13.4, 52.5] },
            { id: '2', name: 'B', category: { id: 'water' }, coordinates: [13.4, 52.5] },
        ]
        store.applyFilters({ categories: ['food'] })
        expect(store.filteredLocations).toHaveLength(1)
        expect(store.filteredLocations[0].name).toBe('A')
    })

    it('loadCategoriesFromLocations extracts unique categories', () => {
        const store = useLocationsStore()
        store.locations = [
            { id: '1', category: { id: 'food', name: 'Food', color: '#f00', icon: 'restaurant' } },
            { id: '2', category: { id: 'food', name: 'Food', color: '#f00', icon: 'restaurant' } },
            { id: '3', category: { id: 'water', name: 'Water', color: '#00f', icon: 'water' } },
        ]
        store.loadCategoriesFromLocations()
        expect(store.categories).toHaveLength(2)
    })

    it('search state initializes correctly', () => {
        const store = useLocationsStore()
        expect(store.searchResults).toEqual([])
        expect(store.searchQuery).toBe('')
        expect(store.searchLoading).toBe(false)
    })

    it('clearSearch resets search state', () => {
        const store = useLocationsStore()
        store.searchResults = [{ id: '1' }]
        store.searchQuery = 'test'
        store.clearSearch()
        expect(store.searchResults).toEqual([])
        expect(store.searchQuery).toBe('')
    })
})
