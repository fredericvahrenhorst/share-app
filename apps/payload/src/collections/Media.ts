import { CollectionConfig } from 'payload/types';
import type { ImageSize } from 'payload/types'
import path from 'path';
import { anyone } from '../access/anyone'

const sizes = {
	xs: 320,
	sm: 640,
	md: 960,
	lg: 1200,
	xl: 1600,
	xxl: 2000,
	xxxl: 2400,
}

const Media: CollectionConfig = {
	slug: 'media',
    labels: {
        singular: {
            en: 'Media',
            de: 'Datei',
        },
        plural: {
            en: 'Media',
            de: 'Dateien',
        },
    },
	admin: {
		group: {
            en: 'Media',
            de: 'Medien',
        }
	},
	access: {
		read: anyone,
	},
	upload: {
		staticDir: path.resolve(__dirname, '../../media'),
		adminThumbnail: 'xs',
		imageSizes: [
            ...Object.entries(sizes).map(([name, width]) => {
                return {
                    name,
                    width,
                    formatOptions: {
                    	format: 'avif' as ImageSize['formatOptions']['format'],
                    	options: {
                    	  nearLossless: true,
                    	  quality: 75,
                    	  force: true,
                    	},
                    },
                }
            }),
            {
                name: 'opengraph',
                width: 1200,
                height: 630,
            },
		],
		mimeTypes: ['image/jpeg', 'image/png', 'image/avif', 'image/svg+xml', 'image/svg', 'image/gif'],
	},
	fields: [
		{
			name: 'alt',
			label: 'Alt Text',
			type: 'text',
		},
		{
			name: 'description',
			label: 'Description',
			type: 'text',
			admin: {
			    description: 'Für sehbehinderte Benutzer mit Bildschirmleseprogrammen ist dies aussagekräftiger als eine Überschrift.',
			},
		},
	]
}

export default Media;
