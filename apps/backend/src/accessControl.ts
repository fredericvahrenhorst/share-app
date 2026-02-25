/**
 * Zentrale Zugriffskontrolle für Collections.
 * Admin (roles.includes('admin')) darf alles; andere User nur begrenzt.
 */

import type { Access, FieldAccess } from 'payload'

export const isAdmin: Access = ({ req }) => {
  if (!req?.user) return false
  const roles = req.user.roles
  if (!roles || !Array.isArray(roles) || roles.length === 0) return true
  return roles.includes('admin')
}

export const isAuthenticated: Access = ({ req }) => Boolean(req?.user)

export const isAdminOrSelf: Access = ({ req, id }) => {
  if (!req?.user) return false
  if (isAdmin({ req })) return true
  const userId = req.user.id == null ? '' : String(req.user.id)
  const docId = id == null ? '' : typeof id === 'string' ? id : String(id)
  return userId === docId
}

export function isAdminOrCreator(
  collectionSlug: string,
  createdByField = 'createdBy',
): Access {
  return async ({ req, id }) => {
    if (!req?.user) return false
    if (isAdmin({ req })) return true
    if (!id) return false
    const doc = await req.payload.findByID({
      collection: collectionSlug as any,
      id: typeof id === 'string' ? id : String(id),
    })
    const creatorId = doc?.[createdByField]
    const creator = typeof creatorId === 'object' ? (creatorId as { id?: string })?.id : creatorId
    return creator != null && String(creator) === String(req.user.id)
  }
}

export function isAdminOrOwner(collectionSlug: string, userField = 'user'): Access {
  return async ({ req, id }) => {
    if (!req?.user) return false
    if (isAdmin({ req })) return true
    if (!id) return false
    const doc = await req.payload.findByID({
      collection: collectionSlug as any,
      id: typeof id === 'string' ? id : String(id),
    })
    const ownerId = doc?.[userField]
    const owner = typeof ownerId === 'object' ? (ownerId as { id?: string })?.id : ownerId
    return owner != null && String(owner) === String(req.user.id)
  }
}

/** Nur Admin darf dieses Feld ändern (für Proof/Moderation-Felder). Geeignet für field.access.update. */
export const adminOnlyFieldUpdate: FieldAccess = (args) => {
  const req = args?.req
  const user = req?.user as { roles?: string[] } | null | undefined
  return Boolean(
    user &&
      (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0 || user.roles.includes('admin')),
  )
}
