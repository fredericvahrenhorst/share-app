import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../userStore'

vi.mock('../../composables/apiCall', () => ({
    default: vi.fn(),
}))

describe('userStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        localStorage.clear()
    })

    it('initializes with unauthenticated state when no token', () => {
        const store = useUserStore()
        expect(store.authenticated).toBe(false)
        expect(store.token).toBeNull()
        expect(store.userId).toBeNull()
    })

    it('initializes as authenticated when token and userId exist in localStorage', () => {
        localStorage.setItem('token', 'test-token')
        localStorage.setItem('userId', 'test-user-id')
        setActivePinia(createPinia())
        const store = useUserStore()
        expect(store.authenticated).toBe(true)
        expect(store.token).toBe('test-token')
        expect(store.userId).toBe('test-user-id')
    })

    it('clearUserData resets all auth state', () => {
        localStorage.setItem('token', 'test-token')
        localStorage.setItem('userId', 'test-user-id')
        setActivePinia(createPinia())
        const store = useUserStore()
        store.clearUserData()
        expect(store.authenticated).toBe(false)
        expect(store.token).toBe('')
        expect(store.userId).toBe('')
        expect(store.user).toEqual({})
        expect(localStorage.getItem('token')).toBeNull()
        expect(localStorage.getItem('userId')).toBeNull()
    })
})
