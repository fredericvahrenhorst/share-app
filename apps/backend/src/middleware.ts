import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMITS = {
    api: { windowMs: 15 * 60 * 1000, maxRequests: 100 },
    auth: { windowMs: 15 * 60 * 1000, maxRequests: 10 },
}

function getRateLimit(ip: string, config: { windowMs: number; maxRequests: number }) {
    const now = Date.now()
    const key = `${ip}`
    const entry = rateLimitStore.get(key)

    if (entry && now > entry.resetTime) {
        rateLimitStore.delete(key)
    }

    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 0, resetTime: now + config.windowMs })
    }

    const current = rateLimitStore.get(key)!
    current.count++

    return {
        limited: current.count > config.maxRequests,
        remaining: Math.max(0, config.maxRequests - current.count),
        resetTime: current.resetTime,
    }
}

export function middleware(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown'

    const path = request.nextUrl.pathname

    const isAuthRoute = path.startsWith('/api/users/login')
        || path.startsWith('/api/users/first-register')
        || path.startsWith('/api/users/forgot-password')
        || path.startsWith('/api/users/reset-password')

    const config = isAuthRoute ? RATE_LIMITS.auth : RATE_LIMITS.api
    const storeKey = isAuthRoute ? `auth:${ip}` : `api:${ip}`
    const result = getRateLimit(storeKey, config)

    if (result.limited) {
        return NextResponse.json(
            {
                error: 'Zu viele Anfragen',
                message: isAuthRoute
                    ? 'Zu viele Authentifizierungsversuche. Bitte versuche es später erneut.'
                    : 'Zu viele API-Anfragen. Bitte versuche es später erneut.',
                retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
            },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
                },
            },
        )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
    return response
}

export const config = {
    matcher: '/api/:path*',
}
