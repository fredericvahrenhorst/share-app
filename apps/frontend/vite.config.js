import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import eslint from 'vite-plugin-eslint';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        legacy(),
        // eslint()
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'ShareApp',
                short_name: 'ShareApp',
                theme_color: '#22c55e',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/img/icons/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/img/icons/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'mapbox-tiles',
                            expiration: {
                                maxEntries: 500,
                                maxAgeSeconds: 60 * 60 * 24 * 30,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\/api\/.*/i,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24,
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@test/shared': path.resolve(__dirname, '../../packages/shared'),
        },
    },
    define: {
        'process.env': JSON.stringify(dotenv.config({ path: '.env' }).parsed),
    },
    server: {
        host: true, // Netzwerkzugriff aktivieren (entspricht --host)
    },
});
