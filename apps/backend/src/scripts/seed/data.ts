import type { SeedUserInput } from './helpers'

export type CategorySeed = {
    key: string
    name: string
    description: string
    icon: string
    color: string
    sortOrder: number
}

export type LocationSeed = {
    key: string
    name: string
    categoryKey: string
    description: string
    coordinates: [number, number] // [lng, lat]
    address: {
        street: string
        city: string
        postalCode: string
        country: string
    }
    openingHours:
        | { is24_7: true; schedule?: never }
        | {
              is24_7: false
              schedule: Array<{ day: string; open: string; close: string }>
          }
    rules: string
    tags: string[]
    accessibility: {
        wheelchairAccessible: boolean
        accessibleToilet: boolean
        accessibleParking: boolean
    }
    contact: {
        phone?: string
        email?: string
        website?: string
    }
    status: 'active' | 'pending'
    verified: boolean
    creatorEmail: string
    /** Pending locations that should get enough confirmations to become verified */
    needsConfirmations?: boolean
}

export type ReviewTemplate = {
    rating: number
    comment: string
}

export const WEEKDAYS_DAY = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
] as const

export function weekdaySchedule(
    open: string,
    close: string,
): Array<{ day: string; open: string; close: string }> {
    return WEEKDAYS_DAY.map((day) => ({ day, open, close }))
}

export function fullWeekSchedule(
    open: string,
    close: string,
): Array<{ day: string; open: string; close: string }> {
    const days = [
        ...WEEKDAYS_DAY,
        'saturday',
        'sunday',
    ] as const
    return days.map((day) => ({ day, open, close }))
}

export const SEED_CATEGORIES: CategorySeed[] = [
    {
        key: 'fairteiler',
        name: 'Fairteiler',
        description: 'Öffentliche Foodsharing-Regale und Kühlschränke für gerettete Lebensmittel.',
        icon: 'nutrition-outline',
        color: '#275243',
        sortOrder: 1,
    },
    {
        key: 'givebox',
        name: 'Givebox',
        description: 'Umsonstläden und Tauschboxen für Gegenstände, die noch gut sind.',
        icon: 'cube-outline',
        color: '#8B5A2B',
        sortOrder: 2,
    },
    {
        key: 'buecherboxx',
        name: 'BücherboXX',
        description: 'Öffentliche Bücherschränke zum Mitnehmen und Hineinstellen.',
        icon: 'book-outline',
        color: '#3B5B8A',
        sortOrder: 3,
    },
    {
        key: 'kleidertausch',
        name: 'Kleidertausch',
        description: 'Tauschregale und -ecken für Kleidung und Textilien.',
        icon: 'shirt-outline',
        color: '#9B4D6C',
        sortOrder: 4,
    },
    {
        key: 'trinkwasser',
        name: 'Trinkwasser',
        description: 'Kostenlose Trinkwasserstellen und Refill-Partner.',
        icon: 'water-outline',
        color: '#2A7F9E',
        sortOrder: 5,
    },
    {
        key: 'reparaturcafe',
        name: 'Reparaturcafé',
        description: 'Gemeinschaftliche Reparaturangebote für Elektro, Textil und mehr.',
        icon: 'construct-outline',
        color: '#C45C26',
        sortOrder: 6,
    },
    {
        key: 'werkzeug',
        name: 'Werkzeugverleih',
        description: 'Bibliotheken und Stationen zum Ausleihen von Werkzeug und Geräten.',
        icon: 'hammer-outline',
        color: '#5C4A3A',
        sortOrder: 7,
    },
    {
        key: 'garten',
        name: 'Community-Garten',
        description: 'Gemeinschaftsgärten, Saatgut-Tausch und Ernte-Sharing.',
        icon: 'leaf-outline',
        color: '#3D7A45',
        sortOrder: 8,
    },
]

