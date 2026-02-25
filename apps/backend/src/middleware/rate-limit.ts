import { Request, Response, NextFunction } from 'express'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  message: string
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export const rateLimit = (config: RateLimitConfig) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    
    // Cleanup alte Einträge
    if (store[key] && now > store[key].resetTime) {
      delete store[key]
    }
    
    // Erstelle neuen Eintrag falls nicht vorhanden
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    // Erhöhe Counter
    store[key].count++
    
    // Prüfe Limit
    if (store[key].count > config.maxRequests) {
      return res.status(429).json({
        error: 'Zu viele Anfragen',
        message: config.message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      })
    }
    
    // Setze Headers
    res.setHeader('X-RateLimit-Limit', config.maxRequests)
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - store[key].count))
    res.setHeader('X-RateLimit-Reset', Math.ceil(store[key].resetTime / 1000))
    
    next()
  }
}

// Vordefinierte Konfigurationen
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 100,
  message: 'Zu viele API-Anfragen. Bitte versuche es später erneut.'
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 5,
  message: 'Zu viele Authentifizierungsversuche. Bitte versuche es später erneut.'
}) 