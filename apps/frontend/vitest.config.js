import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@test/shared': path.resolve(__dirname, '../../packages/shared'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/**/*.{test,spec}.{js,ts}'],
    },
})