export const SEED_USERS: SeedUserInput[] = [
    {
        email: 'admin@shareapp.local',
        password: 'admin123',
        name: 'ShareApp Admin',
        roles: ['admin', 'user'],
        bio: 'Administriert die ShareApp-Testdatenbank und pflegt Kategorien.',
        city: 'Bremen',
        country: 'Deutschland',
    },
    {
        email: 'test@example.com',
        password: 'test123',
        name: 'Test User',
        roles: ['admin', 'user'],
        bio: 'Haupt-Testaccount für Frontend und API. Teilt gerne Ressourcen in Bremen.',
        city: 'Bremen',
        country: 'Deutschland',
    },
    {
        email: 'anna@shareapp.local',
        password: 'demo1234',
        name: 'Anna Berger',
        roles: ['user'],
        bio: 'Foodsaverin und Fairteiler-Patín. Retten statt wegwerfen.',
        city: 'Bremen',
    },
    {
        email: 'ben@shareapp.local',
        password: 'demo1234',
        name: 'Ben Hoffmann',
        roles: ['user'],
        bio: 'Organisiert Kleidertausch und Giveboxen im Viertel.',
        city: 'Bremen',
    },
    {
        email: 'clara@shareapp.local',
        password: 'demo1234',
        name: 'Clara Neumann',
        roles: ['user'],
        bio: 'Bücherwurm und BücherboXX-Fan. Immer auf der Suche nach guten Geschichten.',
        city: 'Bremen',
    },
    {
        email: 'david@shareapp.local',
        password: 'demo1234',
        name: 'David Krüger',
        roles: ['user'],
        bio: 'Repariert Geräte im Café und leiht Werkzeug aus.',
        city: 'Berlin',
    },
    {
        email: 'emma@shareapp.local',
        password: 'demo1234',
        name: 'Emma Richter',
        roles: ['user'],
        bio: 'Gärtnerin im Community-Garten. Saatgut teilen ist Herzenssache.',
        city: 'Berlin',
    },
    {
        email: 'felix@shareapp.local',
        password: 'demo1234',
        name: 'Felix Wagner',
        roles: ['user'],
        bio: 'Refill-Enthusiast – Flasche dabei, Plastik reduzieren.',
        city: 'Bremen',
    },
]

export const REVIEW_COMMENTS: ReviewTemplate[] = [
    { rating: 5, comment: 'Immer gut bestückt, sauber und freundliche Nachbarschaft.' },
    { rating: 5, comment: 'Super Ort zum Teilen. Heute frisches Obst und Brot gefunden.' },
    { rating: 4, comment: 'Sehr hilfreich. Bitte keine abgelaufenen Produkte einstellen.' },
    { rating: 4, comment: 'Guter Standort, etwas versteckt, aber lohnt sich.' },
    { rating: 3, comment: 'Oft leer, lohnt sich vor allem morgens.' },
    { rating: 5, comment: 'Tolle Initiative. Hier funktioniert Sharing wirklich.' },
    { rating: 4, comment: 'Regelmäßig neue Sachen. Regeln werden meist eingehalten.' },
    { rating: 2, comment: 'Leider manchmal unordentlich. Mehr Achtsamkeit wäre gut.' },
    { rating: 5, comment: 'Barrierefrei erreichbar und gut beschildert.' },
    { rating: 4, comment: 'Perfekt für Spontanes. Danke an die Patinnen und Paten.' },
    { rating: 3, comment: 'Okay, aber Öffnungszeiten bitte klarer kommunizieren.' },
    { rating: 5, comment: 'Ein Vorbild fürs Viertel – weiter so!' },
]

export const STATUS_MESSAGES = [
    { type: 'status_update' as const, message: 'Heute gut gefüllt – Obst und Brot vorhanden.' },
    { type: 'info' as const, message: 'Bitte Kühlkette beachten und Tür wieder schließen.' },
    { type: 'warning' as const, message: 'Vorübergehend wenig Platz – nur noch Kleinigkeiten.' },
    { type: 'status_update' as const, message: 'Frisch aufgeräumt und desinfiziert.' },
    { type: 'info' as const, message: 'Neue Regale eingebaut, mehr Platz zum Teilen.' },
]

