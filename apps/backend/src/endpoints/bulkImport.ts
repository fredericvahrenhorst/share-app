import type { Endpoint } from 'payload'

export const bulkImportEndpoint: Endpoint = {
    path: '/admin/bulk-import',
    method: 'post',
    handler: async (req) => {
        if (!req.user) {
            return Response.json({ error: 'Authentifizierung erforderlich' }, { status: 401 })
        }

        const roles = (req.user as any).roles
        if (!Array.isArray(roles) || !roles.includes('admin')) {
            return Response.json({ error: 'Admin-Berechtigung erforderlich' }, { status: 403 })
        }

        const { payload } = req

        let body: any
        try {
            body = await req.json?.()
        } catch {
            return Response.json({ error: 'Ungültiger JSON-Body' }, { status: 400 })
        }

        if (!body?.locations || !Array.isArray(body.locations)) {
            return Response.json(
                { error: 'Body muss ein "locations" Array enthalten' },
                { status: 400 },
            )
        }

        let imported = 0
        let failed = 0
        const errors: Array<{ index: number; name?: string; error: string }> = []

        for (let i = 0; i < body.locations.length; i++) {
            const locationData = body.locations[i]

            if (!locationData.name || !locationData.coordinates) {
                failed++
                errors.push({
                    index: i,
                    name: locationData.name,
                    error: 'Name und Koordinaten sind erforderlich',
                })
                continue
            }

            try {
                await payload.create({
                    collection: 'locations',
                    data: {
                        ...locationData,
                        createdBy: req.user.id,
                        status: locationData.status || 'active',
                    },
                })
                imported++
            } catch (error: any) {
                failed++
                errors.push({
                    index: i,
                    name: locationData.name,
                    error: error.message || 'Unbekannter Fehler',
                })
            }
        }

        return Response.json({
            imported,
            failed,
            errors,
        })
    },
}
