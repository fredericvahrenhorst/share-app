import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

export async function hapticLight() {
    try {
        await Haptics.impact({ style: ImpactStyle.Light })
    } catch {
        // Fails silently on web
    }
}

export async function hapticMedium() {
    try {
        await Haptics.impact({ style: ImpactStyle.Medium })
    } catch {
        // Fails silently on web
    }
}

export async function hapticSuccess() {
    try {
        await Haptics.notification({ type: NotificationType.Success })
    } catch {
        // Fails silently on web
    }
}
