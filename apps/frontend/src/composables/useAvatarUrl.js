/**
 * Liefert die vollständige Avatar-URL aus einem Payload user.avatar (oder media-Objekt).
 * @param {object|number|null} avatar - user.avatar (populated oder ID)
 * @returns {string} URL oder leerer String
 */
export default function useAvatarUrl(avatar) {
    if (!avatar) return ''
    const url = typeof avatar === 'object' ? avatar?.url : null
    if (!url) return ''
    return url.startsWith('http') ? url : `${(process.env.API_URL || '').replace(/\/api\/?$/, '')}${url}`
}