export const SEED_LOCATIONS: LocationSeed[] = [
    // Fairteiler
    {
        key: 'fair-neustadt',
        name: 'Fairteiler Neustadt',
        categoryKey: 'fairteiler',
        description:
            'Öffentlicher Kühlschrank und Regal im Hinterhof. Gerettete Lebensmittel zum Mitnehmen – bitte MHD prüfen und sauber hinterlassen.',
        coordinates: [8.7945, 53.0662],
        address: {
            street: 'Neustadtswall 28',
            city: 'Bremen',
            postalCode: '28199',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Nur genießbare Lebensmittel. Keine Rohfleischprodukte. Kühlschranktür schließen.',
        tags: ['foodsharing', 'kühlschrank', '24/7'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: { email: 'neustadt@fairteiler.local' },
        status: 'active',
        verified: true,
        creatorEmail: 'anna@shareapp.local',
    },
    {
        key: 'fair-walle',
        name: 'Foodsharing Kühlschrank Walle',
        categoryKey: 'fairteiler',
        description:
            'Nachbarschafts-Fairteiler an der Waller Heerstraße. Regelmäßig von Foodsavern befüllt.',
        coordinates: [8.7762, 53.1054],
        address: {
            street: 'Waller Heerstraße 95',
            city: 'Bremen',
            postalCode: '28219',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: fullWeekSchedule('08:00', '22:00') },
        rules: 'Lebensmittel kennzeichnen. Verpackungen mitnehmen oder trennen.',
        tags: ['foodsharing', 'nachbarschaft'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: false,
            accessibleParking: true,
        },
        contact: { phone: '+49 421 5550101' },
        status: 'active',
        verified: true,
        creatorEmail: 'anna@shareapp.local',
    },
    {
        key: 'fair-friedrichshain',
        name: 'Fairteiler Boxhagener Platz',
        categoryKey: 'fairteiler',
        description:
            'Berliner Foodsharing-Station nahe Boxhagener Platz. Oft Brot, Obst und Konserven.',
        coordinates: [13.4508, 52.5142],
        address: {
            street: 'Boxhagener Straße 16',
            city: 'Berlin',
            postalCode: '10245',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Gemeinschaftsraum teilen. Keine Alkoholflaschen ohne Kennzeichnung.',
        tags: ['foodsharing', 'berlin', 'kühlschrank'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: false,
        },
        contact: { email: 'boxhagen@fairteiler.local' },
        status: 'pending',
        verified: false,
        creatorEmail: 'david@shareapp.local',
        needsConfirmations: true,
    },
    // Givebox
    {
        key: 'give-ostertor',
        name: 'Givebox Ostertor',
        categoryKey: 'givebox',
        description:
            'Kleine Umsonstbox für Bücher, Küchenzeug und Deko. Nimm mit, was du brauchst – bring, was du nicht mehr nutzt.',
        coordinates: [8.8198, 53.0721],
        address: {
            street: 'Ostertorsteinweg 48',
            city: 'Bremen',
            postalCode: '28203',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Nur saubere, funktionierende Gegenstände. Keine Elektroschrott.',
        tags: ['umsonst', 'tausch', 'givebox'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: true,
        creatorEmail: 'ben@shareapp.local',
    },
    {
        key: 'give-findorff',
        name: 'Umsonstladen Findorff',
        categoryKey: 'givebox',
        description:
            'Nachbarschaftsladen mit Regalen für Haushalt, Spielzeug und Kleinmöbel. Ehrenamtlich betreut.',
        coordinates: [8.8012, 53.0988],
        address: {
            street: 'Findorffstraße 22',
            city: 'Bremen',
            postalCode: '28215',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [
                ...weekdaySchedule('15:00', '19:00'),
                { day: 'saturday', open: '11:00', close: '15:00' },
            ],
        },
        rules: 'Max. 3 Gegenstände pro Besuch mitnehmen. Spenden willkommen.',
        tags: ['umsonstladen', 'haushalt'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: true,
        },
        contact: {
            email: 'findorff@givebox.local',
            phone: '+49 421 5550202',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'ben@shareapp.local',
    },
    {
        key: 'give-kreuzberg',
        name: 'Givebox Bergmannkiez',
        categoryKey: 'givebox',
        description: 'Öffentliche Tauschbox im Hinterhof. Besonders beliebt für Küchenutensilien.',
        coordinates: [13.4102, 52.4895],
        address: {
            street: 'Bergmannstraße 12',
            city: 'Berlin',
            postalCode: '10961',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Kein Müll. Defekte Geräte bitte zum Wertstoffhof.',
        tags: ['givebox', 'berlin', 'tausch'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: false,
        creatorEmail: 'emma@shareapp.local',
    },
    // BücherboXX
    {
        key: 'book-vahr',
        name: 'BücherboXX Vahr',
        categoryKey: 'buecherboxx',
        description:
            'Öffentlicher Bücherschrank am Stadtteilzentrum. Romane, Kinderbücher und Magazine.',
        coordinates: [8.8901, 53.0789],
        address: {
            street: 'Kurt-Schumacher-Allee 5',
            city: 'Bremen',
            postalCode: '28329',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Bücher in gutem Zustand. Keine nassen oder verschimmelten Exemplare.',
        tags: ['bücher', 'lesen', 'öffentlich'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: true,
        },
        contact: {},
        status: 'active',
        verified: true,
        creatorEmail: 'clara@shareapp.local',
    },
    {
        key: 'book-schwachhausen',
        name: 'Bücherschrank Schwachhausen',
        categoryKey: 'buecherboxx',
        description: 'Holzschrank im Vorgarten – jederzeit zugänglich. Besonders viele Kinderbücher.',
        coordinates: [8.8412, 53.0891],
        address: {
            street: 'Schwachhauser Heerstraße 120',
            city: 'Bremen',
            postalCode: '28213',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Leise sein (Wohngebiet). Schrank immer schließen.',
        tags: ['bücher', 'kinderbücher'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: { email: 'schwachhausen@buecher.local' },
        status: 'active',
        verified: true,
        creatorEmail: 'clara@shareapp.local',
    },
    {
        key: 'book-prenzlauer',
        name: 'BücherboXX Prenzlauer Berg',
        categoryKey: 'buecherboxx',
        description: 'Klassiker und Sachbücher im öffentlichen Schrank an der Danziger Straße.',
        coordinates: [13.4245, 52.5398],
        address: {
            street: 'Danziger Straße 33',
            city: 'Berlin',
            postalCode: '10435',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Bitte stapeln und Schrank nicht überfüllen.',
        tags: ['bücher', 'berlin'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: false,
        creatorEmail: 'felix@shareapp.local',
    },
    // Kleidertausch
    {
        key: 'clothes-neustadt',
        name: 'Kleidertauschecke Neustadt',
        categoryKey: 'kleidertausch',
        description:
            'Regale für saubere Kleidung aller Größen. Saisonal oft gut gefüllt mit Jacken und Schuhen.',
        coordinates: [8.7888, 53.0611],
        address: {
            street: 'Große Straße 14',
            city: 'Bremen',
            postalCode: '28199',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: weekdaySchedule('10:00', '20:00') },
        rules: 'Nur gewaschene Kleidung. Unterwäsche und stark verschlissene Stücke bitte nicht.',
        tags: ['kleidung', 'tausch', 'textil'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: { email: 'kleidung@neustadt.local' },
        status: 'active',
        verified: true,
        creatorEmail: 'ben@shareapp.local',
    },
    {
        key: 'clothes-huchting',
        name: 'Textil-Tausch Huchting',
        categoryKey: 'kleidertausch',
        description: 'Nachbarschaftsraum mit Umkleide und Tauschregalen. Monatliche Tauschparties.',
        coordinates: [8.7382, 53.0425],
        address: {
            street: 'Kirchhuchtinger Landstraße 40',
            city: 'Bremen',
            postalCode: '28259',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [
                { day: 'wednesday', open: '16:00', close: '19:00' },
                { day: 'saturday', open: '10:00', close: '14:00' },
            ],
        },
        rules: 'Max. 5 Teile mitnehmen. Helfer*innen willkommen.',
        tags: ['kleidung', 'tauschparty'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: true,
        },
        contact: {
            phone: '+49 421 5550303',
            email: 'huchting@tausch.local',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'anna@shareapp.local',
    },
    {
        key: 'clothes-neukoelln',
        name: 'Kleiderschrank Neukölln',
        categoryKey: 'kleidertausch',
        description: 'Offenes Kleidungsregal im Ladenlokal. Besonders viele Kindergrößen.',
        coordinates: [13.4378, 52.4789],
        address: {
            street: 'Weserstraße 55',
            city: 'Berlin',
            postalCode: '12045',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: weekdaySchedule('12:00', '18:00') },
        rules: 'Bitte auf Kleiderbügeln hängen. Schuhe paarweise.',
        tags: ['kleidung', 'kinder', 'berlin'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'pending',
        verified: false,
        creatorEmail: 'emma@shareapp.local',
        needsConfirmations: true,
    },
    // Trinkwasser
    {
        key: 'water-marktplatz',
        name: 'Trinkbrunnen Marktplatz',
        categoryKey: 'trinkwasser',
        description: 'Öffentlicher Trinkbrunnen am Bremer Marktplatz. Kostenloses Leitungswasser.',
        coordinates: [8.8075, 53.0758],
        address: {
            street: 'Am Markt 1',
            city: 'Bremen',
            postalCode: '28195',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Bitte sparsam nutzen. Im Winter ggf. außer Betrieb.',
        tags: ['wasser', 'refill', 'öffentlich'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: true,
        creatorEmail: 'felix@shareapp.local',
    },
    {
        key: 'water-refill-cafe',
        name: 'Refill-Partner Café Weser',
        categoryKey: 'trinkwasser',
        description: 'Café füllt kostenlos Trinkflaschen auf. Auf Refill-Aufkleber achten.',
        coordinates: [8.8124, 53.0782],
        address: {
            street: 'Sögestraße 18',
            city: 'Bremen',
            postalCode: '28195',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: weekdaySchedule('09:00', '18:00') },
        rules: 'Eigene Flasche mitbringen. Während der Öffnungszeiten.',
        tags: ['refill', 'café', 'wasser'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: false,
        },
        contact: {
            email: 'info@cafeweser.local',
            website: 'cafeweser.local',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'felix@shareapp.local',
    },
    {
        key: 'water-tiergarten',
        name: 'Trinkbrunnen Tiergarten',
        categoryKey: 'trinkwasser',
        description: 'Brunnen am Wegesrand im Berliner Tiergarten – ideal für Spaziergänger.',
        coordinates: [13.3501, 52.5145],
        address: {
            street: 'Straße des 17. Juni',
            city: 'Berlin',
            postalCode: '10557',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Nur Trinkwasserzapfung. Kein Abwasch.',
        tags: ['wasser', 'park', 'berlin'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: false,
        creatorEmail: 'david@shareapp.local',
    },
    // Reparaturcafé
    {
        key: 'repair-bremen',
        name: 'Reparaturcafé Bremen Mitte',
        categoryKey: 'reparaturcafe',
        description:
            'Ehrenamtliche helfen bei Elektro, Textil und Fahrrad. Werkzeuge und Kenntnisse teilen.',
        coordinates: [8.8051, 53.0812],
        address: {
            street: 'Am Dom 4',
            city: 'Bremen',
            postalCode: '28195',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [{ day: 'saturday', open: '10:00', close: '14:00' }],
        },
        rules: 'Gerät mitbringen. Keine Garantie. Spende für Material willkommen.',
        tags: ['reparatur', 'elektro', 'fahrrad'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: true,
        },
        contact: {
            email: 'repair@bremen.local',
            phone: '+49 421 5550404',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'david@shareapp.local',
    },
    {
        key: 'repair-horn',
        name: 'Näh- und Flickstube Horn',
        categoryKey: 'reparaturcafe',
        description: 'Textilreparatur und Upcycling-Workshop. Nähmaschinen vor Ort.',
        coordinates: [8.8688, 53.0944],
        address: {
            street: 'Leher Heerstraße 12',
            city: 'Bremen',
            postalCode: '28359',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [
                { day: 'tuesday', open: '17:00', close: '20:00' },
                { day: 'thursday', open: '17:00', close: '20:00' },
            ],
        },
        rules: 'Stoffe und Garne teilweise vorhanden. Eigenes Material bevorzugt.',
        tags: ['nähen', 'textil', 'upcycling'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: true,
        },
        contact: { email: 'flickstube@horn.local' },
        status: 'active',
        verified: true,
        creatorEmail: 'clara@shareapp.local',
    },
    {
        key: 'repair-wedding',
        name: 'Reparaturcafé Wedding',
        categoryKey: 'reparaturcafe',
        description: 'Offene Werkstatt für Kleingeräte und Möbel. Jeden 1. Sonntag im Monat.',
        coordinates: [13.3588, 52.5489],
        address: {
            street: 'Müllerstraße 88',
            city: 'Berlin',
            postalCode: '13349',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [{ day: 'sunday', open: '11:00', close: '15:00' }],
        },
        rules: 'Anmeldung empfohlen bei hohem Andrang.',
        tags: ['reparatur', 'berlin', 'werkstatt'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: true,
            accessibleParking: false,
        },
        contact: { phone: '+49 30 5550505' },
        status: 'pending',
        verified: false,
        creatorEmail: 'david@shareapp.local',
        needsConfirmations: true,
    },
    // Werkzeugverleih
    {
        key: 'tool-bremen',
        name: 'Leihladen Werkzeug Bremen',
        categoryKey: 'werkzeug',
        description:
            'Bibliothek der Dinge: Bohrmaschinen, Leiter, Partygeschirr und mehr gegen Pfand ausleihen.',
        coordinates: [8.8255, 53.0699],
        address: {
            street: 'Vor dem Steintor 10',
            city: 'Bremen',
            postalCode: '28203',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: [
                ...weekdaySchedule('14:00', '19:00'),
                { day: 'saturday', open: '10:00', close: '14:00' },
            ],
        },
        rules: 'Mitgliedschaft oder Tagesausweis nötig. Gerät gereinigt zurückgeben.',
        tags: ['verleih', 'werkzeug', 'bibliothek-der-dinge'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: true,
        },
        contact: {
            email: 'verleih@bremen.local',
            website: 'leihladen-bremen.local',
            phone: '+49 421 5550606',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'test@example.com',
    },
    {
        key: 'tool-garten',
        name: 'Gartengeräte-Sharing Blockland',
        categoryKey: 'werkzeug',
        description: 'Rasenmäher, Schubkarren und Gartenscheren für die Nachbarschaft.',
        coordinates: [8.7501, 53.1215],
        address: {
            street: 'Wümmeweg 3',
            city: 'Bremen',
            postalCode: '28719',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: fullWeekSchedule('09:00', '18:00') },
        rules: 'WhatsApp-Gruppe für Buchung. Benzin selbst tanken.',
        tags: ['garten', 'verleih', 'nachbarschaft'],
        accessibility: {
            wheelchairAccessible: false,
            accessibleToilet: false,
            accessibleParking: true,
        },
        contact: { email: 'garten@blockland.local' },
        status: 'active',
        verified: false,
        creatorEmail: 'emma@shareapp.local',
    },
    {
        key: 'tool-moabit',
        name: 'Tool Library Moabit',
        categoryKey: 'werkzeug',
        description: 'Gemeinschaftliche Werkzeugausleihe im Stadtteilladen Moabit.',
        coordinates: [13.3399, 52.5288],
        address: {
            street: 'Turmstraße 21',
            city: 'Berlin',
            postalCode: '10559',
            country: 'Deutschland',
        },
        openingHours: {
            is24_7: false,
            schedule: weekdaySchedule('16:00', '20:00'),
        },
        rules: 'Ausweis hinterlegen. Max. 7 Tage Leihdauer.',
        tags: ['werkzeug', 'berlin', 'verleih'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: false,
        },
        contact: { email: 'tools@moabit.local' },
        status: 'active',
        verified: true,
        creatorEmail: 'david@shareapp.local',
    },
    // Community-Garten
    {
        key: 'garden-werder',
        name: 'Community-Garten Stadtwerder',
        categoryKey: 'garten',
        description:
            'Gemeinschaftlich bewirtschaftete Beete. Überschuss-Ernte und Saatgut zum Tauschen.',
        coordinates: [8.8211, 53.0588],
        address: {
            street: 'Werderstraße 55',
            city: 'Bremen',
            postalCode: '28199',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: fullWeekSchedule('08:00', '20:00') },
        rules: 'Bio-Anbau. Hunde anleinen. Ernte nur mit Beetpat*in absprechen.',
        tags: ['garten', 'saatgut', 'ernte'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: false,
            accessibleParking: true,
        },
        contact: {
            email: 'stadtwerder@garten.local',
            website: 'stadtwerder-garten.local',
        },
        status: 'active',
        verified: true,
        creatorEmail: 'emma@shareapp.local',
    },
    {
        key: 'garden-saatgut',
        name: 'Saatgut-Tauschregal Überseestadt',
        categoryKey: 'garten',
        description: 'Kleines Regal für Samen und Stecklinge im Community-Hub Überseestadt.',
        coordinates: [8.7688, 53.0833],
        address: {
            street: 'Konsul-Smidt-Straße 8',
            city: 'Bremen',
            postalCode: '28217',
            country: 'Deutschland',
        },
        openingHours: { is24_7: true },
        rules: 'Samen beschriften (Sorte, Jahr). Keine invasiven Arten.',
        tags: ['saatgut', 'tausch', 'pflanzen'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: false,
        },
        contact: {},
        status: 'active',
        verified: true,
        creatorEmail: 'emma@shareapp.local',
    },
    {
        key: 'garden-tempelhof',
        name: 'Gemeinschaftsgarten Tempelhofer Feld',
        categoryKey: 'garten',
        description: 'Offene Beete am Feld. Workshops zu Kompost und Urban Gardening.',
        coordinates: [13.4012, 52.4725],
        address: {
            street: 'Tempelhofer Damm 1',
            city: 'Berlin',
            postalCode: '12101',
            country: 'Deutschland',
        },
        openingHours: { is24_7: false, schedule: fullWeekSchedule('07:00', '21:00') },
        rules: 'Öffentliche Flächen nicht zäunen. Müll mitnehmen.',
        tags: ['garten', 'berlin', 'urban-gardening'],
        accessibility: {
            wheelchairAccessible: true,
            accessibleToilet: true,
            accessibleParking: true,
        },
        contact: { email: 'tempelhof@garten.local' },
        status: 'active',
        verified: false,
        creatorEmail: 'felix@shareapp.local',
    },
]
