import { ref } from 'vue'

const isSupported = ref('Notification' in window)
const permission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'default')
const isSubscribed = ref(false)

export default function usePushNotifications() {
    async function requestPermission() {
        if (!isSupported.value) return false
        const result = await Notification.requestPermission()
        permission.value = result
        return result === 'granted'
    }

    function showNotification(title, options = {}) {
        if (permission.value !== 'granted') return
        return new Notification(title, {
            icon: '/favicon.png',
            badge: '/favicon.png',
            ...options,
        })
    }

    async function checkNewNearbyLocations(userGeo, lastCheckTime) {
        if (!userGeo || !lastCheckTime) return
        try {
            const params = new URLSearchParams({
                latitude: userGeo.lat,
                longitude: userGeo.long,
                radius: '5',
            })
            const response = await fetch(
                `${process.env.API_URL || ''}search/locations/nearby?${params.toString()}`
            )
            if (!response.ok) return
            const data = await response.json()
            if (data.success && data.data) {
                const newLocations = data.data.filter(
                    (loc) => new Date(loc.createdAt) > new Date(lastCheckTime)
                )
                if (newLocations.length > 0) {
                    showNotification('Neue Standorte in deiner Nähe!', {
                        body: `${newLocations.length} neue Ressource${newLocations.length > 1 ? 'n' : ''} in der Nähe entdeckt.`,
                        tag: 'new-nearby',
                    })
                }
            }
        } catch (e) {
            // Silently fail
        }
    }

    return {
        isSupported,
        permission,
        isSubscribed,
        requestPermission,
        showNotification,
        checkNewNearbyLocations,
    }
}
